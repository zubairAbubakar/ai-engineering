'use client';

import {
  getEmbeddings,
  medicChat,
  searchEmbeddings,
} from '@/actions/embeddings';
import React, { useEffect, useState } from 'react';

const EmbeddingsPage = () => {
  const [embeddings, setEmbeddings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEmbeddings = async () => {
      try {
        const data = await medicChat('Health for the poor?');
        //const data = await getEmbeddings();
        if (Array.isArray(data)) {
          setEmbeddings(data);
        } else {
          console.error('Unexpected data format:', data);
        }
      } catch (error) {
        console.error('Error fetching embeddings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmbeddings();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {embeddings.map((embedding, index) => (
        <div key={index}>
          <p>{embedding.content}</p>
          <pre>{JSON.stringify(embedding.embedding, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
};

export default EmbeddingsPage;
