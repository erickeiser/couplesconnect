
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`bg-gray-800/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl shadow-purple-900/20 ${className}`}>
      {children}
    </div>
  );
};
