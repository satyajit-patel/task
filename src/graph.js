import Groq from 'groq-sdk';
import { product_search, size_recommender, eta, order_lookup, order_cancel } from './tools.js';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

class CommerceAgent {
  constructor() {
    this.trace = {
      intent: '',
      tools_called: [],
      evidence: [],
      policy_decision: null,
      final_message: ''
    };
  }

  // Router node - uses LLM to classify intent
  async router(userMessage) {
    const prompt = `Classify this user message into one of these intents:
- product_assist: for product search, recommendations, sizing, ETA questions
- order_help: for order lookup, cancellation requests
- other: for discount codes, general questions, or anything else

User message: "${userMessage}"

Respond with only the intent name.`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0
      });

      const intent = completion.choices[0]?.message?.content?.trim().toLowerCase();
      this.trace.intent = intent;
      return intent;
    } catch (error) {
      console.error('LLM Router error:', error);
      // Fallback to rule-based routing
      const message = userMessage.toLowerCase();
      if (message.includes('cancel') && (message.includes('order') || /a\d+/.test(message))) {
        this.trace.intent = 'order_help';
        return 'order_help';
      } else if (message.includes('dress') || message.includes('product') || 
                 message.includes('wedding') || message.includes('midi')) {
        this.trace.intent = 'product_assist';
        return 'product_assist';
      } else {
        this.trace.intent = 'other';
        return 'other';
      }
    }
  }

  // Tool Selector node - uses LLM to decide which tools to call
  async toolSelector(intent, userMessage) {
    if (intent === 'other') {
      this.trace.tools_called = [];
      return [];
    }

    const availableTools = {
      product_assist: ['product_search', 'size_recommender', 'eta'],
      order_help: ['order_lookup', 'order_cancel']
    };

    const tools = availableTools[intent] || [];
    
    const prompt = `Given this user message and intent, which tools should be called?
Available tools: ${tools.join(', ')}

User message: "${userMessage}"
Intent: ${intent}

Respond with a comma-separated list of tool names, or "none" if no tools needed.`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0
      });

      const response = completion.choices[0]?.message?.content?.trim();
      const selectedTools = response === 'none' ? [] : 
        response.split(',').map(t => t.trim()).filter(t => tools.includes(t));
      
      this.trace.tools_called = selectedTools;
      return selectedTools;
    } catch (error) {
      console.error('LLM Tool Selector error:', error);
      // Fallback logic
      const fallbackTools = [];
      if (intent === 'product_assist') {
        fallbackTools.push('product_search');
        if (userMessage.toLowerCase().includes('size')) fallbackTools.push('size_recommender');
        if (/\d{5,6}/.test(userMessage)) fallbackTools.push('eta');
      } else if (intent === 'order_help') {
        fallbackTools.push('order_lookup');
        if (userMessage.toLowerCase().includes('cancel')) fallbackTools.push('order_cancel');
      }
      this.trace.tools_called = fallbackTools;
      return fallbackTools;
    }
  }

  // Execute tools and gather evidence
  executeTools(tools, userMessage) {
    const evidence = [];
    
    for (const tool of tools) {
      switch (tool) {
        case 'product_search':
          const priceMatch = userMessage.match(/under\s*\$?(\d+)/i);
          const maxPrice = priceMatch ? parseInt(priceMatch[1]) : Infinity;
          const results = product_search(userMessage, maxPrice);
          evidence.push({ tool: 'product_search', results });
          break;
          
        case 'size_recommender':
          const sizeRec = size_recommender({ preference: 'fitted' });
          evidence.push({ tool: 'size_recommender', results: sizeRec });
          break;
          
        case 'eta':
          const zipMatch = userMessage.match(/(\d{5,6})/);
          if (zipMatch) {
            const etaResult = eta(zipMatch[1]);
            evidence.push({ tool: 'eta', results: etaResult });
          }
          break;
          
        case 'order_lookup':
          const orderMatch = userMessage.match(/order\s+([A-Z]\d+)/i);
          const emailMatch = userMessage.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
          if (orderMatch && emailMatch) {
            const order = order_lookup(orderMatch[1], emailMatch[1]);
            evidence.push({ tool: 'order_lookup', results: order });
          }
          break;
          
        case 'order_cancel':
          const orderIdMatch = userMessage.match(/order\s+([A-Z]\d+)/i);
          if (orderIdMatch) {
            const cancelResult = order_cancel(orderIdMatch[1]);
            evidence.push({ tool: 'order_cancel', results: cancelResult });
          }
          break;
      }
    }
    
    this.trace.evidence = evidence;
    return evidence;
  }

  // Policy Guard node - enforces policies
  policyGuard(intent, evidence) {
    if (intent === 'order_help') {
      const cancelEvidence = evidence.find(e => e.tool === 'order_cancel');
      if (cancelEvidence) {
        this.trace.policy_decision = {
          cancel_allowed: cancelEvidence.results.success,
          reason: cancelEvidence.results.reason || 'Within 60-minute window'
        };
      }
    } else if (intent === 'other') {
      this.trace.policy_decision = {
        refuse: true,
        reason: 'Non-existent discount code request'
      };
    }
    
    return this.trace.policy_decision;
  }

  // Responder node - uses LLM to compose final reply
  async responder(intent, evidence, policyDecision, userMessage) {
    const systemPrompt = `You are EvoAI, a helpful commerce assistant. Be concise, friendly, and never invent product data.

RULES:
- For product_assist: recommend max 2 products under user's price cap, include size rationale and ETA
- For order_help: enforce 60-minute cancellation policy strictly
- For other: refuse non-existent discount codes, suggest legitimate alternatives
- Always use only the evidence provided, never hallucinate data`;

    const evidenceText = evidence.map(e => 
      `${e.tool}: ${JSON.stringify(e.results)}`
    ).join('\n');

    const prompt = `User message: "${userMessage}"
Intent: ${intent}
Evidence from tools:
${evidenceText}

Policy decision: ${JSON.stringify(policyDecision)}

Compose a helpful response based only on the evidence provided.`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3
      });

      const message = completion.choices[0]?.message?.content?.trim();
      this.trace.final_message = message;
      return message;
    } catch (error) {
      console.error('LLM Responder error:', error);
      // Fallback to rule-based response
      return this.fallbackResponder(intent, evidence, policyDecision);
    }
  }

  // Fallback responder for when LLM fails
  fallbackResponder(intent, evidence, policyDecision) {
    let message = '';
    
    if (intent === 'product_assist') {
      const productEvidence = evidence.find(e => e.tool === 'product_search');
      const sizeEvidence = evidence.find(e => e.tool === 'size_recommender');
      const etaEvidence = evidence.find(e => e.tool === 'eta');
      
      if (productEvidence && productEvidence.results.length > 0) {
        message = `Based on your criteria, I found ${productEvidence.results.length} great option${productEvidence.results.length > 1 ? 's' : ''}:\n\n`;
        
        productEvidence.results.forEach((product, index) => {
          message += `${index + 1}. **${product.title}** - $${product.price}, ${product.color} color, available in ${product.sizes.join('/')}\n`;
        });
        
        if (sizeEvidence) {
          message += `\nFor size: ${sizeEvidence.results.rationale}\n`;
        }
        
        if (etaEvidence) {
          message += `\nETA to your zip: ${etaEvidence.results}\n`;
        }
      } else {
        message = "I couldn't find any products matching your criteria. Please try adjusting your price range or preferences.";
      }
      
    } else if (intent === 'order_help') {
      const orderEvidence = evidence.find(e => e.tool === 'order_lookup');
      const cancelEvidence = evidence.find(e => e.tool === 'order_cancel');
      
      if (!orderEvidence || !orderEvidence.results) {
        message = "I couldn't find an order with that ID and email combination. Please check your details and try again.";
      } else if (cancelEvidence) {
        if (cancelEvidence.results.success) {
          message = `I've successfully cancelled your order ${orderEvidence.results.order_id}. ${cancelEvidence.results.message}`;
        } else {
          message = `I'm unable to cancel order ${orderEvidence.results.order_id} as ${cancelEvidence.results.reason}. However, I can help you with:\n`;
          cancelEvidence.results.alternatives?.forEach(alt => {
            message += `- ${alt}\n`;
          });
        }
      }
      
    } else if (intent === 'other') {
      message = "I can't provide non-existent discount codes. However, I can suggest legitimate options like:\n- Sign up for our newsletter for 10% off\n- First-time customer discount\n- Seasonal promotions\n\nHow else can I help you with our products or orders?";
    }
    
    this.trace.final_message = message;
    return message;
  }

  // Main processing method
  async process(userMessage) {
    // Reset trace
    this.trace = {
      intent: '',
      tools_called: [],
      evidence: [],
      policy_decision: null,
      final_message: ''
    };

    try {
      // Execute graph nodes with LLM integration
      const intent = await this.router(userMessage);
      const tools = await this.toolSelector(intent, userMessage);
      const evidence = this.executeTools(tools, userMessage);
      const policyDecision = this.policyGuard(intent, evidence);
      const finalMessage = await this.responder(intent, evidence, policyDecision, userMessage);

      return {
        trace: this.trace,
        message: finalMessage
      };
    } catch (error) {
      console.error('Agent processing error:', error);
      return {
        trace: this.trace,
        message: "I'm sorry, I encountered an error processing your request. Please try again."
      };
    }
  }
}

export default CommerceAgent;
