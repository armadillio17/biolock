import React from 'react';
import ReactDOM from 'react-dom'; // Required for portal
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      {/* Overlay (click to close) */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
        onClick={onClose} // Optional: close on backdrop click only
      >
        <div
          className={`bg-white rounded-xl shadow-lg w-full mx-auto ${className}`}
          onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing
        >
          {/* Modal Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Content */}
          <div
            className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]"
            style={{ maxHeight: "calc(90vh - 80px)" }}
          >
            {children}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};