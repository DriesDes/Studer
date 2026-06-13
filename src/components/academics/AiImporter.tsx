'use client';

import { useState } from 'react';
import { Sparkles, Copy, Check, X, ArrowRight } from 'lucide-react';
import type { Subject } from '@/types';

interface Props {
  subject: Subject;
  onClose: () => void;
  onDone: () => void;
}

const BLUEPRINT_PROMPT = `You are a precise course-structure extraction assistant.

Task: Parse the syllabus or table of contents I provide below and return a clean JSON array of all chapters, modules, units, or major topics in order.

Rules:
1. Preserve the original order exactly.
2. Remove numbering prefixes like "Chapter 1:", "1.1", "Week 3:", "Unit A:" — include only the descriptive title.
3. Exclude all metadata: page numbers, dates, instructor names, grading policy, bibliography.
4. Each entry must represent a meaningful, standalone study topic.
5. Output ONLY the raw JSON array — no markdown code fences, no explanation text.

Required output format:
[
  { "title": "Introduction and Course Overview", "order": 1 },
  { "title": "Core Concepts and Terminology", "order": 2 }
]

My syllabus / table of contents:
[PASTE YOUR SYLLABUS HERE]`;

function isValidJson(raw: string): boolean {
  try {
    const parsed = JSON.parse(raw.trim());
    return (
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      parsed.every(
        (c) =>
          typeof c === 'object' &&
          typeof c.title === 'string' &&
          typeof c.order === 'number'
      )
    );
  } catch {
    return false;
  }
}

export function AiImporter({ subject, onClose, onDone }: Props) {
  const [jsonInput, setJsonInput] = useState('');
  const [parseError, setParseError] = useState('');
  const [importing, setImporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(BLUEPRINT_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleImport = async () => {
    setParseError('');
    let parsed: Array<{ title: string; order: number }>;

    try {
      parsed = JSON.parse(jsonInput.trim());
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Not an array');
      if (!parsed.every((c) => typeof c.title === 'string' && typeof c.order === 'number')) {
        throw new Error('Invalid shape');
      }
    } catch {
      setParseError(
        'Invalid JSON — make sure the AI returned a raw array of { "title": string, "order": number } objects, with no markdown fences.'
      );
      return;
    }

    setImporting(true);
    try {
      const res = await fetch(`/api/subjects/${subject.id}/chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      if (!res.ok) throw new Error('Import failed');
      onDone();
    } catch {
      setParseError('Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const canImport = isValidJson(jsonInput) && !importing;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[92dvh] flex flex-col rounded-t-2xl sm:rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-950 animate-level-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-100 dark:bg-violet-500/20">
              <Sparkles size={14} strokeWidth={2} className="text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="text-[13px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                AI Importer
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {subject.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-5 p-5">
          {/* Step 1 */}
          <div>
            <p className="mb-2.5 text-[12px] font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              Step 1 — Copy prompt into Claude, ChatGPT, or any LLM
            </p>
            <div className="relative rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
              <pre className="max-h-48 overflow-auto px-4 py-3.5 text-[12px] leading-relaxed text-neutral-600 whitespace-pre-wrap font-mono dark:text-neutral-400">
                {BLUEPRINT_PROMPT}
              </pre>
              <div className="border-t border-neutral-200 px-4 py-2.5 dark:border-neutral-800 flex items-center justify-between">
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                  Replace <span className="font-mono text-violet-500">[PASTE YOUR SYLLABUS HERE]</span> with your course content
                </p>
                <button
                  onClick={copyPrompt}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-all ${
                    copied
                      ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-violet-100 hover:text-violet-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-violet-500/20 dark:hover:text-violet-400'
                  }`}
                >
                  {copied ? (
                    <><Check size={12} strokeWidth={2.5} /> Copied!</>
                  ) : (
                    <><Copy size={12} strokeWidth={2} /> Copy Prompt</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div>
            <p className="mb-2.5 text-[12px] font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              Step 2 — Paste the JSON response
            </p>
            <textarea
              value={jsonInput}
              onChange={(e) => { setJsonInput(e.target.value); setParseError(''); }}
              placeholder={'Paste the JSON code block generated by the AI here…\n\nExample:\n[\n  { "title": "Introduction", "order": 1 },\n  { "title": "Core Concepts", "order": 2 }\n]'}
              rows={7}
              className="w-full resize-y rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-[12px] font-mono text-neutral-700 placeholder:text-neutral-400
                         focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500
                         dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:placeholder:text-neutral-600
                         dark:focus:border-violet-500 dark:focus:ring-violet-500/40 transition-colors"
            />
            {parseError && (
              <p className="mt-1.5 text-[12px] text-red-500 dark:text-red-400">{parseError}</p>
            )}
          </div>

          {/* Action */}
          <button
            onClick={handleImport}
            disabled={!canImport}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-2.5 text-[13px] font-medium text-white transition-all
                       hover:bg-violet-500 active:bg-violet-700
                       disabled:cursor-not-allowed disabled:opacity-40
                       focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-950"
          >
            {importing ? (
              'Importing…'
            ) : (
              <>Import Chapters <ArrowRight size={14} strokeWidth={2} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
