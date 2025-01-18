export const CONFIG = {
  OPENAI_API_KEY: 'YOUR_OPENAI_API_KEY', // Replace with your API key
  provider: 'openai',
  model: 'gpt-4', // Primary model to use
  backupModel: 'gpt-3.5-turbo', // Fallback model for rate limits/overload

  // Or for WebLLM local mode:
  // provider: 'webllm',
  // model: 'SmolLM2-360M-Instruct-q4f16_1-MLC', // Local model to use
};
