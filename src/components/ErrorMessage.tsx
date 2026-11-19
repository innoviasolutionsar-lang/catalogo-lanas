import React from 'react';
import { RefreshCw, WifiOff } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="max-w-lg mx-auto my-12 p-8 bg-white border border-[#E8E2D9] rounded-2xl text-center shadow-xs">
      <div className="w-14 h-14 mx-auto rounded-full bg-[#FAF0EC] border border-[#F2D7CD] flex items-center justify-center text-[#B86B52] mb-4">
        <WifiOff className="w-7 h-7" />
      </div>
      <h3 className="font-display text-xl font-semibold text-[#2D2721] mb-2">
        No pudimos cargar los productos
      </h3>
      <p className="text-sm text-[#786F66] mb-6 leading-relaxed">
        {message ||
          'Hubo un problema de conexión con el catálogo. Verificá tu red o intentá nuevamente.'}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#B86B52] hover:bg-[#9E553E] text-white text-sm font-semibold transition-all shadow-xs hover:shadow"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Reintentar ahora</span>
      </button>
    </div>
  );
};
