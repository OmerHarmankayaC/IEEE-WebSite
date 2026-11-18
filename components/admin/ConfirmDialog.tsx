"use client";

import { useEffect, useRef } from "react";

type Props = {
  title: string;
  body: string;
  confirmLabel: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

/** Modal confirmation built on the native <dialog> element. */
export function ConfirmDialog({ title, body, confirmLabel, busy = false, onCancel, onConfirm }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby="dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onCancel();
      }}
    >
      <div className="dialog__bar">Yazıyı sil</div>
      <div className="dialog__body">
        <h2 id="dialog-title">{title}</h2>
        <p>{body}</p>
      </div>
      <div className="dialog__actions">
        <button type="button" className="btn btn--outline btn--small" onClick={onCancel} disabled={busy} autoFocus>
          Vazgeç
        </button>
        <button type="button" className="btn btn--danger btn--small" onClick={onConfirm} disabled={busy}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
