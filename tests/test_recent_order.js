import CommerceAgent from '../src/graph.js';
import { order_cancel } from '../src/tools.js';

// Test with simulated recent timestamp (30 minutes ago)
const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

console.log('🧪 Testing Recent Order Cancellation (Allowed)\n');

// Test the order_cancel function directly with recent timestamp
const result = order_cancel('A1003', thirtyMinutesAgo);
console.log('Direct tool test result:');
console.log(JSON.stringify(result, null, 2));

console.log('\n' + '─'.repeat(60));

// Test full agent flow
const agent = new CommerceAgent();

// Override the order_cancel tool to use our simulated timestamp
const originalExecuteTools = agent.executeTools;
agent.executeTools = function(tools, userMessage) {
  const evidence = [];
  
  for (const tool of tools) {
    switch (tool) {
      case 'order_cancel':
        const orderIdMatch = userMessage.match(/order\s+([A-Z]\d+)/i);
        if (orderIdMatch) {
          // Use simulated recent timestamp
          const cancelResult = order_cancel(orderIdMatch[1], thirtyMinutesAgo);
          evidence.push({ tool: 'order_cancel', results: cancelResult });
        }
        break;
      default:
        // Use original logic for other tools
        return originalExecuteTools.call(this, tools, userMessage);
    }
  }
  
  // Merge with original evidence for other tools
  const originalEvidence = originalExecuteTools.call(this, tools.filter(t => t !== 'order_cancel'), userMessage);
  this.trace.evidence = [...originalEvidence, ...evidence];
  return [...originalEvidence, ...evidence];
};

const agentResult = agent.process("Cancel order A1003 — email mira@example.com.");

console.log('\n📊 Full Agent Trace JSON:');
console.log(JSON.stringify(agentResult.trace, null, 2));

console.log('\n💬 Final Reply:');
console.log(agentResult.message);
