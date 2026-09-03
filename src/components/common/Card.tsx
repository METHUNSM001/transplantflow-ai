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
    <div className={`bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm hover:shadow transition-shadow duration-200 text-slate-800 ${className}`}>
      {(title || action) && (
        <div className="flex items-start justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                {title}
              </h3>
            ) : (
              title
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
