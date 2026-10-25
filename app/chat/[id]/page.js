'use client';

import { use } from 'react';
import ChatPage from '../page';

export default function ChatIdPage({ params }) {
  // Gracefully resolve params if async in Next 15
  const resolvedParams = params ? (typeof params.then === 'function' ? use(params) : params) : {};
  return <ChatPage initialChatId={resolvedParams?.id} />;
}
