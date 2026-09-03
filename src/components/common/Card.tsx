import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  action,
}) => {
  return (
    <div className={`glass-panel rounded-xl p-5 shadow-lg border border-slate-800/80 ${className}`}>
      {(title || action) && (
        <div className="flex items-start justify-between mb-4 pb-3 border-b border-slate-800/60">
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                {title}
              </h3>
            ) : (
              title
            )}
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
