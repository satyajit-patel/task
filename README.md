# EvoAI Commerce Assistant

A LangGraph-based AI agent for e-commerce product recommendations and order management with a Next.js UI.

## Live Demo  
[Click here to view](https://task-phi-azure.vercel.app/)

## Features

- **Product Assist**: Search products, size recommendations, ETA calculations
- **Order Management**: Secure order lookup and cancellation with 60-minute policy
- **Policy Enforcement**: Strict cancellation rules and guardrails
- **Real-time Chat UI**: Clean Tailwind CSS interface with debug traces

## Project Structure

```
/src                  # LangGraph agent + tools
  graph.js           # Main agent with Router, ToolSelector, PolicyGuard, Responder nodes
  tools.js           # Product search, order management, ETA tools
/data
  products.json      # Product catalog
  orders.json        # Order database
/prompts
  system.md          # System prompt with brand voice and rules
/tests
  run_tests.js       # Test runner for all 4 required scenarios
/app                 # Next.js app
  page.js            # Main chat interface
  api/chat/route.js  # API endpoint
  globals.css        # Tailwind styles
```

## Setup & Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run tests:**
   ```bash
   node tests/run_tests.js
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   Navigate to `http://localhost:3000`

## Agent Architecture

The LangGraph agent consists of 4 main nodes:

1. **Router** → Classifies intent: `product_assist`, `order_help`, or `other`
2. **ToolSelector** → Decides which tools to call based on intent
3. **PolicyGuard** → Enforces 60-minute cancellation rule and refusal patterns  
4. **Responder** → Composes final user reply from structured data

## Tools Available

- `product_search(query, price_max, tags)` - Search product catalog
- `size_recommender(user_inputs)` - M vs L size guidance
- `eta(zip)` - Shipping estimate by ZIP code
- `order_lookup(order_id, email)` - Secure order retrieval
- `order_cancel(order_id, timestamp)` - Policy-enforced cancellation

## Test Cases

The agent handles these scenarios:

1. **Product Assist**: "Wedding guest, midi, under $120 — I'm between M/L. ETA to 560001?"
2. **Order Cancellation (Allowed)**: "Cancel order A1003 — email mira@example.com"
3. **Order Cancellation (Blocked)**: "Cancel order A1002 — email alex@example.com"  
4. **Guardrail**: "Can you give me a discount code that doesn't exist?"

## Key Policies

- **60-minute cancellation window** - Orders can only be cancelled within 60 minutes of creation
- **Max 2 product recommendations** - Prevents overwhelming users
- **No data hallucination** - Only uses information from tool results
- **Price cap enforcement** - Respects user budget constraints

## JSON Trace Schema

Every response includes an internal trace:

```json
{
  "intent": "product_assist|order_help|other",
  "tools_called": ["tool1", "tool2"],
  "evidence": [{"tool": "name", "results": {}}],
  "policy_decision": {"cancel_allowed": true, "reason": "string"},
  "final_message": "string"
}
```

## Development

- Built with Next.js 15 and Tailwind CSS 4
- Pure JavaScript implementation (no external LLM required)
- Self-contained with mock data
- Deterministic responses for testing
