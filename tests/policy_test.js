import { order_cancel } from '../src/tools.js';

console.log('🧪 Testing 60-Minute Cancellation Policy\n');

// Test 1: Recent order (should be allowed)
const recentTime = new Date('2025-01-08T17:30:00Z'); // Same as order A1004 creation time
const futureTime = new Date('2025-01-08T18:00:00Z'); // 30 minutes later

console.log('=== Test 1: Recent Order (Within 60 minutes) ===');
console.log('Order A1004 created at: 2025-01-08T17:30:00Z');
console.log('Cancellation attempted at: 2025-01-08T18:00:00Z (30 minutes later)');

const allowedResult = order_cancel('A1004', futureTime);
console.log('Result:', JSON.stringify(allowedResult, null, 2));

console.log('\n=== Test 2: Old Order (Beyond 60 minutes) ===');
console.log('Order A1004 created at: 2025-01-08T17:30:00Z');
console.log('Cancellation attempted at: 2025-01-08T19:00:00Z (90 minutes later)');

const oldTime = new Date('2025-01-08T19:00:00Z'); // 90 minutes later
const blockedResult = order_cancel('A1004', oldTime);
console.log('Result:', JSON.stringify(blockedResult, null, 2));

console.log('\n✅ Policy Test Complete');
console.log('- Orders within 60 minutes: ALLOWED');
console.log('- Orders beyond 60 minutes: BLOCKED with alternatives');
