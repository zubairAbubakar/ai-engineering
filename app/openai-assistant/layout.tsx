import React from 'react';

const StockAdviserLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className="flex h-full w-full items-center justify-center 
        bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-400 to-blue-800"
    >
      {children}
    </div>
  );
};

export default StockAdviserLayout;
