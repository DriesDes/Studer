'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tag, History, CheckCircle2, XCircle } from 'lucide-react';
import type { Subject } from '@/types';

interface SessionRecord {
  id: string;
  subjectId: string | null;
  subject: { id: string; name: string; color: string } | null;
  startTime: string;
  endTime: string | null;
  targetDuration: number;
  xpEarned: number;
  status: string;
}

interface Props {
  subjects: Subject[];
  refreshKey: number;
}

function formatDuration(startTime: string, endTime: string | null): string {
  if (!endTime) return '—';
  const ms = new Date(endTime).getTime() - new Date(startTime).getTime();
  const totalMinutes = Math.round(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (d.toDateString() === yesterday.toDateString()) {
    return `Yesterday ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function SessionHistory({ subjects, refreshKey }: Props) {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/sessions');
      setSessions(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions, refreshKey]);

  const updateSubject = async (sessionId: string, subjectId: string) => {
    const updated = await fetch(`/api/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjectId: subjectId || null }),
    }).then((r) => r.json());

    setSessions((prev) => prev.map((s) => (s.id === sessionId ? updated : s)));
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <p className="text-[13px] text-neutral-400 dark:text-neutral-500 text-center py-4">
        No sessions yet — start your first one above.
      </p>
    );
  }

  return (
    <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
      {sessions.map((session) => (
        <SessionRow
          key={session.id}
          session={session}
          subjects={subjects}
          onSubjectChange={(subjectId) => updateSubject(session.id, subjectId)}
        />
      ))}
    </div>
  );
}

function SessionRow({
  session,
  subjects,
  onSubjectChange,
}: {
  session: SessionRecord;
  subjects: Subject[];
  onSubjectChange: (subjectId: string) => void;
}) {
  const [tagging, setTagging] = useState(false);

  const isCompleted = session.status === 'COMPLETED';

  return (
    <div className="flex items-center gap-3 py-2.5">
      {/* Status icon */}
      {isCompleted ? (
        <CheckCircle2 size={14} strokeWidth={2} className="shrink-0 text-green-500" />
      ) : (
        <XCircle size={14} strokeWidth={2} className="shrink-0 text-neutral-300 dark:text-neutral-600" />
      )}

      {/* Subject badge / tag selector */}
      <div className="min-w-0 flex-1">
        {tagging ? (
          <select
            autoFocus
            defaultValue={session.subjectId ?? ''}
            onChange={(e) => { onSubjectChange(e.target.value); setTagging(false); }}
            onBlur={() => setTagging(false)}
            className="rounded-md border border-violet-500 bg-white px-2 py-0.5 text-[12px] text-neutral-800 focus:outline-none dark:bg-neutral-900 dark:text-neutral-200"
          >
            <option value="">Unspecified</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        ) : session.subject ? (
          <div className="flex items-center gap-1.5">
            <div
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: session.subject.color }}
            />
            <span className="truncate text-[13px] text-neutral-700 dark:text-neutral-300">
              {session.subject.name}
            </span>
          </div>
        ) : (
          <span className="text-[13px] text-neutral-400 dark:text-neutral-500">Unspecified</span>
        )}
      </div>

      {/* Duration */}
      <span className="shrink-0 text-[12px] text-neutral-400 dark:text-neutral-500">
        {formatDuration(session.startTime, session.endTime)}
      </span>

      {/* XP */}
      {isCompleted && session.xpEarned > 0 && (
        <span className="shrink-0 text-[12px] font-medium text-violet-500 dark:text-violet-400">
          +{session.xpEarned}
        </span>
      )}

      {/* Date */}
      <span className="hidden shrink-0 text-[11px] text-neutral-400 dark:text-neutral-500 sm:block">
        {formatDate(session.startTime)}
      </span>

      {/* Tag button */}
      <button
        onClick={() => setTagging(true)}
        title="Change subject"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-neutral-300 hover:bg-neutral-100 hover:text-neutral-600 transition-colors dark:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
      >
        <Tag size={11} strokeWidth={2} />
      </button>
    </div>
  );
}
