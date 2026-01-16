import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { TriangleAlert } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  warning?: string; // linha de alerta extra
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: React.ReactNode;
  danger?: boolean; // pinta o botão principal de vermelho
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  warning,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  icon,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  // Bloqueia scroll do body quando aberto
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  // Foco inicial + fechar com Esc
  useEffect(() => {
    if (!isOpen) return;
    firstFocusRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-xl p-10 shadow-xl max-w-lg w-[92%] text-center"
      >
        <div className="mx-auto text-red-600 mb-2 flex justify-center">
          {icon ?? <TriangleAlert className="h-30 w-30" />}
        </div>

        <h2 id="confirm-dialog-title" className="text-xl font-semibold text-gray-900">
          {title}
        </h2>

        {description && (
          <p className="mt-2 text-gray-700">{description}</p>
        )}

        {warning && (
          <p className="mt-3 border-l-4 border-red-500 bg-red-100 text-red-900 font-medium px-4 py-2 rounded-lg text-left">
            {warning}
          </p>
        )}

        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            ref={firstFocusRef}
            className={"px-6 py-2 rounded-lg font-medium text-white transition bg-red-600 hover:bg-red-700 cursor-pointer"
             }
            onClick={onConfirm}
          >
            {confirmText}
          </button>

          <button
            className="px-6 py-2 rounded-lg font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 transition cursor-pointer"
            onClick={onCancel}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
