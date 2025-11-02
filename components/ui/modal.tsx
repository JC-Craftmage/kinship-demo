// Reusable modal component used across all features

import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  titleIcon?: ReactNode;
  headerColor?: string;
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  titleIcon,
  headerColor = 'from-indigo-600 to-purple-600'
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full"
        style={{
          maxHeight: '90vh',
          overflowY: 'scroll',
          WebkitOverflowScrolling: 'touch'
        }}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className={`sticky top-0 bg-gradient-to-r ${headerColor} text-white p-6 rounded-t-2xl z-10`}>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                {titleIcon && <div>{titleIcon}</div>}
                <h2 className="text-3xl font-bold">{title}</h2>
              </div>
              <button onClick={onClose} className="text-white hover:opacity-80 transition">
                <X size={28} />
              </button>
            </div>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
