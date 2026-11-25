import React from 'react';
import { Construction } from 'lucide-react';

// Red notice for parts of the app that are still being built (therapist portal).
export const UnderConstructionNotice = ({ className = '' }) => (
  <div
    role="alert"
    className={`flex items-start gap-2.5 p-3.5 rounded-xl border border-red-300 bg-red-50 text-xs text-red-800 ${className}`}
  >
    <Construction className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
    <div className="leading-relaxed">
      <p className="font-bold text-red-700">The therapist portal is under construction.</p>
      <p>
        This is only a preview, so some features may not work yet. Sorry for the inconvenience.
      </p>
    </div>
  </div>
);

export default UnderConstructionNotice;
