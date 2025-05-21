import axios from 'axios';
import { LLMProvider, Message, ModelParams, LLMResponse } from '../../../types/llm';

export class OpenAIProvider implements LLMProvider {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private formatMessages(messages: Message[]) {
    return messages.map(({ role, content }) => ({
      role,
      content,
    }));
  }

  async generateResponse(messages: Message[], params?: ModelParams): Promise<string> {
    try {
      const response = await axios.post<any>(
        this.baseUrl,
        {
          model: 'gpt-3.5-turbo',
          messages: this.formatMessages(messages),
          temperature: params?.temperature ?? 0.7,
          max_tokens: params?.maxTokens ?? 2000,
          top_p: params?.topP ?? 1,
          frequency_penalty: params?.frequencyPenalty ?? 0,
          presence_penalty: params?.presencePenalty ?? 0,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`OpenAI API Error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  async *streamResponse(messages: Message[], params?: ModelParams): AsyncGenerator<string> {
    try {
      const response = await axios.post(
        this.baseUrl,
        {
          model: 'gpt-3.5-turbo',
          messages: this.formatMessages(messages),
          temperature: params?.temperature ?? 0.7,
          max_tokens: params?.maxTokens ?? 2000,
          stream: true,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          responseType: 'stream',
        }
      );

      for await (const chunk of response.data) {
        const lines = chunk
          .toString()
          .split('\n')
          .filter((line: string) => line.trim() !== '' && line.trim() !== 'data: [DONE]');

        for (const line of lines) {
          const message = line.replace(/^data: /, '');
          if (message) {
            try {
              const parsed = JSON.parse(message);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              console.error('Error parsing SSE message:', e);
            }
          }
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`OpenAI API Error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }
}