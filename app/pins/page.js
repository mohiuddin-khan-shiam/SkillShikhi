'use client';

import { useState, useEffect } from 'react';
import { DEMO_PINS, DEMO_USERS } from '../../lib/demoData';
import { clientStore } from '../../lib/clientStore';

export default function PinsPage() {
  const [pins, setPins] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activePinModal, setActivePinModal] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('System Design');
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    setPins(clientStore.getPins());
  }, []);

  const categories = [
    'All',
    'System Design',
    'UI Kits',
    'Deep Learning',
    'Frontend Cheatsheet',
    'Database Engineering',
    'Typography',
  ];

  const filteredPins =
    selectedCategory === 'All'
      ? pins
      : pins.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase());

  const handleToggleSave = (pinId, e) => {
    e?.stopPropagation();
    const updated = clientStore.toggleSavePin(pinId);
    setPins(updated);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePin = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newPin = clientStore.addPin({
      title: newTitle,
      description: newDescription,
      category: newCategory,
      image: imagePreview || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
    });

    setPins([newPin, ...pins]);
    setNewTitle('');
    setNewDescription('');
    setImagePreview(null);
    setShowCreateModal(false);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📌</span>
              <h1 className="text-xl font-black text-slate-900">Inspiration & Architecture Pinboard</h1>
              <span className="text-[10px] font-bold uppercase bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full">
                Pinterest Paradigm
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Visual schematics, system design blueprints, token palettes, and cheat sheets saved to peer boards.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
          >
            <span>+</span>
            <span>Create New Pin</span>
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Masonry Pinboard Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredPins.map((pin) => (
            <div
              key={pin.id}
              onClick={() => setActivePinModal(pin)}
              className="break-inside-avoid bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition transform hover:-translate-y-1 cursor-pointer group"
            >
              <div className="relative">
                <img src={pin.image} alt={pin.title} className="w-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition p-4 flex items-start justify-between">
                  <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {pin.category}
                  </span>
                  <button
                    onClick={(e) => handleToggleSave(pin.id, e)}
                    className={`px-3 py-1 rounded-full text-xs font-bold shadow-md transition ${
                      pin.isSaved ? 'bg-rose-600 text-white' : 'bg-white text-slate-900 hover:bg-rose-50'
                    }`}
                  >
                    {pin.isSaved ? 'Saved ✓' : 'Save 📌'}
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <h3 className="font-bold text-sm text-slate-900 leading-snug group-hover:text-rose-600 transition">
                  {pin.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{pin.description}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <img
                      src={pin.author?.avatar}
                      alt={pin.author?.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="font-medium text-slate-700">{pin.author?.name}</span>
                  </div>
                  <span>📌 {pin.saves} Saves</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: View Full Pin */}
        {activePinModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col md:flex-row">
              <div className="md:w-1/2 bg-slate-900 flex items-center justify-center">
                <img
                  src={activePinModal.image}
                  alt={activePinModal.title}
                  className="w-full h-full object-cover max-h-[460px]"
                />
              </div>
              <div className="md:w-1/2 p-6 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full">
                      {activePinModal.category}
                    </span>
                    <button
                      onClick={() => setActivePinModal(null)}
                      className="text-slate-400 hover:text-slate-700 text-lg font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 leading-snug">{activePinModal.title}</h2>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{activePinModal.description}</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={activePinModal.author?.avatar}
                      alt={activePinModal.author?.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-bold text-xs text-slate-900">{activePinModal.author?.name}</div>
                      <div className="text-[10px] text-slate-400">{activePinModal.author?.role}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleSave(activePinModal.id)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                        activePinModal.isSaved
                          ? 'bg-rose-600 text-white'
                          : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                      }`}
                    >
                      {activePinModal.isSaved ? 'Saved to Your Board ✓' : 'Save to Board 📌'}
                    </button>
                    <button
                      onClick={() => alert('Diagram blueprint copied!')}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700"
                    >
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Create Pin */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-base text-slate-900">Pin a Technical Diagram or Resource</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreatePin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pin Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Next.js 15 Server Action Lifecycle Diagram"
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="System Design">System Design & Architecture</option>
                    <option value="UI Kits">UI Kits & Design Tokens</option>
                    <option value="Deep Learning">Deep Learning & AI Maps</option>
                    <option value="Frontend Cheatsheet">Frontend Cheatsheets</option>
                    <option value="Database Engineering">Database Engineering</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Key Insights / Summary</label>
                  <textarea
                    rows={3}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Provide context on what peers can learn from this blueprint..."
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Upload Visual Asset</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="text-xs" />
                </div>

                {imagePreview && (
                  <div className="rounded-xl overflow-hidden border border-slate-200 max-h-40">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md"
                  >
                    Post to Pinboard
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
