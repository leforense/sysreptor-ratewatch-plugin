import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import { AttackStats } from '../types';

interface StatsBarChartProps {
  stats: AttackStats;
}

export const StatsBarChart: React.FC<StatsBarChartProps> = ({ stats }) => {
  const data = [
    { name: 'Timeouts (H)', value: stats.totalTimeouts, color: '#f59e0b' },
    { name: 'Errors (G)', value: stats.totalErrors, color: '#ef4444' },
    { name: 'Total Reqs', value: stats.totalRequests, color: '#3b82f6' },
  ];

  return (
    <div className="w-full h-full min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
          <XAxis type="number" stroke="#94a3b8" />
          <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} />
          <Tooltip 
            cursor={{fill: '#334155', opacity: 0.2}}
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};