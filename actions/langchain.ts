import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { createEmbedding, storeEmbeddings } from './embeddings';

export const splitText = async () => {
  const response = await fetch('/movies.txt');
  const text = await response.text();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 150,
    chunkOverlap: 15,
  });

  const textChunks = await splitter.createDocuments([text]);
  const textContents = textChunks.map((chunk) => chunk.pageContent);
  console.log(textContents);
  createAndStoreEmbeddings(textContents);
  return textChunks;
};

export const createAndStoreEmbeddings = async (texts: string[]) => {
  const data = await Promise.all(
    texts.map(async (textChunk) => {
      const embeddingResponse = await createEmbedding(textChunk);
      return {
        content: textChunk,
        embedding: embeddingResponse,
      };
    })
  );

  storeEmbeddings(data);

  return data;
};
