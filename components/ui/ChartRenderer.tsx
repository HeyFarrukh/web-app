'use client';

import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Sector,
  Label
} from 'recharts';

// Define chart types
type ChartType = 'bar' | 'line' | 'pie' | 'doughnut';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    tension?: number;
  }[];
}

interface ChartRendererProps {
  type: ChartType;
  data: string;
  title?: string;
  height?: number;
  width?: number;
}

// ApprenticeWatch theme colors
const themeColors = {
  primary: '#f97316', // Orange primary (from tailwind config)
  primaryLight: '#fdba74',
  primaryLighter: '#ffedd5',
  secondary: '#3b82f6', // Blue
  secondaryLight: '#93c5fd',
  tertiary: '#10b981', // Green
  tertiaryLight: '#6ee7b7',
  quaternary: '#8b5cf6', // Purple
  quaternaryLight: '#c4b5fd',
  quinary: '#ec4899', // Pink
  quinaryLight: '#f9a8d4',
  senary: '#eab308', // Yellow
  senaryLight: '#fde68a',
  text: '#111827', // Dark text
  textLight: '#6b7280', // Light text
  background: '#ffffff', // White background
  backgroundDark: '#f9fafb', // Light gray background
  border: '#e5e7eb', // Border color
};

// Color palettes for different chart types
const chartColors = {
  bar: [
    themeColors.primary,
    themeColors.secondary,
    themeColors.tertiary,
    themeColors.quaternary,
    themeColors.quinary,
    themeColors.senary,
  ],
  line: [
    themeColors.primary,
    themeColors.secondary,
    themeColors.tertiary,
    themeColors.quaternary,
    themeColors.quinary,
    themeColors.senary,
  ],
  pie: [
    themeColors.primary,
    themeColors.secondary,
    themeColors.tertiary,
    themeColors.quaternary,
    themeColors.quinary,
    themeColors.senary,
  ],
  doughnut: [
    themeColors.primary,
    themeColors.secondary,
    themeColors.tertiary,
    themeColors.quaternary,
    themeColors.quinary,
    themeColors.senary,
  ],
};

// Custom tooltip component for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {new Intl.NumberFormat('en-GB').format(entry.value)}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

// Custom active shape for pie/doughnut charts
const renderActiveShape = (props: any) => {
  const { 
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value 
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius - 5}
        outerRadius={innerRadius - 1}
        fill={fill}
      />
      <text x={cx} y={cy - 15} dy={8} textAnchor="middle" fill={themeColors.text} className="text-sm font-medium">
        {payload.name}
      </text>
      <text x={cx} y={cy + 15} textAnchor="middle" fill={themeColors.textLight} className="text-sm">
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    </g>
  );
};

