import React from 'react';
import { 
  AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';

interface DashboardWidgetProps {
  title: string;
  data: any[];
  isLoading?: boolean;
}

export default function DashboardWidget({ title, data, isLoading }: DashboardWidgetProps) {
  return (
    <div className="bg-white border border-vanilla-main rounded-[20px] p-6 shadow-sm">
      <h3 className="text-sm font-bold text-brand-secondary font-display mb-6">{title}</h3>
      <div className={`h-72 transition-opacity duration-500 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2B9348" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2B9348" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5F5B8" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8395A7' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8395A7' }} tickFormatter={(value) => `$${value/1000}k`} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E5F5B8' }} />
            <Area type="monotone" dataKey="value" stroke="#2B9348" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
