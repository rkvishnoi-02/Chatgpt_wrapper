import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { GeminiProvider } from './providers/gemini';
import { LLMProvider, ModelType } from '../../types/llm';

export class LLMFactory {
  private static instance: LLMFactory;
  private providers: Map<string, LLMProvider>;

  private constructor() {
    this.providers = new Map();
  }

  public static getInstance(): LLMFactory {
    if (!LLMFactory.instance) {
      LLMFactory.instance = new LLMFactory();
    }
    return LLMFactory.instance;
  }
  public initializeProvider(provider: 'openai' | 'anthropic' | 'gemini', apiKey: string): void {
    switch (provider) {
      case 'openai':
        this.providers.set(provider, new OpenAIProvider(apiKey));
        break;
      case 'anthropic':
        this.providers.set(provider, new AnthropicProvider(apiKey));
        break;
      case 'gemini':
        this.providers.set(provider, new GeminiProvider(apiKey));
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
  public getProvider(model: ModelType): LLMProvider {
    // Determine provider based on model
    let provider: 'openai' | 'anthropic' | 'gemini';
    
    if (model.startsWith('gpt')) {
      provider = 'openai';
    } else if (model.startsWith('claude')) {
      provider = 'anthropic';
    } else if (model.startsWith('gemini')) {
      provider = 'gemini';
    } else {
      throw new Error(`Unsupported model: ${model}`);
    }
    
    const llmProvider = this.providers.get(provider);
    if (!llmProvider) {
      throw new Error(`Provider ${provider} not initialized. Please call initializeProvider first.`);
    }
    
    return llmProvider;
  }
}

// Utility functions for model selection
export const isOpenAIModel = (model: ModelType): boolean => {
  return model.startsWith('gpt');
};

export const isAnthropicModel = (model: ModelType): boolean => {
  return model.startsWith('claude');
};

export const isGeminiModel = (model: ModelType): boolean => {
  return model.startsWith('gemini');
};

// Export factory instance
export const llmFactory = LLMFactory.getInstance();