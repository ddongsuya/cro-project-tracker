import React from 'react';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface SimpleChartProps {
  data: ChartData[];
  type: 'bar' | 'pie' | 'line';
  title?: string;
  height?: number;
}

const SimpleChart: React.FC<SimpleChartProps> = ({ data, type, title, height = 200 }) => {
  const maxValue = Math.max(...data.map(d => d.value));

  if (type === 'bar') {
    return (
      <div className="bg-white p-4 rounded-lg">
        {title && <h4 className="font-medium text-slate-700 mb-4">{title}</h4>}
        <div className="space-y-3" style={{ height }}>
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-20 text-sm text-slate-600 truncate">{item.label}</div>
              <div className="flex-1 bg-slate-200 rounded-full h-6 relative overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                  style={{
                    width: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: item.color,
                  }}
                >
                  <span className="text-xs text-white font-medium">
                    {item.value}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'pie') {
    const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
    let currentAngle = 0;

    // total이 0이면 빈 차트 표시
    if (total === 0) {
      return (
        <div className="bg-white p-4 rounded-lg">
          {title && <h4 className="font-medium text-slate-700 mb-4">{title}</h4>}
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="text-slate-400 text-center">
              <div className="text-4xl mb-2">📊</div>
              <div className="text-sm">데이터가 없습니다</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white p-4 rounded-lg">
        {title && <h4 className="font-medium text-slate-700 mb-4">{title}</h4>}
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="relative">
            <svg width="160" height="160" className="transform -rotate-90">
              {data.map((item, index) => {
                const value = item.value || 0;
                const percentage = (value / total) * 100;
                const angle = (value / total) * 360;
                const radius = 70;
                const circumference = 2 * Math.PI * radius;
                const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -((currentAngle / 360) * circumference);
                
                currentAngle += angle;
                
                // NaN 체크
                if (isNaN(percentage) || isNaN(strokeDashoffset)) {
                  return null;
                }
                
                return (
                  <circle
                    key={index}
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth="20"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">{total}</div>
                <div className="text-xs text-slate-500">Total</div>
              </div>
            </div>
          </div>
          <div className="ml-6 space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-slate-600">{item.label}</span>
                <span className="text-sm font-medium text-slate-800">
                  {item.value} ({((item.value / total) * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'line') {
    const width = 300;
    const chartHeight = height - 40;
    const padding = 40;
    
    return (
      <div className="bg-white p-4 rounded-lg">
        {title && <h4 className="font-medium text-slate-700 mb-4">{title}</h4>}
        <div style={{ height }}>
          <svg width={width} height={height} className="overflow-visible">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
              <line
                key={index}
                x1={padding}
                y1={padding + chartHeight * ratio}
                x2={width - padding}
                y2={padding + chartHeight * ratio}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
            ))}
            
            {/* Data line */}
            <polyline
              fill="none"
              stroke={data[0]?.color || '#3b82f6'}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={data.map((item, index) => {
                const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
                const y = padding + chartHeight - (item.value / maxValue) * chartHeight;
                return `${x},${y}`;
              }).join(' ')}
              className="transition-all duration-1000 ease-out"
            />
            
            {/* Data points */}
            {data.map((item, index) => {
              const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
              const y = padding + chartHeight - (item.value / maxValue) * chartHeight;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill={item.color || '#3b82f6'}
                  className="transition-all duration-1000 ease-out"
                />
              );
            })}
            
            {/* Labels */}
            {data.map((item, index) => {
              const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
              return (
                <text
                  key={index}
                  x={x}
                  y={height - 10}
                  textAnchor="middle"
                  className="text-xs fill-slate-600"
                >
                  {item.label}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
    );
  }

  return null;
};

export default SimpleChart;