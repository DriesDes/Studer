'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Sparkles, Trash2 } from 'lucide-react';
import type { Subject, Chapter } from '@/types';

interface Props {
  subject: Subject;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onImport: () => void;
  onChaptersChanged: () => void;
}

export function SubjectCard({ subject, isExpanded, onToggle, onDelete, onImport, onChaptersChanged }: Props) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isExpanded && chapters.length === 0) {
      setLoadingChapters(true);
      fetch(`/api/subjects/${subject.id}/chapters`)
        .then((r) => r.json())
        .then((data) => { setChapters(data); setLoadingChapters(false); })
        .catch(() => setLoadingChapters(false));
    }
  }, [isExpanded, subject.id]);

  const completedCount = chapters.filter((c) => c.completed).length;
  const totalCount = chapters.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const toggleChapter = async (chapter: Chapter) => {
    const updated = { ...chapter, completed: !chapter.completed };
    setChapters((prev) => prev.map((c) => (c.id === chapter.id ? updated : c)));
    await fetch(`/api/subjects/${subject.id}/chapters/${chapter.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: updated.completed }),
    });
    onChaptersChanged();
  };

  const handleDelete = async () => {
    await fetch(`/api/subjects/${subject.id}`, { method: 'DELETE' });
    onDelete();
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden dark:border-neutral-800 dark:bg-neutral-900">
      {/* Header */}
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-neutral-50 transition-colors dark:hover:bg-neutral-800/50"
      >
        <div className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: subject.color }} />

        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-medium text-neutral-800 truncate dark:text-neutral-200">
            {subject.name}
          </p>
          {totalCount > 0 && (
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
              {completedCount}/{totalCount} chapters
            </p>
          )}
        </div>

        {totalCount > 0 && (
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <div className="h-1 w-20 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: subject.color }}
              />
            </div>
            <span className="w-8 text-right text-[11px] text-neutral-400 dark:text-neutral-500">
              {Math.round(progress)}%
            </span>
          </div>
        )}

        <ChevronDown
          size={14}
          strokeWidth={2}
          className={`shrink-0 text-neutral-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded */}
      {isExpanded && (
        <div className="border-t border-neutral-100 dark:border-neutral-800">
          {totalCount > 0 && (
            <div className="px-4 pt-3 pb-1">
              <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, backgroundColor: subject.color }}
                />
              </div>
            </div>
          )}

          <div className="p-4 space-y-0.5">
            {loadingChapters ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-8 animate-pulse rounded-md bg-neutral-100 dark:bg-neutral-800" />
                ))}
              </div>
            ) : chapters.length === 0 ? (
              <p className="py-3 text-[13px] text-neutral-400 dark:text-neutral-500">
                No chapters yet — use the AI Importer to add them instantly.
              </p>
            ) : (
              chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => toggleChapter(chapter)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-3 sm:py-2 text-left hover:bg-neutral-50 transition-colors group dark:hover:bg-neutral-800/50 min-h-[44px]"
                >
                  <div
                    className={`h-4 w-4 shrink-0 rounded border-2 flex items-center justify-center transition-all ${
                      chapter.completed
                        ? 'border-green-500 bg-green-500'
                        : 'border-neutral-300 group-hover:border-neutral-500 dark:border-neutral-600 dark:group-hover:border-neutral-400'
                    }`}
                  >
                    {chapter.completed && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} className="h-2.5 w-2.5">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-[13px] ${
                      chapter.completed
                        ? 'line-through text-neutral-400 dark:text-neutral-500'
                        : 'text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {chapter.order}. {chapter.title}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 border-t border-neutral-100 px-4 py-3 dark:border-neutral-800">
            <button
              onClick={onImport}
              className="flex items-center gap-1.5 rounded-md border border-violet-200 bg-violet-50 px-3 py-1.5 text-[12px] font-medium text-violet-700 hover:bg-violet-100 transition-colors dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400 dark:hover:bg-violet-500/20"
            >
              <Sparkles size={11} strokeWidth={2} />
              AI Importer
            </button>

            {showDeleteConfirm ? (
              <div className="ml-auto flex items-center gap-2">
                <span className="text-[12px] text-neutral-400">Delete?</span>
                <button onClick={handleDelete}
                  className="rounded-md border border-red-200 px-3 py-1.5 text-[12px] text-red-600 hover:bg-red-50 transition-colors dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30">
                  Delete
                </button>
                <button onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-md border border-neutral-200 px-3 py-1.5 text-[12px] text-neutral-500 hover:bg-neutral-50 transition-colors dark:border-neutral-700 dark:hover:bg-neutral-800">
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="ml-auto flex h-7 w-7 items-center justify-center rounded-full text-neutral-300 hover:bg-neutral-100 hover:text-red-500 transition-colors dark:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-red-400"
              >
                <Trash2 size={13} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
