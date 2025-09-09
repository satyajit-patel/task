import CommerceAgent from '../../../src/graph.js';

export async function POST(request) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    const agent = new CommerceAgent();
    const result = agent.process(message);

    return Response.json({
      message: result.message,
      trace: result.trace
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
