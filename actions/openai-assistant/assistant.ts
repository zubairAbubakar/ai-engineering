'use server';

// import { openai } from '../openaiConfig';
import OpenAI from 'openai';
import * as fs from 'fs';
import path from 'path';
import { FileCitationAnnotation } from 'openai/resources/beta/threads/messages.mjs';

// /** OpenAI config */
// if (!process.env.OPENAI_API_KEY)
//   throw new Error('OpenAI API key is missing or invalid.');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const assistantID = 'asst_h6NYZr9q4AWwvOwOglH0Lxac';
const threadID = 'thread_jXErF3LB2OeVwYOtSnPKiWsX';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const runThread = async () => {
  const run = await openai.beta.threads.runs.createAndPoll(threadID, {
    assistant_id: assistantID,
  });
  console.log('Run Object: ', run);
};

export const listMessages = async () => {
  const messages = await openai.beta.threads.messages.list(threadID);

  //runThread();

  //   console.log('Messages: ', messages);
  //   console.log('Messages Data ', messages.data);
  messages.data.map((message) => {
    message.content.map((content) => {
      console.log('Content: ', content);
    });
  });

  const message = messages.data.pop()!;
  if (message.content[0].type === 'text') {
    const { text } = message.content[0];
    const { annotations } = text;
    const citations: string[] = [];

    let index = 0;
    for (const annotation of annotations) {
      text.value = text.value.replace(annotation.text, '[' + index + ']');
      const file_citation = (annotation as FileCitationAnnotation)
        .file_citation;
      if (
        annotation.type === 'file_citation' &&
        (annotation as FileCitationAnnotation).file_citation
      ) {
        const citedFile = await openai.files.retrieve(file_citation.file_id);
        citations.push('[' + index + ']' + citedFile.filename);
      }
      index++;
    }

    console.log(text.value);
    console.log(citations.join('\n'));
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const createAssistant = async () => {
  const assistant = await openai.beta.assistants.create({
    instructions:
      'You are great at recommending movies. When asked a question, use the information in the provided file to form a friendly response. If you cannot find the answer in the file, do your best to infer what the answer should be.',
    name: 'Movie Expert',
    tools: [{ type: 'file_search' }],
    model: 'gpt-4-1106-preview',
  });

  const moviesFilePath = path.join(__dirname, 'movies.txt');

  // Check if the file exists
  if (!fs.existsSync(moviesFilePath)) {
    throw new Error(`File not found: ${moviesFilePath}`);
  }
  const fileStreams = [moviesFilePath].map((path) => fs.createReadStream(path));

  // Create a vector store including movie file.
  const vectorStore = await openai.vectorStores.create({
    name: 'Movies Store',
  });

  await openai.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, {
    files: fileStreams,
  });

  const updatedAssistant = await openai.beta.assistants.update(assistant.id, {
    tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
  });

  console.log(updatedAssistant);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const createThread = async () => {
  const thread = await openai.beta.threads.create({
    messages: [
      {
        role: 'user',
        content: 'Can you recommend a comedy?',
      },
    ],
  });

  // The thread now has a vector store in its tool resources.
  console.log('Thread', thread);
};
