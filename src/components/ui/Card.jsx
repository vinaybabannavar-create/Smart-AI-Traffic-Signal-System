import React from 'react';

const Card = ({ children, className = '', title, icon: Icon, action }) => {
  return (
    <div className={`glass-card p-6 flex flex-col ${className}`}>
      {(title || Icon || action) && (
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 bg-slate-800/50 rounded-lg text-primary-500">
                <Icon size={20} />
              </div>
            )}
            {title && <h3 className="text-lg font-semibold text-slate-100">{title}</h3>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="flex-1 flex flex-col text-slate-300">
        {children}
      </div>
    </div>
  );
};

export default Card;
