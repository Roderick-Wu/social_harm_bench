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
  jailbreakMethod?: 'weight_tampering' | 'latent_space_perturbation' | 'greedy_coordinate_gradient' | 'embedding_optimization' | 'autodan_ga' | 'autodan_hga';
}

const BenchmarkCharts: React.FC<BenchmarkChartsProps> = ({ modelResults, jailbreakMethod = 'weight_tampering' }) => {
  // Handle empty arrays gracefully
  if (!modelResults || modelResults.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-4">📈</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Chart Data Available</h3>
        <p className="text-gray-600">
          No model performance data is available for chart visualization.
        </p>
      </div>
    );
  }

  // Determine the data type based on the first model
  const isPoliticalBiasData = modelResults.length > 0 && modelResults[0].fScaleEnglish !== undefined;
  const isSocialHarmBenchData = modelResults.length > 0 && 
                                modelResults[0].benchmarkScores && 
                                (Object.keys(modelResults[0].benchmarkScores).some(key => key.includes('weight_tampering')) ||
                                 Object.keys(modelResults[0].benchmarkScores).some(key => key.includes('latent_space_perturbation')) ||
                                 Object.keys(modelResults[0].benchmarkScores).some(key => key.includes('greedy_coordinate_gradient')) ||
                                 Object.keys(modelResults[0].benchmarkScores).some(key => key.includes('embedding_optimization')) ||
                                 Object.keys(modelResults[0].benchmarkScores).some(key => key.includes('autodan_ga')) ||
                                 Object.keys(modelResults[0].benchmarkScores).some(key => key.includes('autodan_hga')));

  if (isPoliticalBiasData) {
    return renderPoliticalBiasCharts(modelResults);
  } else if (isSocialHarmBenchData) {
    return renderSocialHarmBenchCharts(modelResults, jailbreakMethod);
  } else {
    return renderAttackSuccessCharts(modelResults);
  }
};

const renderSocialHarmBenchCharts = (modelResults: ModelResult[], jailbreakMethod: 'weight_tampering' | 'latent_space_perturbation' | 'greedy_coordinate_gradient' | 'embedding_optimization' | 'autodan_ga' | 'autodan_hga' = 'weight_tampering') => {
  const categories = ['censorship', 'historical_revisionism', 'human_rights', 'political_manipulation', 'propaganda', 'surveillance', 'war_crimes'];
  
  // Method name for display
  const methodDisplayName = jailbreakMethod === 'weight_tampering' ? 'Weight Tampering' :
                            jailbreakMethod === 'latent_space_perturbation' ? 'Latent-Space Perturbation' :
                            jailbreakMethod === 'greedy_coordinate_gradient' ? 'Greedy Coordinate Gradient' :
                            jailbreakMethod === 'embedding_optimization' ? 'Embedding Optimization' :
                            jailbreakMethod === 'autodan_ga' ? 'AutoDAN (GA)' :
                            'AutoDAN (HGA)';  // HarmBench scores comparison
  const harmbenchData = {
    labels: modelResults.map(m => m.modelName),
    datasets: categories.map((category, index) => ({
      label: category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      data: modelResults.map(m => m.benchmarkScores?.[`${jailbreakMethod}_${category}_hb`] || 0),
      backgroundColor: `hsla(${index * 50}, 70%, 50%, 0.6)`,
      borderColor: `hsl(${index * 50}, 70%, 50%)`,
      borderWidth: 2,
    }))
  };

  const harmbenchOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${methodDisplayName} - HarmBench Scores by Category (Lower is Better)`,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Success Rate (%)'
        },
        min: 0,
        max: 100
      }
    }
  };

  // StrongReject scores comparison
  const strongrejectData = {
    labels: modelResults.map(m => m.modelName),
    datasets: categories.map((category, index) => ({
      label: category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      data: modelResults.map(m => m.benchmarkScores?.[`${jailbreakMethod}_${category}_sr`] || 0),
      backgroundColor: `hsla(${index * 50}, 70%, 50%, 0.6)`,
      borderColor: `hsl(${index * 50}, 70%, 50%)`,
      borderWidth: 2,
    }))
  };

  const strongrejectOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${methodDisplayName} - StrongReject Scores by Category (Lower is Better)`,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Success Rate (%)'
        },
        min: 0,
        max: 100
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <Bar data={harmbenchData} options={harmbenchOptions} />
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <Bar data={strongrejectData} options={strongrejectOptions} />
      </div>
    </div>
  );
};

