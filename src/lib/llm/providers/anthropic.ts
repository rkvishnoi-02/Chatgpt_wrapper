import axios from 'axios';
import { LLMProvider, Message, ModelParams, LLMResponse } from '../../../types/llm';

export class AnthropicProvider implements LLMProvider {
  private apiKey: string;
  private baseUrl = 'https://api.anthropic.com/v1/messages';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private formatMessages(messages: Message[]) {
    // Anthropic expects a simpler format
    return messages.map(({ role, content }) => ({
      role: role === 'assistant' ? 'assistant' : 'user',
      content,
    }));
  }

  async generateResponse(messages: Message[], params?: ModelParams): Promise<string> {
    try {
      const response = await axios.post<any>(
        this.baseUrl,
        {
          model: 'claude-2',
          messages: this.formatMessages(messages),
          max_tokens: params?.maxTokens ?? 2000,
          temperature: params?.temperature ?? 0.7,
          top_p: params?.topP ?? 1,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
          },
        }
      );

      return response.data.content[0].text;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Anthropic API Error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  async *streamResponse(messages: Message[], params?: ModelParams): AsyncGenerator<string> {
    try {
      const response = await axios.post(
        this.baseUrl,
        {
          model: 'claude-2',
          messages: this.formatMessages(messages),
          max_tokens: params?.maxTokens ?? 2000,
          temperature: params?.temperature ?? 0.7,
          stream: true,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
          },
          responseType: 'stream',
        }
      );

      for await (const chunk of response.data) {
        const lines = chunk
          .toString()
          .split('\n')
          .filter((line: string) => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'content_block_delta' && data.delta?.text) {
                yield data.delta.text;
              }
            } catch (e) {
              console.error('Error parsing SSE message:', e);
            }
          }
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Anthropic API Error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }
}