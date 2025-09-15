import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {ollama} from 'ollama';

export const ai = genkit({
  plugins: [
    googleAI(),
    ollama({
      models: [{name: 'llama3'}],
    }),
  ],
  model: 'ollama/llama3',
});
