'use server';

import { HfInference } from '@huggingface/inference';
import * as z from 'zod';

import { StockTickerSchema } from '@/schemas';

export const getStockAdvise = async (
  values: z.infer<typeof StockTickerSchema>
) => {
  const validatedFields = StockTickerSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid ticker' };
  }

  const hf = new HfInference(process.env.HF_TOKEN);

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
