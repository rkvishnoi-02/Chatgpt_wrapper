import { NextRequest, NextResponse } from 'next/server';
import { Message, ModelParams, ModelType } from '@/types/llm';
import { RateLimitConfig } from '@/types/config';
import { LLMFactory } from '@/lib/llm';

// Rate limiting configuration
const rateLimitConfig: RateLimitConfig = {
  requestsPerWindow: Number(process.env.RATE_LIMIT_REQUESTS) || 50,
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
};

// In-memory store for rate limiting
const rateLimit = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimit.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or initialize rate limit for user
    rateLimit.set(ip, {
      count: 1,
      resetTime: now + rateLimitConfig.windowMs,
    });
    return true;
  }

  if (userLimit.count >= rateLimitConfig.requestsPerWindow) {
    return false;
  }

  // Increment request count
  userLimit.count += 1;
  return true;
}

export async function POST(req: NextRequest) {  console.log('=== CHAT API REQUEST RECEIVED ===');
  // Force recompilation
  try {
    // Get client IP for rate limiting
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
    console.log('Client IP:', ip);

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await req.json();
    console.log('Received request:', JSON.stringify(body, null, 2));
    
    const { messages, model, params, stream = true } = body as {
      messages: Message[];
      model: ModelType;
      params?: ModelParams;
      stream?: boolean;
    };

    // Validate request
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid messages array' },
        { status: 400 }
      );
    }

    if (!model) {
      return NextResponse.json(
        { error: 'Model type is required' },
        { status: 400 }
      );
    }

    // Get LLM provider factory
    const llmFactory = LLMFactory.getInstance();

    // Determine provider type and API key
    let providerType: 'openai' | 'anthropic' | 'gemini';
    let apiKey: string | undefined;

    if (model.startsWith('gpt')) {
      providerType = 'openai';
      apiKey = process.env.OPENAI_API_KEY;
    } else if (model.startsWith('claude')) {
      providerType = 'anthropic';
      apiKey = process.env.ANTHROPIC_API_KEY;
    } else if (model.startsWith('gemini')) {
      providerType = 'gemini';
      apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      console.log('Using Gemini with API key:', apiKey ? 'Key present' : 'Key missing');
    } else {
      return NextResponse.json(
        { error: `Unsupported model: ${model}` },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: `API key for ${providerType} is not configured.` },
        { status: 500 }
      );
    }    // Initialize the provider with the API key
    console.log(`Initializing ${providerType} provider...`);
    try {
      // Always reinitialize to avoid singleton issues in development
      llmFactory.initializeProvider(providerType, apiKey);
      console.log(`${providerType} provider initialized successfully`);
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Unknown initialization error';
      console.error('Error initializing provider:', error);
      return NextResponse.json(
        { error: `Failed to initialize ${providerType} provider: ${error}` },
        { status: 500 }
      );
    }    
    console.log(`About to get provider for model: ${model}`);
    let provider;
    try {
      provider = llmFactory.getProvider(model);
      console.log(`Retrieved provider for model ${model}:`, provider ? 'Success' : 'Failed');
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Unknown provider error';
      console.error('Error getting provider:', error);
      return NextResponse.json(
        { error: `Failed to get provider: ${error}` },
        { status: 500 }
      );
    }

    // For Gemini, include model in params as any so provider can pick it up
    let modelParams = params;
    if (providerType === 'gemini') {
      modelParams = { ...(params as any), model };
    }    // Handle streaming vs non-streaming requests
    if (stream) {
      console.log('Processing streaming request...');
      return handleStreamingRequest(provider, messages, modelParams);
    } else {
      console.log('Processing non-streaming request...');
      return handleRegularRequest(provider, messages, modelParams, model);
    }
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Unknown error occurred';
    console.error('Chat API Error:', error);
    
    return NextResponse.json(
      { error },
      { status: 500 }
    );
  }
}

async function handleStreamingRequest(provider: any, messages: Message[], modelParams: any) {
  console.log('=== STARTING STREAMING REQUEST ===');
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {      try {
        console.log('Initializing streaming response...');        console.log('Provider instance:', provider);
        console.log('Provider type:', typeof provider);
        console.log('Provider methods:', Object.getOwnPropertyNames(provider).filter(p => typeof provider[p] === 'function'));
        console.log('Has generateStreamingResponse method:', typeof provider.generateStreamingResponse === 'function');
        
        // Use the correct streaming method
        const streamGenerator = provider.generateStreamingResponse(messages, modelParams);
        
        for await (const chunk of streamGenerator) {
          console.log('Streaming chunk received:', chunk);
          
          // Send in proper SSE format
          const data = `data: ${JSON.stringify({ content: chunk })}\n\n`;
          controller.enqueue(encoder.encode(data));
        }
        
        console.log('Streaming complete, sending done signal');
        // Send completion signal
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        console.error('Streaming error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Streaming error';
        const data = `data: ${JSON.stringify({ error: errorMessage })}\n\n`;
        controller.enqueue(encoder.encode(data));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

async function handleRegularRequest(provider: any, messages: Message[], modelParams: any, model: string) {
  // Generate response
  console.log(`Generating response with ${model} for ${messages.length} messages`);
  let response: string;
  try {
    response = await provider.generateResponse(messages, modelParams);
    console.log('Response received:', response ? response.substring(0, 100) + "..." : "Empty response");
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Unknown generation error';
    console.error('Error generating response:', error);
    return NextResponse.json(
      { error: `Failed to generate response: ${error}` },
      { status: 500 }
    );
  }

  if (!response) {
    return NextResponse.json(
      { error: 'No response generated' },
      { status: 500 }
    );
  }

  return NextResponse.json({ response });
}

export async function GET() {
  return NextResponse.json({
    models: ['gpt-3.5-turbo', 'gpt-4', 'claude-2', 'claude-instant', 'gemini-2.0-flash', 'gemini-2.0-flash-vision']
  });
}