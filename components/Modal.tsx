import React, { PropsWithChildren } from 'react';
import XMarkIcon from './icons/XMarkIcon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

const Modal: React.FC<PropsWithChildren<ModalProps>> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center animate-in fade-in duration-200" 
      aria-modal="true" 
      role="dialog"
      onClick={onClose}
    >
      <div 
        className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-2xl m-4 max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-blue-50/30">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
            {title}
          </h3>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200 transform hover:scale-110"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
