import React from 'react';
import { Info } from 'lucide-react';

// Banner for features that run on sample data only.
export const DemoNotice = ({ children }) => (
  <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-amber-200 bg-amber-50 text-xs text-amber-900">
    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
    <div className="leading-relaxed">
      <span className="font-bold">Demo feature. </span>
      {children}
    </div>
  </div>
);

export default DemoNotice;
