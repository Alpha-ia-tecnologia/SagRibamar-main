import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { CircleCheck } from "lucide-react";

interface SuccessDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  buttonText?: string;
  onClose: () => void;
}

export function SuccessDialog({
  isOpen,
  title,
  description,
  buttonText = "Ok",
  onClose,
}: SuccessDialogProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    buttonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-dialog-title"
    >
      <div className="bg-white rounded-xl p-10 shadow-xl max-w-lg w-[92%] text-center">
        <div className="mx-auto text-green-600 mb-2 flex justify-center">
          <CircleCheck className="h-20 w-20" />
        </div>

        <h2 id="success-dialog-title" className="text-xl font-semibold text-gray-900">
          {title}
        </h2>

        {description && (
          <p className="mt-2 text-gray-700">{description}</p>
        )}

        <div className="flex items-center justify-center mt-6">
          <button
            ref={buttonRef}
            className="px-6 py-2 rounded-lg font-medium text-white transition bg-green-600 hover:bg-green-700 cursor-pointer"
            onClick={onClose}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
