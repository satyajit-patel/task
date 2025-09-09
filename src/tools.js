import fs from 'fs';
import path from 'path';

// Load data
const loadJSON = (filename) => {
  const filePath = path.join(process.cwd(), 'data', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const products = loadJSON('products.json');
const orders = loadJSON('orders.json');

export function product_search(query, price_max = Infinity, tags = []) {
  const queryLower = query.toLowerCase();
  
  return products.filter(product => {
    const matchesPrice = product.price <= price_max;
    const matchesQuery = product.title.toLowerCase().includes(queryLower) ||
                        product.tags.some(tag => queryLower.includes(tag));
    const matchesTags = tags.length === 0 || tags.some(tag => product.tags.includes(tag));
    
    return matchesPrice && matchesQuery && matchesTags;
  }).slice(0, 2); // Return max 2 products
}

export function size_recommender(user_inputs) {
  // Simple heuristic for size recommendation
  const { preference = 'fitted' } = user_inputs;
  
  if (preference.toLowerCase().includes('loose') || preference.toLowerCase().includes('relaxed')) {
    return { recommendation: 'L', rationale: 'Recommended L for a relaxed, comfortable fit' };
  } else if (preference.toLowerCase().includes('tight') || preference.toLowerCase().includes('fitted')) {
    return { recommendation: 'M', rationale: 'Recommended M for a fitted, tailored look' };
  } else {
    return { recommendation: 'M', rationale: 'Recommended M as a versatile middle option' };
  }
}

export function eta(zip) {
  // Simple rule-based ETA
  const zipCode = String(zip);
  
  if (zipCode.startsWith('1') || zipCode.startsWith('2')) {
    return '2-3 business days';
  } else if (zipCode.startsWith('5') || zipCode.startsWith('6')) {
    return '3-5 business days';
  } else {
    return '4-6 business days';
  }
}

export function order_lookup(order_id, email) {
  const order = orders.find(o => o.order_id === order_id && o.email === email);
  return order || null;
}

export function order_cancel(order_id, timestamp = new Date()) {
  const order = orders.find(o => o.order_id === order_id);
  
  if (!order) {
    return { success: false, reason: 'Order not found' };
  }
  
  const createdAt = new Date(order.created_at);
  const now = new Date(timestamp);
  const diffMinutes = (now - createdAt) / (1000 * 60);
  
  if (diffMinutes <= 60) {
    return { 
      success: true, 
      message: 'Order cancelled successfully. Refund will be processed in 3-5 business days.' 
    };
  } else {
    return { 
      success: false, 
      reason: 'Cancellation window expired (>60 minutes)',
      alternatives: [
        'Edit shipping address if not yet shipped',
        'Process store credit for future purchases', 
        'Connect with support team for special circumstances'
      ]
    };
  }
}
