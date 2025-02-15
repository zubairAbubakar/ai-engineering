import { getOpenaiResponse } from '@/actions/openia';

export default async function Home() {
  const answer = await getOpenaiResponse('Who invented television?');
  return (
    <div>
      <h2>AI Engineering</h2>
      <p>{answer}</p>
    </div>
  );
}
