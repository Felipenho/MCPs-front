// src/ai/flows/format-mcp-output.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for formatting MCP server output using an AI model.
 *
 * - formatMcpOutput - A function that formats MCP server output for improved readability.
 * - FormatMcpOutputInput - The input type for the formatMcpOutput function.
 * - FormatMcpOutputOutput - The return type for the formatMcpOutput function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FormatMcpOutputInputSchema = z.object({
  mcpOutput: z.string().describe('The raw output from the MCP server.'),
});
export type FormatMcpOutputInput = z.infer<typeof FormatMcpOutputInputSchema>;

const FormatMcpOutputOutputSchema = z.object({
  formattedOutput: z
    .string()
    .describe('The AI-formatted output for improved readability.'),
});
export type FormatMcpOutputOutput = z.infer<typeof FormatMcpOutputOutputSchema>;

export async function formatMcpOutput(input: FormatMcpOutputInput): Promise<FormatMcpOutputOutput> {
  return formatMcpOutputFlow(input);
}

const formatMcpOutputPrompt = ai.definePrompt({
  name: 'formatMcpOutputPrompt',
  input: {schema: FormatMcpOutputInputSchema},
  output: {schema: FormatMcpOutputOutputSchema},
  prompt: `You are an expert at formatting output from an MCP (Model Context Protocol) server to improve readability and comprehension for users.

      Take the raw MCP server output provided below and format it to be more easily understood, using markdown formatting, natural language explanations, and any other techniques to improve clarity.

      Raw MCP Server Output:
      {{mcpOutput}}`,
});

const formatMcpOutputFlow = ai.defineFlow(
  {
    name: 'formatMcpOutputFlow',
    inputSchema: FormatMcpOutputInputSchema,
    outputSchema: FormatMcpOutputOutputSchema,
  },
  async input => {
    const {output} = await formatMcpOutputPrompt(input);
    return output!;
  }
);
