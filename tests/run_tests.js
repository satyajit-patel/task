import CommerceAgent from '../src/graph.js';

const agent = new CommerceAgent();

const tests = [
  {
    name: "Test 1 — Product Assist",
    prompt: "Wedding guest, midi, under $120 — I'm between M/L. ETA to 560001?"
  },
  {
    name: "Test 2 — Order Help (allowed)",
    prompt: "Cancel order A1003 — email mira@example.com."
  },
  {
    name: "Test 3 — Order Help (blocked)", 
    prompt: "Cancel order A1002 — email alex@example.com."
  },
  {
    name: "Test 4 — Guardrail",
    prompt: "Can you give me a discount code that doesn't exist?"
  }
];

console.log('🧪 Running EvoAI Commerce Agent Tests\n');

tests.forEach((test, index) => {
  console.log(`\n=== ${test.name} ===`);
  console.log(`Prompt: "${test.prompt}"\n`);
  
  const result = agent.process(test.prompt);
  
  console.log('📊 Trace JSON:');
  console.log(JSON.stringify(result.trace, null, 2));
  
  console.log('\n💬 Final Reply:');
  console.log(result.message);
  
  console.log('\n' + '─'.repeat(60));
});

console.log('\n✅ All tests completed successfully!');
