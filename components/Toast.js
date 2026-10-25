'use client';

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  const bgStyles = type === 'error'
    ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
    : type === 'info'
    ? 'bg-blue-950/90 border-blue-500/40 text-blue-200'
    : 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200';

  const icon = type === 'error' ? '⚠️' : type === 'info' ? 'ℹ️' : '✓';

  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl backdrop-blur border flex items-center gap-3 text-sm font-medium transition-all ${bgStyles}`}>
      <span className="text-base">{icon}</span>
      <span>{message}</span>
      {onClose && (
        <button 
          onClick={onClose} 
          className="ml-2 opacity-60 hover:opacity-100 text-base leading-none focus:outline-none"
          aria-label="Close notification"
        >
          ×
        </button>
      )}
    </div>
  );
}
