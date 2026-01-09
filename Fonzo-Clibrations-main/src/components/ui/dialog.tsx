import { X } from "lucide-react";
import { useEffect } from "react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  onClose?: () => void;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Enhanced Backdrop with gradient */}
      <div
        className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 backdrop-blur-md transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      {/* Content with animation */}
      <div className="relative z-50 w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ children, className = "", title, onClose }: DialogContentProps) {
  return (
    <div className={`bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-auto border border-gray-200/50 overflow-hidden ${className}`}>
      {title && (
        <div className="relative border-b border-gray-200 px-6 py-5 bg-gradient-to-r from-gray-50 to-white rounded-t-xl">
          <h2 className="text-2xl font-bold text-gray-900 pr-10">{title}</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-200/70 transition-all duration-200 group"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

export function DialogHeader({ children, className = "", onClose }: { children: React.ReactNode; className?: string; onClose?: () => void }) {
  return (
    <div className={`relative px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-t-xl ${className}`}>
      {children}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-200/70 transition-all duration-200 group"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
        </button>
      )}
    </div>
  );
}

export function DialogTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`text-2xl font-bold text-gray-900 pr-10 ${className}`}>{children}</h2>;
}

export function DialogBody({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-6 py-6 ${className}`}>{children}</div>;
}

export function DialogFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-5 border-t border-gray-200 bg-gray-50/50 flex justify-end gap-3 rounded-b-xl ${className}`}>
      {children}
    </div>
  );
}
