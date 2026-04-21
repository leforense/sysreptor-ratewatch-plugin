import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { BurpEntry } from '../types';

interface TimeSeriesChartProps {
  data: BurpEntry[];
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ data }) => {
  // Determine if we have valid latency data (check if any latency > 0)
  const hasLatency = useMemo(() => data.some(d => d.latency > 0), [data]);

  const uniqueStatusCodes = useMemo(() => {
      const codes = new Set<number>();
      data.forEach(d => codes.add(d.statusCode));
      return Array.from(codes).sort((a, b) => {
          // Render 200 last so it appears on top of other scatter points
          if (a === 200) return 1;
          if (b === 200) return -1;
          return a - b;
      });
  }, [data]);

  const getColor = (code: number) => {
      if (code >= 200 && code < 300) return '#10b981'; // Green
      if (code >= 300 && code < 400) return '#3b82f6'; // Blue
      if (code === 429) return '#f59e0b'; // Orange/Yellow
      if (code === 403) return '#ef4444'; // Red
      if (code >= 500) return '#a855f7'; // Purple
      return '#64748b'; // Slate
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl text-xs">
          <p className="text-slate-400 mb-1">{new Date(data.timestamp).toLocaleTimeString('pt-BR')}</p>
          <p className="font-bold text-slate-200">ID: {data.id}</p>
          <p className="font-bold" style={{ color: getColor(data.statusCode) }}>Status: {data.statusCode}</p>
          {hasLatency && <p className="text-slate-300">Latência: {data.latency} ms</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
          
          <XAxis 
            dataKey="timestamp" 
            type="number" 
            name="Horário" 
            domain={['dataMin', 'dataMax']}
            tickFormatter={(unixTime) => new Date(unixTime).toLocaleTimeString('pt-BR')}
            stroke="#94a3b8" 
            tick={{fontSize: 12}}
          />
          
          <YAxis 
            dataKey={hasLatency ? "latency" : "statusCode"}
            type="number" 
            name={hasLatency ? "Latência (ms)" : "Status Code"}
            stroke="#94a3b8" 
            tick={{fontSize: 12}}
            label={{ 
                value: hasLatency ? 'Tempo (ms)' : 'Código Status', 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: '#64748b', fontSize: 12 }
            }}
          />

          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

          {uniqueStatusCodes.map(code => (
             <Scatter 
                key={code} 
                name={`Status ${code}`} 
                data={data.filter(d => d.statusCode === code)}
                fill={getColor(code)}
                shape="circle"
             />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};