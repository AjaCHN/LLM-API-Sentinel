// app/components/ShareButton.tsx v2.9.5
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/hooks/useI18n';
import { buildShareText } from '@/lib/share-content';

type CopyState = 'idle' | 'copying' | 'success' | 'error';

export default function ShareButton() {
  const { t } = useI18n();
  const [state, setState] = useState<CopyState>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const fallbackCopy = useCallback((text: string) => {
    // 非安全上下文降级方案
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    document.body.removeChild(textarea);
    return ok;
  }, []);

  const handleShare = useCallback(async () => {
    if (state === 'copying') return;
    setState('copying');
    const text = buildShareText();
    let ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        ok = true;
      } else {
        ok = fallbackCopy(text);
      }
    } catch {
      ok = fallbackCopy(text);
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    if (ok) {
      setState('success');
      timerRef.current = setTimeout(() => setState('idle'), 2000);
    } else {
      setState('error');
      timerRef.current = setTimeout(() => setState('idle'), 3000);
    }
  }, [state, t, fallbackCopy]);

  const label =
    state === 'success' ? t('share.copied')
    : state === 'error' ? t('share.copyFailed')
    : t('share.title');

  return (
    <div className="relative flex items-center">
      <button
        type="button"
        onClick={handleShare}
        disabled={state === 'copying'}
        aria-label={t('share.title')}
        className={cn(
          'group flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-60',
          state === 'success' && 'text-emerald-500',
          state === 'error' && 'text-destructive',
        )}
      >
        {state === 'success' ? (
          <Check className="size-5" />
        ) : state === 'copying' ? (
          <Copy className="size-5 animate-pulse" />
        ) : (
          <Share2 className="size-5 transition-colors group-hover:text-primary" />
        )}
      </button>
      {/* 瞬时反馈，可访问性使用 aria-live */}
      <span
        aria-live="polite"
        className={cn(
          'pointer-events-none absolute right-0 top-full mt-2 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium shadow-lg transition-opacity duration-200',
          state === 'success' && 'bg-emerald-500/15 text-emerald-500',
          state === 'error' && 'bg-destructive/15 text-destructive',
          (state === 'success' || state === 'error') ? 'opacity-100' : 'opacity-0',
        )}
      >
        {label}
      </span>
    </div>
  );
}