export const ChartRenderer: React.FC<ChartRendererProps> = ({
  type,
  data,
  title = '',
  height = 300,
  width = 600,
}) => {
  const [chartData, setChartData] = useState<any[] | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Parse the JSON data string if it's a string
      let parsedData;
      
      if (typeof data === 'string') {
        console.log('Parsing chart data string:', data);
        parsedData = JSON.parse(data);
      } else {
        parsedData = data;
      }
      
      // Validate the data structure
      if (!parsedData.labels || !Array.isArray(parsedData.labels)) {
        throw new Error('Chart data must include labels array');
      }
      
      if (!parsedData.datasets || !Array.isArray(parsedData.datasets)) {
        throw new Error('Chart data must include datasets array');
      }

      // Transform the data from Chart.js format to Recharts format
      const transformedData = parsedData.labels.map((label: string, index: number) => {
        const dataPoint: any = { name: label };
        
        parsedData.datasets.forEach((dataset: any, datasetIndex: number) => {
          const datasetLabel = dataset.label || `Dataset ${datasetIndex + 1}`;
          dataPoint[datasetLabel] = dataset.data[index];
        });
        
        return dataPoint;
      });

      setChartData(transformedData);
      
    } catch (err) {
      console.error('Error parsing chart data:', err, 'Raw data:', data);
      setError(err instanceof Error ? err.message : 'Error parsing chart data');
    }
  }, [data, type]);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  if (error) {
    return (
      <div className="chart-error bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 my-4">
        <p className="text-red-600 dark:text-red-400 text-sm">
          <strong>Chart Error:</strong> {error}
        </p>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="chart-loading bg-gray-50 dark:bg-gray-800 rounded-lg p-4 my-4 animate-pulse">
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  // Get dataset labels
  const datasetLabels = JSON.parse(typeof data === 'string' ? data : JSON.stringify(data)).datasets.map(
    (dataset: any) => dataset.label || 'Dataset'
  );

  // Render the appropriate chart based on type
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={themeColors.border} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: themeColors.textLight, fontSize: 12 }}
                tickLine={{ stroke: themeColors.border }}
                axisLine={{ stroke: themeColors.border }}
              />
              <YAxis 
                tick={{ fill: themeColors.textLight, fontSize: 12 }}
                tickLine={{ stroke: themeColors.border }}
                axisLine={{ stroke: themeColors.border }}
                tickFormatter={(value) => new Intl.NumberFormat('en-GB').format(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: '10px',
                  fontSize: '12px',
                  fontFamily: "'Inter', sans-serif"
                }} 
              />
              {datasetLabels.map((label: string, index: number) => (
                <Bar 
                  key={`bar-${index}`}
                  dataKey={label} 
                  fill={chartColors.bar[index % chartColors.bar.length]}
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={themeColors.border} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: themeColors.textLight, fontSize: 12 }}
                tickLine={{ stroke: themeColors.border }}
                axisLine={{ stroke: themeColors.border }}
              />
              <YAxis 
                tick={{ fill: themeColors.textLight, fontSize: 12 }}
                tickLine={{ stroke: themeColors.border }}
                axisLine={{ stroke: themeColors.border }}
                tickFormatter={(value) => new Intl.NumberFormat('en-GB').format(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: '10px',
                  fontSize: '12px',
                  fontFamily: "'Inter', sans-serif"
                }} 
              />
              {datasetLabels.map((label: string, index: number) => (
                <Line 
                  key={`line-${index}`}
                  type="monotone" 
                  dataKey={label} 
                  stroke={chartColors.line[index % chartColors.line.length]}
                  strokeWidth={3}
                  dot={{ 
                    fill: chartColors.line[index % chartColors.line.length],
                    stroke: '#fff',
                    strokeWidth: 2,
                    r: 6 
                  }}
                  activeDot={{ 
                    fill: chartColors.line[index % chartColors.line.length],
                    stroke: '#fff',
                    strokeWidth: 2,
                    r: 8 
                  }}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
      case 'doughnut':
        // For pie/doughnut, we need to transform the data differently
        const pieData = JSON.parse(typeof data === 'string' ? data : JSON.stringify(data));
        const pieChartData = pieData.labels.map((label: string, index: number) => ({
          name: label,
          value: pieData.datasets[0].data[index]
        }));
        
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={pieChartData}
                cx="50%"
                cy="50%"
                innerRadius={type === 'doughnut' ? 60 : 0}
                outerRadius={100}
                fill={themeColors.primary}
                dataKey="value"
                onMouseEnter={onPieEnter}
                animationDuration={1500}
                animationEasing="ease-in-out"
                paddingAngle={2}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {pieChartData.map((_: any, index: number) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={chartColors.pie[index % chartColors.pie.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => new Intl.NumberFormat('en-GB').format(value as number)}
                content={<CustomTooltip />}
              />
              <Legend 
                layout="vertical" 
                align="right" 
                verticalAlign="middle"
                wrapperStyle={{ 
                  fontSize: '12px',
                  fontFamily: "'Inter', sans-serif",
                  paddingLeft: '20px'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className="chart-container bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 my-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
          {title}
        </h3>
      )}
      <div style={{ width: '100%', maxWidth: width, margin: '0 auto' }}>
        {renderChart()}
      </div>
    </div>
  );
};

export default ChartRenderer;
