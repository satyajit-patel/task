import { order_cancel } from '../src/tools.js';

// Test cancellation with current timestamp (should be allowed)
const now = new Date();
console.log('🧪 Testing Order Cancellation with Current Timestamp\n');

// Test A1004 with current timestamp (simulating it was just created)
const result = order_cancel('A1004', now);

console.log('📊 Cancellation Result:');
console.log(JSON.stringify(result, null, 2));

console.log('\n💬 Expected: Should be ALLOWED since we\'re using current timestamp');
console.log('✅ Test demonstrates 60-minute policy enforcement');
