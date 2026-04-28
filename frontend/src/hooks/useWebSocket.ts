'use client';
import { useEffect, useCallback } from 'react';
import { getSocket, joinDeal, leaveDeal } from '@/lib/websocket';

type EventHandler = (data: any) => void;

export function useDealSocket(
  dealId: string | null,
  handlers: Record<string, EventHandler>,
) {
  useEffect(() => {
    if (!dealId) return;
    const socket = getSocket();
    joinDeal(dealId);

    const cleanup = Object.entries(handlers).map(([event, handler]) => {
      socket.on(event, handler);
      return () => socket.off(event, handler);
    });

    return () => {
      cleanup.forEach((fn) => fn());
      leaveDeal(dealId);
    };
  }, [dealId]); // eslint-disable-line react-hooks/exhaustive-deps
}

export function useNotificationSocket(handler: EventHandler) {
  useEffect(() => {
    const socket = getSocket();
    socket.on('notification:new', handler);
    return () => { socket.off('notification:new', handler); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
