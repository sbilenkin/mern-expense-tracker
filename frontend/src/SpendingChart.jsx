import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function SpendingChart({ transactions }) {
  // Process transactions to get daily spending data
  const processSpendingData = () => {
    const dailySpending = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const date = new Date(transaction.date).toLocaleDateString();
        dailySpending[date] = (dailySpending[date] || 0) + transaction.amount;
      });

    // Sort dates and get last 30 days
    const sortedDates = Object.keys(dailySpending)
      .sort((a, b) => new Date(a) - new Date(b))
      .slice(-30);

    return {
      labels: sortedDates,
      amounts: sortedDates.map(date => dailySpending[date])
    };
  };

  const { labels, amounts } = processSpendingData();

  const data = {
    labels,
    datasets: [
      {
        label: 'Daily Spending',
        data: amounts,
        borderColor: '#dc3545',
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Spending Over Time (Last 30 Days)',
        color: '#28a745',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toFixed(2);
          }
        }
      }
    },
  };

  return (
    <div className="spending-chart">
      <Line data={data} options={options} />
    </div>
  );
}

export default SpendingChart;