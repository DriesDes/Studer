'use client';

import { useState, useEffect } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { SubjectCard } from './SubjectCard';
import { AddSubjectModal } from './AddSubjectModal';
import { AiImporter } from './AiImporter';
import type { Subject } from '@/types';

export function AcademicsView() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [importSubjectId, setImportSubjectId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadSubjects = async () => {
    try {
      setSubjects(await fetch('/api/subjects').then((r) => r.json()));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadSubjects(); }, []);

  const handleSubjectAdded = (subject: Subject) => { setSubjects((p) => [...p, subject]); setShowAddModal(false); };
  const handleSubjectDeleted = (id: string) => { setSubjects((p) => p.filter((s) => s.id !== id)); if (expandedId === id) setExpandedId(null); };
  const handleImportDone = () => { setImportSubjectId(null); loadSubjects(); };
  const importSubject = subjects.find((s) => s.id === importSubjectId);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Academics
          </h1>
          <p className="text-[13px] text-neutral-400 dark:text-neutral-500">
            {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-2 text-[13px] font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
        >
          <Plus size={14} strokeWidth={2.5} />
          Add Subject
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 p-12 text-center dark:border-neutral-800 dark:bg-neutral-900/30">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
            <BookOpen size={18} strokeWidth={1.5} className="text-neutral-400 dark:text-neutral-500" />
          </div>
          <p className="text-[14px] font-medium text-neutral-700 dark:text-neutral-300">No subjects yet</p>
          <p className="mt-1 text-[13px] text-neutral-400 dark:text-neutral-500">
            Add your first subject to start tracking chapters.
          </p>
          <button onClick={() => setShowAddModal(true)}
            className="mt-4 rounded-lg bg-neutral-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-neutral-800 transition-colors dark:bg-white dark:text-neutral-900">
            Add Subject
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              isExpanded={expandedId === subject.id}
              onToggle={() => setExpandedId((p) => (p === subject.id ? null : subject.id))}
              onDelete={() => handleSubjectDeleted(subject.id)}
              onImport={() => setImportSubjectId(subject.id)}
              onChaptersChanged={loadSubjects}
            />
          ))}
        </div>
      )}

      {showAddModal && (
        <AddSubjectModal onClose={() => setShowAddModal(false)} onAdded={handleSubjectAdded} />
      )}
      {importSubjectId && importSubject && (
        <AiImporter subject={importSubject} onClose={() => setImportSubjectId(null)} onDone={handleImportDone} />
      )}
    </div>
  );
}
