'use client';

import { useState, useRef, useEffect } from 'react';
import { DEMO_REELS, DEMO_USERS } from '../../lib/demoData';
import { clientStore } from '../../lib/clientStore';

export default function ReelsPage() {
  const [reels, setReels] = useState([]);
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const videoRefs = useRef({});

  useEffect(() => {
    setReels(clientStore.getReels());
  }, []);

  const currentReel = reels[activeReelIndex] || DEMO_REELS[0];

  const handleToggleLike = (reelId) => {
    const updated = clientStore.toggleLikeReel(reelId);
    setReels(updated);
  };

  const handleToggleSave = (reelId) => {
    const updated = clientStore.toggleSaveReel(reelId);
    setReels(updated);
  };

  const handleNext = () => {
    if (activeReelIndex < reels.length - 1) {
      setActiveReelIndex(activeReelIndex + 1);
    } else {
      setActiveReelIndex(0);
    }
  };

  const handlePrev = () => {
    if (activeReelIndex > 0) {
      setActiveReelIndex(activeReelIndex - 1);
    }
  };

  return (
    <div className="bg-slate-950 text-white min-h-screen py-8 px-4 flex flex-col items-center">
      {/* Top Banner */}
      <div className="max-w-md w-full mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-bold mb-2">
          <span>⚡</span>
          <span>TikTok & Instagram Reels Paradigm</span>
        </div>
        <h1 className="text-2xl font-black">Skill Reels (60s Micro-Lessons)</h1>
        <p className="text-xs text-slate-400 mt-1">
          Bite-sized vertical code walk-throughs & animated architectural tips.
        </p>
      </div>

      {/* Main Reels Vertical Player Card */}
      <div className="relative max-w-sm w-full h-[620px] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col justify-between">
        {/* Background Video / Animated Poster */}
        <div className="absolute inset-0 z-0">
          <video
            ref={(el) => (videoRefs.current[currentReel.id] = el)}
            src={currentReel.videoUrl}
            poster={currentReel.thumbnail}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover opacity-90 cursor-pointer"
            onClick={() => setIsPlaying(!isPlaying)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 pointer-events-none" />
        </div>

        {/* Top Controls */}
        <div className="relative z-10 p-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="bg-rose-600 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
              {currentReel.skillTag}
            </span>
            <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-slate-300">
              ⏱ {currentReel.duration}
            </span>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-sm hover:bg-black/80 transition"
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>

        {/* Right Side Social Action Pills */}
        <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-4">
          <button
            onClick={() => handleToggleLike(currentReel.id)}
            className="flex flex-col items-center gap-1 group"
          >
            <div
              className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center text-lg transition transform group-hover:scale-110 shadow-lg ${
                currentReel.isLiked ? 'bg-rose-600 text-white' : 'bg-black/60 text-white'
              }`}
            >
              {currentReel.isLiked ? '❤️' : '🤍'}
            </div>
            <span className="text-[11px] font-bold drop-shadow-md">{currentReel.likes}</span>
          </button>

          <button
            onClick={() => setShowCommentsModal(true)}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-lg transition transform group-hover:scale-110 shadow-lg">
              💬
            </div>
            <span className="text-[11px] font-bold drop-shadow-md">{currentReel.comments}</span>
          </button>

          <button
            onClick={() => handleToggleSave(currentReel.id)}
            className="flex flex-col items-center gap-1 group"
          >
            <div
              className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center text-lg transition transform group-hover:scale-110 shadow-lg ${
                currentReel.saved ? 'bg-amber-500 text-white' : 'bg-black/60 text-white'
              }`}
            >
              📌
            </div>
            <span className="text-[11px] font-bold drop-shadow-md">
              {currentReel.saved ? 'Saved' : 'Save'}
            </span>
          </button>
        </div>

        {/* Bottom Details & Micro-Lesson Tip */}
        <div className="relative z-10 p-5 space-y-3">
          {/* Author info */}
          <div className="flex items-center gap-2.5">
            <img
              src={currentReel.author.avatar}
              alt={currentReel.author.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-rose-500"
            />
            <div>
              <div className="font-bold text-sm leading-tight text-white">{currentReel.author.name}</div>
              <div className="text-[11px] text-slate-300">{currentReel.author.role}</div>
            </div>
          </div>

          <h3 className="font-extrabold text-base leading-snug drop-shadow-md text-white">
            {currentReel.title}
          </h3>

          {/* Golden Micro-Lesson Callout */}
          <div className="bg-black/60 backdrop-blur-md border border-white/20 p-3 rounded-xl text-xs text-slate-200">
            <div className="text-[10px] font-bold uppercase text-amber-400 mb-1 flex items-center gap-1">
              <span>💡</span>
              <span>Key 60s Takeaway</span>
            </div>
            <p className="leading-relaxed line-clamp-3">{currentReel.tip}</p>
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={handlePrev}
          disabled={activeReelIndex === 0}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition shadow-md"
        >
          ▲ Previous Lesson
        </button>
        <span className="text-xs text-slate-400">
          Lesson {activeReelIndex + 1} of {reels.length}
        </span>
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-md"
        >
          ▼ Next Lesson
        </button>
      </div>

      {/* Reel Comments Modal */}
      {showCommentsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-sm">Discussions ({currentReel.comments})</h4>
              <button onClick={() => setShowCommentsModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto text-xs">
              <div className="bg-slate-800/80 p-3 rounded-xl space-y-1">
                <div className="font-bold text-indigo-400">Alex River</div>
                <p className="text-slate-300">This CSS tip just saved me 2 hours of nested div debugging!</p>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl space-y-1">
                <div className="font-bold text-emerald-400">Tariq Rahman</div>
                <p className="text-slate-300">Clean visual explanation. Shared with our frontend team!</p>
              </div>
            </div>
            <button
              onClick={() => setShowCommentsModal(false)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
