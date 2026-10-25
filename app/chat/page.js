'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DEMO_USERS, DEMO_CHATS } from '../../lib/demoData';
import { clientStore } from '../../lib/clientStore';

export const STUDY_PODS = [
  {
    id: 'pod_ai_ml',
    isPod: true,
    name: '🧠 Deep Learning & PyTorch Pod',
    slug: 'pod-ai-ml',
    category: 'AI / Machine Learning',
    membersCount: 418,
    onlineCount: 24,
    avatar: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=100&auto=format&fit=crop&q=80',
    lastMessage: 'Sarah: PyTorch 2.6 compilation benchmarks are live in repo.',
    lastTimestamp: '10:45 AM',
    unreadCount: 3,
    description: 'Collaborative study pod for gradient descent, transformer attention, and fine-tuning.',
    messages: [
      {
        id: 'pod_msg_1',
        sender: 'sarah',
        author: DEMO_USERS.sarah,
        text: 'Welcome to this week’s PyTorch deep dive! We are discussing GPU kernel optimization.',
        time: '10:15 AM',
      },
      {
        id: 'pod_msg_2',
        sender: 'alex',
        author: DEMO_USERS.alex,
        text: 'Does torch.compile provide significant speedups for dynamic sequence lengths?',
        time: '10:30 AM',
      },
      {
        id: 'pod_msg_3',
        sender: 'sarah',
        author: DEMO_USERS.sarah,
        text: 'Yes! Specifying `dynamic=True` prevents recompilation while retaining inductor optimizations.',
        time: '10:45 AM',
      },
    ],
  },
  {
    id: 'pod_nextjs',
    isPod: true,
    name: '⚛️ Next.js 15 & React 19 Core',
    slug: 'pod-nextjs',
    category: 'Full Stack Engineering',
    membersCount: 520,
    onlineCount: 38,
    avatar: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=100&auto=format&fit=crop&q=80',
    lastMessage: 'Elena: Server Actions paired with optimistic state feel instant.',
    lastTimestamp: '9:20 AM',
    unreadCount: 1,
    description: 'Exploring React Server Components, server actions, and zero-bundle hydration.',
    messages: [
      {
        id: 'nxt_1',
        sender: 'alex',
        author: DEMO_USERS.alex,
        text: 'React 19 useActionState is so much cleaner than manual fetch wrappers.',
        time: '9:00 AM',
      },
      {
        id: 'nxt_2',
        sender: 'elena',
        author: DEMO_USERS.elena,
        text: 'Server Actions paired with optimistic state feel instant. Check the repo updates.',
        time: '9:20 AM',
      },
    ],
  },
  {
    id: 'pod_devops',
    isPod: true,
    name: '☁️ Cloud Native & Kubernetes',
    slug: 'pod-devops',
    category: 'Infrastructure & DevOps',
    membersCount: 310,
    onlineCount: 19,
    avatar: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=100&auto=format&fit=crop&q=80',
    lastMessage: 'Tariq: GitOps ArgoCD sync pipelines verified.',
    lastTimestamp: 'Yesterday',
    unreadCount: 0,
    description: 'Production container manifests, helm charts, and zero-downtime blue/green rollouts.',
    messages: [
      {
        id: 'k8s_1',
        sender: 'tariq',
        author: DEMO_USERS.tariq,
        text: 'Always include liveness and readiness probes in your pod specs.',
        time: 'Yesterday',
      },
      {
        id: 'k8s_2',
        sender: 'tariq',
        author: DEMO_USERS.tariq,
        text: 'GitOps ArgoCD sync pipelines verified.',
        time: 'Yesterday',
      },
    ],
  },
];

