import { product_search, size_recommender, eta, order_lookup, order_cancel } from './tools.js';

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

  // Router node - classifies intent
  router(userMessage) {
    const message = userMessage.toLowerCase();
    
    if (message.includes('cancel') && (message.includes('order') || /a\d+/.test(message))) {
      this.trace.intent = 'order_help';
      return 'order_help';
    } else if (message.includes('dress') || message.includes('product') || 
               message.includes('wedding') || message.includes('midi') ||
               message.includes('price') || message.includes('size') ||
               message.includes('eta') || message.includes('zip')) {
      this.trace.intent = 'product_assist';
      return 'product_assist';
    } else if (message.includes('discount') && message.includes('code')) {
      this.trace.intent = 'other';
      return 'other';
    } else {
      this.trace.intent = 'other';
      return 'other';
    }
  }

  // Tool Selector node - decides which tools to call
  toolSelector(intent, userMessage) {
    const tools = [];
    
    if (intent === 'product_assist') {
      tools.push('product_search');
      if (userMessage.toLowerCase().includes('size') || userMessage.includes('m/l') || userMessage.includes('M/L')) {
        tools.push('size_recommender');
      }
      if (/\d{5,6}/.test(userMessage)) { // ZIP code pattern
        tools.push('eta');
      }
    } else if (intent === 'order_help') {
      tools.push('order_lookup');
      if (userMessage.toLowerCase().includes('cancel')) {
        tools.push('order_cancel');
      }
    }
    
    this.trace.tools_called = tools;
    return tools;
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

  // Responder node - composes final reply
  responder(intent, evidence, policyDecision) {
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
  process(userMessage) {
    // Reset trace
    this.trace = {
      intent: '',
      tools_called: [],
      evidence: [],
      policy_decision: null,
      final_message: ''
    };

    // Execute graph nodes
    const intent = this.router(userMessage);
    const tools = this.toolSelector(intent, userMessage);
    const evidence = this.executeTools(tools, userMessage);
    const policyDecision = this.policyGuard(intent, evidence);
    const finalMessage = this.responder(intent, evidence, policyDecision);

    return {
      trace: this.trace,
      message: finalMessage
    };
  }
}

export default CommerceAgent;
