'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { haptic } from '@/lib/haptics';
import type { SessionState, SessionCompletedPayload } from '@/types';

export interface SessionHook {
  isActive: boolean;
  elapsed: number;
  sessionState: SessionState | null;
  completedPayload: SessionCompletedPayload | null;
  isConnected: boolean;
  startSession: (subjectId: string | null, targetDuration: number) => void;
  stopSession: () => void;
  abandonSession: () => void;
  clearCompleted: () => void;
}

export function useSession(): SessionHook {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [completedPayload, setCompletedPayload] = useState<SessionCompletedPayload | null>(null);

  useEffect(() => {
    const socket = io({ path: '/socket.io' });
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('session:state', (state: SessionState) => {
      setSessionState(state);
      if (state.isActive && state.elapsed !== undefined) {
        setElapsed(state.elapsed);
      } else if (!state.isActive) {
        setElapsed(0);
      }
    });

    socket.on('session:tick', ({ elapsed: e }: { elapsed: number }) => {
      setElapsed(e);
    });

    socket.on('session:completed', (payload: SessionCompletedPayload) => {
      haptic('success');
      setCompletedPayload(payload);
      setSessionState({ isActive: false });
      setElapsed(0);
    });

    socket.on('session:abandoned', () => {
      haptic('error');
      setSessionState({ isActive: false });
      setElapsed(0);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const startSession = useCallback((subjectId: string | null, targetDuration: number) => {
    haptic('start');
    setCompletedPayload(null);
    socketRef.current?.emit('session:start', { subjectId, targetDuration });
  }, []);

  const stopSession = useCallback(() => {
    haptic('stop');
    socketRef.current?.emit('session:stop');
  }, []);

  const abandonSession = useCallback(() => {
    socketRef.current?.emit('session:abandon');
  }, []);

  const clearCompleted = useCallback(() => {
    setCompletedPayload(null);
  }, []);

  return {
    isActive: sessionState?.isActive ?? false,
    elapsed,
    sessionState,
    completedPayload,
    isConnected,
    startSession,
    stopSession,
    abandonSession,
    clearCompleted,
  };
}
