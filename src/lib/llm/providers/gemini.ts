import { LLMProvider, Message, ModelParams, MessageContent } from '../../../types/llm';

interface GeminiInputContent {
  text?: string;
  inlineData?: {
    data: string;
    mimeType: string;
  };
}

export class GeminiProvider implements LLMProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    
    this.apiKey = apiKey;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1';
    console.log('Initializing Gemini provider...');
  }
  private async generateWithDirectAPI(content: string, model: string = 'gemini-2.0-flash'): Promise<string> {
    try {
      // Use v1 for gemini-2.0-flash, v1 for others
      let baseUrl = this.baseUrl;
      let modelName = model;
      if (model === 'gemini-2.0-flash') {
        baseUrl = 'https://generativelanguage.googleapis.com/v1';
        modelName = 'gemini-2.0-flash';
      } else {
        baseUrl = 'https://generativelanguage.googleapis.com/v1';
        modelName = 'gemini-2.0-flash';
      }
      const url = `${baseUrl}/models/${modelName}:generateContent?key=${this.apiKey}`;
      console.log('Making API request to:', url);

      const requestBody = {
        contents: [{
          parts: [{
            text: content
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 1,
          topK: 1,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE"
          }
        ]
      };

      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const responseText = await response.text();
      console.log('Raw API response:', responseText);

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}\n${responseText}`);
      }

      const data = JSON.parse(responseText);
      console.log('Parsed API response:', JSON.stringify(data, null, 2));
      
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }

      if (data.promptFeedback?.blockReason) {
        throw new Error(`Content blocked: ${data.promptFeedback.blockReason}`);
      }
      
      throw new Error('Invalid response format from Gemini API');
    } catch (error) {
      console.error('Error in direct API call:', error);
      throw error;
    }
  }
  private formatMessagesForAPI(messages: Message[]): string {
    const formattedMessages = messages.map(msg => {
      const role = msg.role === 'assistant' ? 'model' : msg.role;
      let content = '';
      
      if (typeof msg.content === 'string') {
        content = msg.content;
      } else if (Array.isArray(msg.content)) {
        content = msg.content
          .map(item => item.type === 'text' ? item.text : '[Image]')
          .join(' ');
      } else {
        content = msg.content.type === 'text' ? msg.content.text : '[Image]';
      }
      
      return `${role}: ${content}`;
    });

    const prompt = formattedMessages.join('\n\nHuman: ');
    console.log('Formatted prompt:', prompt);
    return prompt;
  }

  async generateResponse(messages: Message[], params?: ModelParams): Promise<string> {
    try {
      // Extract model name from params or fallback to gemini-2.0-flash
      const model = (params as any)?.model || 'gemini-2.0-flash';
      console.log('Generating response with Gemini...', { 
        messageCount: messages.length, 
        params, model
      });
      const formattedContent = this.formatMessagesForAPI(messages);
      return await this.generateWithDirectAPI(formattedContent, model);
    } catch (error) {
      console.error('Error in Gemini generateResponse:', error);
      throw error;
    }
  }

  async *streamResponse(messages: Message[], params?: ModelParams): AsyncGenerator<string> {
    try {
      console.log('Streaming response with Gemini...');
      const response = await this.generateResponse(messages, params);
      
      // Simulate streaming since the direct API doesn't support it
      const chunks = response.split(' ');
      for (const chunk of chunks) {
        yield chunk + ' ';
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } catch (error) {
      console.error('Error in Gemini streamResponse:', error);
      throw error;
    }
  }
}
