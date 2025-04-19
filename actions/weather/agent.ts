import { OpenAI } from 'openai';
import { tools } from './tools';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions.mjs';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const availableFunctions: { [key: string]: (args: any) => Promise<any> } = {
  getCurrentWeather: async ({}) => {
    const weather = {
      temperature: '75',
      unit: 'F',
      forecast: 'sunny',
    };
    return JSON.stringify(weather);
  },
  getLocation: async () => {
    return 'New York City, NY';
  },
};

export const agent = async (prompt: string) => {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content:
        "You are a helpful AI agent. Give highly specific answers based on the information you're provided. Prefer to gather information with the tools provided to you rather than giving basic, generic answers.",
    },
    { role: 'user', content: prompt },
  ];

  const MAX_ITERATIONS = 5;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    console.log(`Iteration #${i + 1}`);
    const response = openai.beta.chat.completions.runTools({
      model: 'gpt-3.5-turbo',
      messages,
      tools,
    });

    response.finalContent;

    const { finish_reason: finishReason, message } = response.choices[0];

    const { tool_calls: toolCalls } = message;
    console.log(toolCalls);

    if (message.content !== null) {
      messages.push({
        role: message.role,
        content: message.content,
      });
    }

    if (finishReason === 'stop') {
      console.log(message.content);
      console.log('Agent finished with task');
      return;
    } else if (finishReason === 'tool_calls') {
      for (const toolCall of toolCalls!) {
        const functionName = toolCall.function.name;
        const functionToCall =
          availableFunctions[functionName as keyof typeof availableFunctions];
        const functionResponse = await functionToCall(toolCall);

        console.log(functionResponse);
        messages.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          content: functionResponse,
        });
      }
    }
  }
};
