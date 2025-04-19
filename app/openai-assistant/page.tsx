'use client';

import { listMessages } from '@/actions/openai-assistant/assistant';
import { useEffect } from 'react';

const OpenAIAssistantPage = () => {
  useEffect(() => {
    console.log('GOT HERE!!!!!!!!!\n');
    listMessages();
  }, []);

  return <div>LangchainPage</div>;
};

export default OpenAIAssistantPage;