export default function ChatPage({ initialChatId }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(DEMO_USERS.alex);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pods', 'direct'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChatId, setSelectedChatId] = useState(initialChatId || 'pod_ai_ml');
  const [podList, setPodList] = useState(STUDY_PODS);
  const [directChats, setDirectChats] = useState(DEMO_CHATS);
  const [messageInput, setMessageInput] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [isAudioCalling, setIsAudioCalling] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const user = clientStore.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    const savedChats = clientStore.getChats();
    if (savedChats && savedChats.length > 0) {
      setDirectChats(savedChats);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChatId, podList, directChats]);

  // Combine pods and direct chats into unified list
  const combinedList = [
    ...podList.map((p) => ({
      id: p.id,
      name: p.name,
      subtitle: `${p.membersCount} members · ${p.onlineCount} online`,
      avatar: p.avatar,
      lastMessage: p.lastMessage,
      lastTimestamp: p.lastTimestamp,
      unreadCount: p.unreadCount,
      isPod: true,
      online: true,
      data: p,
    })),
    ...directChats.map((c) => ({
      id: c.id,
      name: c.withUser.name,
      subtitle: c.withUser.role || 'Peer Learner',
      avatar: c.withUser.avatar,
      lastMessage: c.lastMessage,
      lastTimestamp: c.lastTimestamp,
      unreadCount: c.unreadCount || 0,
      isPod: false,
      online: c.online !== false,
      data: c,
    })),
  ];

  const filteredList = combinedList.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'pods') return matchesSearch && item.isPod;
    if (activeTab === 'direct') return matchesSearch && !item.isPod;
    return matchesSearch;
  });

  const activeItem = combinedList.find((item) => item.id === selectedChatId) || combinedList[0];

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!messageInput.trim()) return;

    const user = clientStore.getCurrentUser() || DEMO_USERS.alex;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (activeItem.isPod) {
      const newPodMsg = {
        id: `pod_m_${Date.now()}`,
        sender: 'me',
        author: user,
        text: messageInput.trim(),
        time: timeStr,
      };

      setPodList((prev) =>
        prev.map((pod) =>
          pod.id === activeItem.id
            ? {
                ...pod,
                lastMessage: `You: ${messageInput.trim()}`,
                lastTimestamp: 'Just now',
                messages: [...pod.messages, newPodMsg],
              }
            : pod
        )
      );
    } else {
      const updatedChats = clientStore.sendMessage(activeItem.id, messageInput.trim());
      setDirectChats(updatedChats);
    }

    setMessageInput('');
  };

  const handleQuickReaction = (emoji) => {
    setMessageInput((prev) => `${prev} ${emoji}`.trim());
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Top Banner / Paradigm Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">💬</span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-slate-900 tracking-tight">
                  Study Pods & Direct Peer Messaging
                </h1>
                <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  WhatsApp & Telegram Paradigm
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Real-time technical study rooms, direct mentorship messaging, and live code discussions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Presence Active
            </span>
            <Link
              href="/sessions"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-lg transition"
            >
              Classroom Workshops →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Dual-Pane Chat Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Sidebar: Conversations & Pods List */}
        <div
          className={`lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden h-[720px] ${
            mobileShowChat ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Search & Tabs */}
          <div className="p-3.5 border-b border-slate-100 space-y-2.5">
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search study pods, mentors, topics..."
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-1.5 rounded-lg text-center transition ${
                  activeTab === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All ({combinedList.length})
              </button>
              <button
                onClick={() => setActiveTab('pods')}
                className={`flex-1 py-1.5 rounded-lg text-center transition ${
                  activeTab === 'pods' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Pods ({podList.length})
              </button>
              <button
                onClick={() => setActiveTab('direct')}
                className={`flex-1 py-1.5 rounded-lg text-center transition ${
                  activeTab === 'direct' ? 'bg-white text-indigo-800 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Direct ({directChats.length})
              </button>
            </div>
          </div>

          {/* Conversations Scroll List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredList.map((item) => {
              const isSelected = item.id === activeItem?.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedChatId(item.id);
                    setMobileShowChat(true);
                  }}
                  className={`w-full text-left p-3.5 flex items-start gap-3 transition group ${
                    isSelected ? 'bg-emerald-50/70 border-l-4 border-emerald-600' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                    />
                    {item.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`font-bold text-xs truncate ${
                            isSelected ? 'text-emerald-950' : 'text-slate-800'
                          }`}
                        >
                          {item.name}
                        </span>
                        {item.isPod && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                            Pod
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">{item.lastTimestamp}</span>
                    </div>

                    <p className="text-[11px] text-slate-500 truncate">{item.lastMessage}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.subtitle}</p>
                  </div>

                  {item.unreadCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 self-center">
                      {item.unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Active Room: Messages Stream & Live Composer */}
        <div
          className={`lg:col-span-7 xl:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden h-[720px] ${
            !mobileShowChat ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Active Chat Header */}
          <div className="p-3.5 sm:px-5 border-b border-slate-200 flex items-center justify-between bg-white z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileShowChat(false)}
                className="lg:hidden p-1.5 -ml-1 text-slate-600 hover:bg-slate-100 rounded-lg text-sm"
              >
                ← Back
              </button>

              <div className="relative">
                <img
                  src={activeItem.avatar}
                  alt={activeItem.name}
                  className="w-10 h-10 rounded-2xl object-cover border border-slate-200"
                />
                {activeItem.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-sm text-slate-900 tracking-tight">{activeItem.name}</h2>
                  {activeItem.isPod ? (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Study Pod
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-full">
                      Peer Chat
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>{activeItem.subtitle}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsAudioCalling(!isAudioCalling)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  isAudioCalling
                    ? 'bg-rose-100 text-rose-700 font-bold border border-rose-200'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                title="Mock Audio Pod Call"
              >
                <span>{isAudioCalling ? '🔴' : '🎙️'}</span>
                <span className="hidden sm:inline">
                  {isAudioCalling ? 'Leave Pod Call' : 'Join Audio Pod'}
                </span>
              </button>

              <Link
                href="/sessions"
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition"
              >
                📅 Book Session
              </Link>
            </div>
          </div>

          {/* Audio Call Active Simulation Banner */}
          {isAudioCalling && (
            <div className="bg-emerald-900 text-emerald-100 px-4 py-2 text-xs flex items-center justify-between border-b border-emerald-800 animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>
                  <strong>Audio Pod Connected:</strong> Listening to peer discussion with active noise-suppression.
                </span>
              </div>
              <span className="font-mono text-[11px] text-emerald-300">04:12</span>
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/60">
            {activeItem.isPod ? (
              // Pod messages
              activeItem.data.messages.map((msg) => {
                const isMe = msg.sender === 'me';
                const author = msg.author || (isMe ? currentUser : DEMO_USERS.sarah);
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 max-w-[85%] sm:max-w-[75%] ${
                      isMe ? 'ml-auto flex-row-reverse' : ''
                    }`}
                  >
                    <img
                      src={author.avatar}
                      alt={author.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="space-y-1">
                      <div className={`flex items-center gap-2 text-[10px] ${isMe ? 'justify-end' : ''}`}>
                        <span className="font-bold text-slate-700">{author.name}</span>
                        <span className="text-slate-400">{msg.time}</span>
                      </div>
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                          isMe
                            ? 'bg-emerald-600 text-white rounded-tr-none'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              // Direct messages
              activeItem.data.messages.map((msg) => {
                const isMe = msg.sender === 'me';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 max-w-[85%] sm:max-w-[75%] ${
                      isMe ? 'ml-auto flex-row-reverse' : ''
                    }`}
                  >
                    <img
                      src={isMe ? currentUser.avatar : activeItem.avatar}
                      alt={isMe ? currentUser.name : activeItem.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="space-y-1">
                      <div className={`flex items-center gap-2 text-[10px] ${isMe ? 'justify-end' : ''}`}>
                        <span className="font-bold text-slate-700">
                          {isMe ? currentUser.name : activeItem.name}
                        </span>
                        <span className="text-slate-400">{msg.time}</span>
                      </div>
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                          isMe
                            ? 'bg-indigo-600 text-white rounded-tr-none'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reaction Pills */}
          <div className="px-4 py-1.5 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
            <span className="text-[10px] text-slate-400 font-semibold">Quick Reaction:</span>
            {['👍 Helpful', '🚀 Shipped', '💡 Insightful', '🔥 Clean Code', '❤️ Thanks!'].map((rx) => (
              <button
                key={rx}
                onClick={() => handleQuickReaction(rx)}
                className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full text-[11px] text-slate-600 transition flex-shrink-0"
              >
                {rx}
              </button>
            ))}
          </div>

          {/* Message Composer */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={`Message ${activeItem.name}...`}
              className="flex-1 py-2.5 px-4 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
            />
            <button
              type="submit"
              disabled={!messageInput.trim()}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 flex-shrink-0"
            >
              <span>Send</span>
              <span>✈️</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
