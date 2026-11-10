import { AIProvider } from './types';
import { GeminiAIProvider } from './gemini-provider';
import { OpenAICompatibleAIProvider } from './openai-compatible';
import { HeuristicAIProvider } from './heuristic-provider';

export * from './types';
export * from './heuristic-provider';
export * from './gemini-provider';
export * from './openai-compatible';

let cachedProvider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  const requestedProvider = (process.env.AI_PROVIDER || '').toLowerCase().trim();

  if (requestedProvider === 'heuristic' || requestedProvider === 'mock') {
    cachedProvider = new HeuristicAIProvider();
    return cachedProvider;
  }

  if (requestedProvider === 'gemini') {
    cachedProvider = new GeminiAIProvider();
    return cachedProvider;
  }

  if (requestedProvider === 'groq') {
    cachedProvider = new OpenAICompatibleAIProvider({
      name: 'groq',
      baseURL: 'https://api.groq.com/openai/v1',
      model: process.env.GROQ_MODEL || 'llama-3.2-11b-vision-preview'
    });
    return cachedProvider;
  }

  if (requestedProvider === 'openrouter') {
    cachedProvider = new OpenAICompatibleAIProvider({
      name: 'openrouter',
      baseURL: 'https://openrouter.ai/api/v1',
      model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-11b-vision-instruct:free'
    });
    return cachedProvider;
  }

  // AUTO-DETECTION HIERARCHY
  if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith('AIzaSy_placeholder')) {
    cachedProvider = new GeminiAIProvider();
    return cachedProvider;
  }

  if (process.env.GROQ_API_KEY) {
    cachedProvider = new OpenAICompatibleAIProvider({
      name: 'groq',
      baseURL: 'https://api.groq.com/openai/v1',
      model: process.env.GROQ_MODEL || 'llama-3.2-11b-vision-preview'
    });
    return cachedProvider;
  }

  if (process.env.OPENROUTER_API_KEY) {
    cachedProvider = new OpenAICompatibleAIProvider({
      name: 'openrouter',
      baseURL: 'https://openrouter.ai/api/v1',
      model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-11b-vision-instruct:free'
    });
    return cachedProvider;
  }

  // Zero-cost, zero-key safe default
  cachedProvider = new HeuristicAIProvider();
  return cachedProvider;
}
