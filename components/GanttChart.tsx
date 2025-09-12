import React from 'react';
import type { Test } from '../types';

interface GanttChartProps {
    tests: Test[];
}

const GanttChart: React.FC<GanttChartProps> = ({ tests }) => {
    if (tests.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow h-full flex items-center justify-center">
                <p className="text-gray-500">간트 차트를 표시할 시험 데이터가 없습니다.</p>
            </div>
        );
    }
    
    const parseDate = (dateStr: string) => new Date(dateStr).getTime();

    const dateRange = tests.reduce((acc, test) => {
        const start = parseDate(test.startDate);
        const end = parseDate(test.endDate);
        if (start < acc.min) acc.min = start;
        if (end > acc.max) acc.max = end;
        return acc;
    }, { min: Infinity, max: -Infinity });

    const totalDuration = dateRange.max - dateRange.min;
    
    // Add a buffer to the timeline
    const chartStartTime = dateRange.min - (totalDuration * 0.05);
    const chartEndTime = dateRange.max + (totalDuration * 0.05);
    const chartTotalDuration = chartEndTime - chartStartTime;
    
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-indigo-500'];

    return (
        <div className="bg-white p-4 rounded-lg shadow h-full">
             <div className="space-y-4" style={{minHeight: '300px'}}>
                {tests.map((test, index) => {
                    const testStart = parseDate(test.startDate);
                    const testEnd = parseDate(test.endDate);

                    const offset = ((testStart - chartStartTime) / chartTotalDuration) * 100;
                    const width = ((testEnd - testStart) / chartTotalDuration) * 100;

                    return (
                        <div key={test.id} className="group relative">
                            <p className="text-sm font-medium text-gray-800 mb-1 truncate">{test.testNumber}: {test.testManager}</p>
                            <div className="w-full bg-gray-200 rounded-full h-6">
                                <div 
                                    className={`h-6 rounded-full ${colors[index % colors.length]} transition-all duration-300 ease-out`}
                                    style={{ marginLeft: `${offset}%`, width: `${width}%` }}
                                ></div>
                            </div>
                            <div className="absolute top-full mt-1 w-full flex justify-between text-xs text-gray-400">
                                <span>{test.startDate}</span>
                                <span>{test.endDate}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default GanttChart;