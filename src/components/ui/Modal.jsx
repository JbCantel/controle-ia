import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { IconButton } from './Button';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export default function Modal({ open, title, onClose, children, size = 'md' }) {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const panel = panelRef.current;
    const initial = panel.querySelector('[data-autofocus]') || panel.querySelector('input,select,textarea') || panel.querySelector(FOCUSABLE);
    initial?.focus();

    function onKeyDown(event) {
      if (event.key === 'Escape') { onCloseRef.current(); return; }
      if (event.key !== 'Tab') return;
      const items = Array.from(panel.querySelectorAll(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previous?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-bg/80 sm:items-center sm:p-4"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`max-h-[90dvh] w-full overflow-y-auto rounded-t-card border border-line bg-surface p-6 sm:rounded-card ${size === 'lg' ? 'sm:max-w-lg' : 'sm:max-w-md'}`}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id={titleId} className="font-display text-2xl font-semibold tracking-[-0.025em] text-ink">{title}</h2>
          <IconButton label="Fechar" onClick={onClose}><X size={18} aria-hidden /></IconButton>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
