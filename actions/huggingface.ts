'use server';

import { pipeline } from '@xenova/transformers';
import { HfInference } from '@huggingface/inference';
import { listModels } from '@huggingface/hub';

import * as z from 'zod';

import { StockTickerSchema } from '@/schemas';

const token = process.env.HF_TOKEN;
const hf = new HfInference(token);

export const getDetector = async () => {
  const detector = await pipeline('object-detection', 'Xenova/yolos-tiny');
  return detector;
};

export const getStockAdvise = async (
  values: z.infer<typeof StockTickerSchema>
) => {
  const validatedFields = StockTickerSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid ticker' };
  }

  //   const response = await hf.translation({
  //     model: 'facebook/mbart-large-50-many-to-many-mmt',
  //     inputs: values.ticker,
  //     parameters: {
  //       src_lang: 'en_XX',
  //       tgt_lang: 'pt_XX',
  //     },
  //   });

  const response = await hf.textToSpeech({
    inputs: values.ticker,
    model: 'espnet/kan-bayashi_ljspeech_vits',
  });

  const audioUrl = URL.createObjectURL(response);
  console.log(audioUrl);

  return { success: audioUrl };
};

// HuggingFace.js Hub Docs: https://huggingface.co/docs/huggingface.js/hub/README
export const getfreeModels = async () => {
  async function isModelInferenceEnabled(modelName: string) {
    const response = await fetch(
      `https://api-inference.huggingface.co/status/${modelName}`
    );
    const data = await response.json();
    return data.state == 'Loadable';
  }

  const models = [];

  for await (const model of listModels({
    credentials: {
      accessToken: token!,
    },
    search: {
      task: 'text-to-image',
    },
  })) {
    if (model.likes < 2000) {
      continue;
    }

    if (await isModelInferenceEnabled(model.name)) {
      models.push(model);
    }
  }

  models.sort((model1, model2) => model2.likes - model1.likes);
  for (const model of models) {
    console.log(`${model.likes} Likes: https://huggingface.co/${model.name}`);
  }
};
