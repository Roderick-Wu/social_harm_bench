import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { ModelResult } from '@/types/benchmark';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface BenchmarkChartsProps {
  modelResults: ModelResult[];
}

const BenchmarkCharts: React.FC<BenchmarkChartsProps> = ({ modelResults }) => {
  // Prepare data for attack success rate over time
  const timelineData = {
    datasets: [
      {
        label: 'Attack Success Rate Over Time',
        data: modelResults.map(model => ({
          x: model.releaseDate,
          y: model.attackSuccessRate,
          modelName: model.modelName,
          organization: model.organization
        })),
        backgroundColor: modelResults.map(model => 
          model.region === 'US' ? 'rgba(59, 130, 246, 0.6)' : 'rgba(147, 51, 234, 0.6)'
        ),
        borderColor: modelResults.map(model => 
          model.region === 'US' ? 'rgb(59, 130, 246)' : 'rgb(147, 51, 234)'
        ),
        borderWidth: 2,
      },
    ],
  };

  const timelineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Attack Success Rate by Release Date',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const point = context.raw;
            return `${point.modelName} (${point.organization}): ${point.y.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'month' as const,
          displayFormats: {
            month: 'MMM yyyy'
          }
        },
        title: {
          display: true,
          text: 'Release Date'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Attack Success Rate (%)'
        },
        min: 0,
        max: 50
      }
    }
  };

  // Prepare data for organization comparison
  const orgData = modelResults.reduce((acc, model) => {
    if (!acc[model.organization]) {
      acc[model.organization] = [];
    }
    acc[model.organization].push(model.attackSuccessRate);
    return acc;
  }, {} as Record<string, number[]>);

  const orgLabels = Object.keys(orgData);
  const orgAverages = orgLabels.map(org => 
    orgData[org].reduce((sum, rate) => sum + rate, 0) / orgData[org].length
  );

  const organizationData = {
    labels: orgLabels,
    datasets: [
      {
        label: 'Average Attack Success Rate',
        data: orgAverages,
        backgroundColor: [
          'rgba(59, 130, 246, 0.6)',
          'rgba(16, 185, 129, 0.6)',
          'rgba(245, 158, 11, 0.6)',
          'rgba(239, 68, 68, 0.6)',
          'rgba(147, 51, 234, 0.6)',
          'rgba(236, 72, 153, 0.6)',
          'rgba(34, 197, 94, 0.6)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(147, 51, 234)',
          'rgb(236, 72, 153)',
          'rgb(34, 197, 94)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const organizationOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Average Attack Success Rate by Organization',
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Attack Success Rate (%)'
        },
        min: 0,
      }
    }
  };

  // Prepare data for model type comparison
  const openSourceModels = modelResults.filter(m => m.modelType === 'open-source');
  const closedSourceModels = modelResults.filter(m => m.modelType === 'closed-source');

  const openSourceAvg = openSourceModels.reduce((sum, m) => sum + m.attackSuccessRate, 0) / openSourceModels.length;
  const closedSourceAvg = closedSourceModels.reduce((sum, m) => sum + m.attackSuccessRate, 0) / closedSourceModels.length;

  const modelTypeData = {
    labels: ['Open Source', 'Closed Source'],
    datasets: [
      {
        label: 'Average Attack Success Rate',
        data: [openSourceAvg, closedSourceAvg],
        backgroundColor: [
          'rgba(16, 185, 129, 0.6)',
          'rgba(59, 130, 246, 0.6)',
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(59, 130, 246)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const modelTypeOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Attack Success Rate: Open Source vs Closed Source',
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Attack Success Rate (%)'
        },
        min: 0,
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <Line data={timelineData} options={timelineOptions} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <Bar data={organizationData} options={organizationOptions} />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <Bar data={modelTypeData} options={modelTypeOptions} />
        </div>
      </div>
    </div>
  );
};

export default BenchmarkCharts;