'use client';

import { splitText } from '@/actions/langchain';
import { useEffect } from 'react';

const LangchainPage = () => {
  useEffect(() => {
    const textChunks = splitText();
    console.log(textChunks);
  }, []);

  return <div>LangchainPage</div>;
};

export default LangchainPage;
