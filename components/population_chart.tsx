import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Colors,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Colors,
  CategoryScale,
  LinearScale,
  BarElement
);

type PopulationItem = {
  model: string;
  count: number;
  score: number;
  reputation: number;
};

interface PopulationChartProps {
  population: PopulationItem[];
}

export default function PopulationChart({ population }: PopulationChartProps) {
  // Create stable color map for each model
  const map: Record<string, string> = {};
  const sorted_population = population.sort((a, b) => a.model.localeCompare(b.model));
  const colorMap = useMemo(() => {
    let i = 0;
    sorted_population.forEach(p => {
      if (!map[p.model]) {
        const hue = (i * 360) / population.length;
        map[p.model] = `hsl(${hue}, 70%, 50%)`;
        i++;
      }
    });
    return map;
  }, [sorted_population.map(p => p.model).join(',')]);

  // Pie chart data
  const pieData = {
    labels: sorted_population.map(p => p.model),
    datasets: [{
      data: sorted_population.map(p => p.count),
      backgroundColor: sorted_population.map(p => colorMap[p.model]),
    }]
  };

  // Generic function for bar chart data
  const makeBarData = (label: string, values: number[]) => ({
    labels: sorted_population.map(p => p.model),
    datasets: [{
      label,
      data: values,
      backgroundColor: sorted_population.map(p => colorMap[p.model]),
    }]
  });

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // We don't need legend since labels are on X axis
      }
    },
    scales: {
      x: { ticks: { font: { size: 12 } } },
      y: { beginAtZero: true }
    }
  };


  return (
  <div className="chart-content">
    <div className="chart-inner">
      <div className="charts-grid">

        {/* Bar Charts */}
        <div>
        <h1>Population</h1>
          <div className="chart-card chart-container">
            <Bar data={makeBarData('Population', population.map(p => p.count))} options={barOptions} />
          </div>
        </div>
        <div>
          <h1>Score</h1>
          <div className="chart-card chart-container">
            <Bar data={makeBarData('Score', population.map(p => p.score))} options={barOptions} />
          </div>
        </div>
        <div>
          <h1>Reputation</h1>
          <div className="chart-card chart-container">
            <Bar data={makeBarData('Reputation', population.map(p => p.reputation))} options={barOptions} />
          </div>
        </div>


       <div className="chart-card chart-container">
          {pieData.datasets[0]?.data?.length > 0 ? (
            <Pie 
              data={pieData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    position: window.innerWidth < 768 ? 'bottom' : 'right',
                    labels: {
                      boxWidth: window.innerWidth < 768 ? 12 : 16,
                      padding: window.innerWidth < 768 ? 8 : 12,
                      font: {
                        size: window.innerWidth < 768 ? 11 : 12
                      },
                      usePointStyle: true
                    }
                  }
                }
              }}
            />
          ) : (
            <div className="chart-empty">
              <div className="chart-empty-icon">
                <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p><strong>No population data</strong></p>
              <p>Data will appear when simulation starts</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

}