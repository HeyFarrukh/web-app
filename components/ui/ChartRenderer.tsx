'use client';

import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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
  primary: 'rgba(249, 115, 22, 1)', // Orange primary
  primaryLight: 'rgba(249, 115, 22, 0.2)',
  secondary: 'rgba(59, 130, 246, 1)', // Blue secondary
  secondaryLight: 'rgba(59, 130, 246, 0.2)',
  tertiary: 'rgba(16, 185, 129, 1)', // Green tertiary
  tertiaryLight: 'rgba(16, 185, 129, 0.2)',
  quaternary: 'rgba(139, 92, 246, 1)', // Purple quaternary
  quaternaryLight: 'rgba(139, 92, 246, 0.2)',
  quinary: 'rgba(236, 72, 153, 1)', // Pink quinary
  quinaryLight: 'rgba(236, 72, 153, 0.2)',
  senary: 'rgba(234, 179, 8, 1)', // Yellow senary
  senaryLight: 'rgba(234, 179, 8, 0.2)',
  text: 'rgba(17, 24, 39, 1)', // Dark text
  textLight: 'rgba(107, 114, 128, 1)', // Light text
  background: 'rgba(255, 255, 255, 1)', // White background
  backgroundDark: 'rgba(249, 250, 251, 1)', // Light gray background
  border: 'rgba(229, 231, 235, 1)', // Border color
};

// Default color palettes for different chart types
const defaultColors = {
  bar: {
    backgroundColor: [
      themeColors.primaryLight,
      themeColors.secondaryLight,
      themeColors.tertiaryLight,
      themeColors.quaternaryLight,
      themeColors.quinaryLight,
      themeColors.senaryLight,
    ],
    borderColor: [
      themeColors.primary,
      themeColors.secondary,
      themeColors.tertiary,
      themeColors.quaternary,
      themeColors.quinary,
      themeColors.senary,
    ],
  },
  line: {
    backgroundColor: 'transparent',
    borderColor: [
      themeColors.primary,
      themeColors.secondary,
      themeColors.tertiary,
      themeColors.quaternary,
      themeColors.quinary,
      themeColors.senary,
    ],
  },
  pie: {
    backgroundColor: [
      themeColors.primaryLight,
      themeColors.secondaryLight,
      themeColors.tertiaryLight,
      themeColors.quaternaryLight,
      themeColors.quinaryLight,
      themeColors.senaryLight,
    ],
    borderColor: [
      themeColors.primary,
      themeColors.secondary,
      themeColors.tertiary,
      themeColors.quaternary,
      themeColors.quinary,
      themeColors.senary,
    ],
  },
  doughnut: {
    backgroundColor: [
      themeColors.primaryLight,
      themeColors.secondaryLight,
      themeColors.tertiaryLight,
      themeColors.quaternaryLight,
      themeColors.quinaryLight,
      themeColors.senaryLight,
    ],
    borderColor: [
      themeColors.primary,
      themeColors.secondary,
      themeColors.tertiary,
      themeColors.quaternary,
      themeColors.quinary,
      themeColors.senary,
    ],
  },
};

