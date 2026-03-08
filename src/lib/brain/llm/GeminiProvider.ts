
import { LLMProvider, LLMResponse } from './LLMProvider';
import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiProvider implements LLMProvider {
  private ai: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenerativeAI(apiKey);
  }

  async generate(prompt: string, context: any): Promise<LLMResponse> {
    const model = this.ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const fullPrompt = `${prompt}\n\nContextual Data: ${JSON.stringify(context)}`;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return { text: response.text() };
  }
}