const renderPoliticalBiasCharts = (modelResults: ModelResult[]) => {
  // F-Scale comparison chart
  const fScaleData = {
    labels: modelResults.map(m => m.modelName),
    datasets: [
      {
        label: 'F-Scale English',
        data: modelResults.map(m => m.fScaleEnglish || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
      },
      {
        label: 'F-Scale Mandarin',
        data: modelResults.map(m => m.fScaleMandarin || 0),
        backgroundColor: 'rgba(147, 51, 234, 0.6)',
        borderColor: 'rgb(147, 51, 234)',
        borderWidth: 2,
      },
    ],
  };

  const fScaleOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'F-Scale Scores by Model (Higher = More Authoritarian)',
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'F-Scale Score'
        },
        min: 0,
        max: 4
      }
    }
  };

  // FavScore English comparison chart
  const favScoreEnglishData = {
    labels: modelResults.map(m => m.modelName),
    datasets: [
      {
        label: 'Democratic Leaders (EN)',
        data: modelResults.map(m => (m as any).favScoreDemocraticEnglish || 0),
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
      },
      {
        label: 'Authoritarian Leaders (EN)',
        data: modelResults.map(m => (m as any).favScoreAuthoritarianEnglish || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
      },
    ],
  };

  const favScoreEnglishOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'FavScore (English): Favorability Towards Leader Types',
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'FavScore'
        },
        min: -0.3,
        max: 0.3
      }
    }
  };

  // FavScore Mandarin comparison chart
  const favScoreMandarinData = {
    labels: modelResults.map(m => m.modelName),
    datasets: [
      {
        label: 'Democratic Leaders (ZH)',
        data: modelResults.map(m => (m as any).favScoreDemocraticMandarin || 0),
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
      },
      {
        label: 'Authoritarian Leaders (ZH)',
        data: modelResults.map(m => (m as any).favScoreAuthoritarianMandarin || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
      },
    ],
  };

  const favScoreMandarinOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'FavScore (Mandarin): Favorability Towards Leader Types',
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'FavScore'
        },
        min: -0.1,
        max: 0.4
      }
    }
  };

  // Wasserstein Distance comparison chart
  const wassersteinData = {
    labels: modelResults.map(m => m.modelName),
    datasets: [
      {
        label: 'Wasserstein Distance English',
        data: modelResults.map(m => (m as any).wassersteinDistanceEnglish || 0),
        backgroundColor: 'rgba(245, 158, 11, 0.6)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 2,
      },
      {
        label: 'Wasserstein Distance Mandarin',
        data: modelResults.map(m => (m as any).wassersteinDistanceMandarin || 0),
        backgroundColor: 'rgba(236, 72, 153, 0.6)',
        borderColor: 'rgb(236, 72, 153)',
        borderWidth: 2,
      },
    ],
  };

  const wassersteinOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Wasserstein Distance: Distribution Difference from Neutral',
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Wasserstein Distance'
        },
        min: 0,
        max: 0.3
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <Bar data={fScaleData} options={fScaleOptions} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <Bar data={favScoreEnglishData} options={favScoreEnglishOptions} />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <Bar data={favScoreMandarinData} options={favScoreMandarinOptions} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <Bar data={wassersteinData} options={wassersteinOptions} />
      </div>
    </div>
  );
};

const renderAttackSuccessCharts = (modelResults: ModelResult[]) => {
  // Prepare data for attack success rate over time
  const timelineData = {
    datasets: [
      {
        label: 'Attack Success Rate Over Time',
        data: modelResults.map(model => ({
          x: model.releaseDate,
          y: model.attackSuccessRate || 0,
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
    const rate = model.attackSuccessRate;
    if (rate !== undefined) {
      if (!acc[model.organization]) {
        acc[model.organization] = [];
      }
      acc[model.organization].push(rate);
    }
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

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <Line data={timelineData} options={timelineOptions} />
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <Bar data={organizationData} options={organizationOptions} />
      </div>
    </div>
  );
};

export default BenchmarkCharts;