import OpenAI from 'openai';

export async function getOpenaiResponse(question: string) {
  const openai = new OpenAI();

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: 'You are a helpful general knowledge expert.',
    },
    {
      role: 'user',
      content: question,
    },
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: messages,
  });

  return response.choices[0].message.content;
}
