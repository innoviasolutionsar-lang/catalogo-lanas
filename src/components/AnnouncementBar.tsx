import React from 'react';
import { Truck, MapPin } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="bg-[#F3EFEA] border-b border-[#E8E2D9] text-[#786F66] text-[11px] py-1.5 px-3">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 sm:gap-5 text-center tracking-wide font-medium">
        <span className="inline-flex items-center gap-1">
          <Truck className="w-3 h-3 text-[#B86B52]" />
          <span>Envíos a todo el país</span>
        </span>
        <span className="text-[#D8CFBF]">•</span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="w-3 h-3 text-[#B86B52]" />
          <span>Retiro sin cargo en Talca</span>
        </span>
      </div>
    </div>
  );
};
