import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  count: number;
  icon: typeof LucideIcon;
  gradient: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, count, icon: Icon, gradient, delay = 0 }) => {
  return (
    <div 
      className="group relative bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1"
      style={{ 
        animationDelay: `${delay}ms`,
        animation: 'slideInUp 0.6s ease-out forwards'
      }}
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 ${gradient} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 tabular-nums">{count}</p>
        </div>
        <div className={`w-12 h-12 ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Subtle animation indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};

export default StatCard;