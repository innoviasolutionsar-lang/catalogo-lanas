import React from 'react';
import { Truck, Store, Sparkles } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="bg-[#F3EFEA] border-b border-[#E8E2D9] text-[#786F66] text-[11px] py-1.5 px-3">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2.5 sm:gap-4 text-center tracking-wide font-medium flex-wrap">
        <span className="inline-flex items-center gap-1">
          <Truck className="w-3 h-3 text-[#B86B52]" />
          <span>Envíos a todo Chile vía Starken y Chilexpress</span>
        </span>
        <span className="text-[#D8CFBF] hidden sm:inline">•</span>
        <span className="inline-flex items-center gap-1">
          <Store className="w-3 h-3 text-[#B86B52]" />
          <span>Retiro en tienda</span>
        </span>
        <span className="text-[#D8CFBF] hidden md:inline">•</span>
        <span className="inline-flex items-center gap-1 hidden md:inline-flex">
          <Sparkles className="w-3 h-3 text-[#B86B52]" />
          <span>Consulta stock de partidas</span>
        </span>
      </div>
    </div>
  );
};
