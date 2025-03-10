'use server';

import { FeatureExtractionOutput, HfInference } from '@huggingface/inference';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL as string;
if (!supabaseUrl) throw new Error(`Expected env var SUPABASE_URL`);
const supabaseApiKey = process.env.SUPABASE_API_KEY as string;
if (!supabaseApiKey) throw new Error(`Expected env var SUPABASE_API_KEY`);
const supabase = createClient(supabaseUrl, supabaseApiKey);

const hf = new HfInference(process.env.HF_TOKEN);

const model = 'sentence-transformers/all-MiniLM-L6-v2';

export const getEmbeddings = async (): Promise<unknown[]> => {
  const texts = [
    'How do I get a replacement Medicare card?',
    'What is the monthly premium for Medicare Part B?',
    'How do I terminate my Medicare Part B (medical insurance)?',
    'How do I sign up for Medicare?',
    'Can I sign up for Medicare Part B if I am working and have health insurance through an employer?',
    'How do I sign up for Medicare Part B if I already have Part A?',
    'What are Medicare late enrollment penalties?',
    'What is Medicare and who can get it?',
    'How can I get help with my Medicare Part A and Part B premiums?',
    'What are the different parts of Medicare?',
    'Will my Medicare premiums be higher because of my higher income?',
    'What is TRICARE ?',
    "Should I sign up for Medicare Part B if I have Veterans' Benefits?",
  ];

  const data = await Promise.all(
    texts.map(async (textChunk) => {
      const embeddingResponse = await hf.featureExtraction({
        inputs: textChunk,
        model: model,
      });
      return {
        content: textChunk,
        embedding: embeddingResponse,
      };
    })
  );

  try {
    const { error } = await supabase.from('documents').insert(data);
    if (error) throw error;
  } catch (error) {
    console.error('Error inserting embeddings:', error);
  }

  return data;
};

export const medicChat = async (message: string) => {
  const embedding: FeatureExtractionOutput = await createEmbedding(message);
  const match = await findNearestMatch(embedding);
  console.log('Match:', match);
  const chatResponse = await getChatCompletion(match[0].content, message);

  return chatResponse;
};

export const findNearestMatch = async (embedding: FeatureExtractionOutput) => {
  const { error, data } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: 0.2,
    match_count: 3,
  });
  console.log(data, error);
  if (error) throw error;
  return data;
};

export const createEmbedding = async (text: string) => {
  const embeddingResponse: FeatureExtractionOutput = await hf.featureExtraction(
    {
      inputs: text,
      model: model,
    }
  );
  return embeddingResponse;
};

const chatMessages = [
  {
    role: 'system',
    content: `You are a medical expert with great knowledge of the Medicare program. You will be given two pieces of information - some context about medicare and a question. Your main job is to formulate a short answer to the question using the provided context. If you are unsure and cannot find the answer in the context, say, "Sorry, I don't know the answer." Please do not make up the answer.`,
  },
];

const getChatCompletion = async (text: string, query: string) => {
  chatMessages.push({
    role: 'user',
    content: `Context: ${text} Question: ${query}`,
  });

  const response = await hf.chatCompletion({
    model: 'gpt-3.5-turbo',
    messages: chatMessages,
  });
  console.log('Chat Response: ', response);
  return response.choices[0].message.content;
};

export const storeEmbeddings = async (
  data: {
    content: string;
    embedding: FeatureExtractionOutput;
  }[]
) => {
  try {
    const { error } = await supabase.from('movies').insert(data);
    if (error) throw error;
  } catch (error) {
    console.error('Error inserting embeddings:', error);
  }
};
