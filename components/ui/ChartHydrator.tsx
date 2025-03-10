'use client';

import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import ChartRenderer from './ChartRenderer';

export const ChartHydrator: React.FC = () => {
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    
    // Find all chart wrapper elements
    const chartWrappers = document.querySelectorAll('.chart-wrapper');
    
    if (chartWrappers.length === 0) {
      console.log('No chart wrappers found in the document');
    } else {
      console.log(`Found ${chartWrappers.length} chart wrappers`);
    }
    
    // Replace each wrapper with the actual chart component
    chartWrappers.forEach((wrapper) => {
      const chartType = wrapper.getAttribute('data-chart-type') as 'bar' | 'line' | 'pie' | 'doughnut';
      const chartTitle = wrapper.getAttribute('data-chart-title') || '';
      const chartHeight = parseInt(wrapper.getAttribute('data-chart-height') || '300');
      const chartWidth = parseInt(wrapper.getAttribute('data-chart-width') || '600');
      const chartData = wrapper.getAttribute('data-chart-data') || '{}';
      
      // Unescape the data
      const unescapedData = chartData.replace(/&quot;/g, '"');
      
      console.log(`Processing chart: ${chartType} with data:`, unescapedData);
      
      // Create a container for the chart
      const chartContainer = document.createElement('div');
      chartContainer.className = 'chart-container-hydrated';
      
      // Replace the wrapper with the container
      wrapper.parentNode?.replaceChild(chartContainer, wrapper);
      
      try {
        // Create a React root and render the chart
        const root = createRoot(chartContainer);
        root.render(
          <ChartRenderer
            type={chartType}
            data={unescapedData}
            title={chartTitle}
            height={chartHeight}
            width={chartWidth}
          />
        );
      } catch (error) {
        console.error('Error rendering chart:', error);
        chartContainer.innerHTML = `<div class="error-message">Error rendering chart: ${error}</div>`;
      }
    });
    
    hydrated.current = true;
  }, []);
  
  return null;
};

export default ChartHydrator;
