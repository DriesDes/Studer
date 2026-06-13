'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { Subject } from '@/types';

const PRESET_COLORS = [
  '#6366f1', '#ec4899', '#f97316', '#10b981',
  '#3b82f6', '#8b5cf6', '#f59e0b', '#14b8a6',
  '#ef4444', '#84cc16',
];

interface Props {
  onClose: () => void;
  onAdded: (subject: Subject) => void;
}

export function AddSubjectModal({ onClose, onAdded }: Props) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Subject name is required.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), color }),
      });
      if (!res.ok) throw new Error();
      onAdded(await res.json());
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm max-h-[90dvh] overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-950 animate-level-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
          <h2 className="text-[14px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            New Subject
          </h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors dark:hover:bg-neutral-800"
          >
            <X size={13} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-neutral-700 dark:text-neutral-300">
              Subject Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="e.g. Linear Algebra"
              autoFocus
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-[13px] text-neutral-800
                         placeholder:text-neutral-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500
                         dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:placeholder:text-neutral-600"
            />
            {error && <p className="mt-1 text-[12px] text-red-500">{error}</p>}
          </div>

          <div>
            <label className="mb-2 block text-[12px] font-medium text-neutral-700 dark:text-neutral-300">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-6 w-6 rounded-full transition-all hover:scale-110 ${
                    color === c ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-neutral-950 ring-neutral-800 dark:ring-neutral-100 scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-neutral-200 py-2 text-[13px] font-medium text-neutral-600 hover:bg-neutral-50 transition-colors dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800/50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 rounded-lg bg-neutral-900 py-2 text-[13px] font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-40 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100">
              {loading ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