export const ChartRenderer: React.FC<ChartRendererProps> = ({
  type,
  data,
  title = '',
  height = 300,
  width = 600,
}) => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
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

      // Get the appropriate color palette for the chart type
      const colorPalette = defaultColors[type];

      // Add theme colors if not provided
      const processedDatasets = parsedData.datasets.map((dataset: any, index: number) => {
        const colorIndex = index % colorPalette.borderColor.length;
        
        // For pie and doughnut charts, we need an array of colors for each data point
        if (type === 'pie' || type === 'doughnut') {
          // For pie/doughnut, each slice gets its own color
          const dataLength = dataset.data.length;
          const backgroundColors = [];
          const borderColors = [];
          
          // Generate colors for each data point
          for (let i = 0; i < dataLength; i++) {
            const colorIdx = i % colorPalette.backgroundColor.length;
            backgroundColors.push(colorPalette.backgroundColor[colorIdx]);
            borderColors.push(colorPalette.borderColor[colorIdx]);
          }
          
          return {
            ...dataset,
            backgroundColor: dataset.backgroundColor || backgroundColors,
            borderColor: dataset.borderColor || borderColors,
            borderWidth: dataset.borderWidth || 1,
          };
        }
        
        // For bar charts
        if (type === 'bar') {
          return {
            ...dataset,
            backgroundColor: dataset.backgroundColor || colorPalette.backgroundColor[colorIndex],
            borderColor: dataset.borderColor || colorPalette.borderColor[colorIndex],
            borderWidth: dataset.borderWidth || 1,
          };
        }
        
        // For line charts
        if (type === 'line') {
          return {
            ...dataset,
            backgroundColor: dataset.backgroundColor || 'transparent',
            borderColor: dataset.borderColor || colorPalette.borderColor[colorIndex],
            borderWidth: dataset.borderWidth || 2,
            tension: dataset.tension || 0.4, // Add some curve to lines
            pointBackgroundColor: colorPalette.borderColor[colorIndex],
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: colorPalette.borderColor[colorIndex],
            pointRadius: 4,
            pointHoverRadius: 6,
          };
        }
        
        // Default case
        return {
          ...dataset,
          backgroundColor: dataset.backgroundColor || colorPalette.backgroundColor[colorIndex],
          borderColor: dataset.borderColor || colorPalette.borderColor[colorIndex],
          borderWidth: dataset.borderWidth || 1,
        };
      });

      setChartData({
        labels: parsedData.labels,
        datasets: processedDatasets,
      });
      
    } catch (err) {
      console.error('Error parsing chart data:', err, 'Raw data:', data);
      setError(err instanceof Error ? err.message : 'Error parsing chart data');
    }
  }, [data, type]);

  // ApprenticeWatch themed chart options
  const options: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          color: themeColors.text,
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: !!title,
        text: title,
        font: {
          family: "'Inter', sans-serif",
          size: 16,
          weight: 'bold',
        },
        color: themeColors.text,
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: themeColors.text,
        bodyColor: themeColors.textLight,
        borderColor: themeColors.border,
        borderWidth: 1,
        cornerRadius: 8,
        boxPadding: 6,
        usePointStyle: true,
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 13,
        },
        callbacks: {
          // Format numbers with commas for thousands
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-GB').format(context.parsed.y);
            } else if (context.parsed !== null && typeof context.parsed === 'number') {
              label += new Intl.NumberFormat('en-GB').format(context.parsed);
            }
            return label;
          }
        }
      },
    },
    scales: type === 'bar' || type === 'line' ? {
      x: {
        grid: {
          color: 'rgba(229, 231, 235, 0.5)',
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          color: themeColors.textLight,
          callback: function(value: any) {
            return new Intl.NumberFormat('en-GB').format(value as number);
          }
        },
      },
      y: {
        grid: {
          color: 'rgba(229, 231, 235, 0.5)',
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          color: themeColors.textLight,
          callback: function(value: any) {
            return new Intl.NumberFormat('en-GB').format(value as number);
          }
        },
        beginAtZero: true,
      },
    } : undefined,
  };

  // Additional options for doughnut and pie charts
  if (type === 'doughnut' || type === 'pie') {
    options.plugins = {
      ...options.plugins,
      legend: {
        ...options.plugins?.legend,
        position: 'right',
      },
    };
  }

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

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'line':
        return <Line data={chartData} options={options} />;
      case 'pie':
        return <Pie data={chartData} options={options} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={options} />;
      default:
        return <Bar data={chartData} options={options} />;
    }
  };

  return (
    <div className="chart-container bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 my-6">
      <div style={{ height, width: '100%', maxWidth: width, margin: '0 auto' }}>
        {renderChart()}
      </div>
    </div>
  );
};

export default ChartRenderer;
