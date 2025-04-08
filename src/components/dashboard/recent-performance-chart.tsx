
// src/components/dashboard/recent-performance-chart.tsx
'use client';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

// Register the required chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface RecentPerformanceChartProps {
    data: number[];
}

export function RecentPerformanceChart({ data }: RecentPerformanceChartProps) {
    // Get the last n entries, with labels as "n days ago", etc.
    const chartData = {
        labels: data.map((_, index) => index === 0 ? 'Today' :
            index === 1 ? 'Yesterday' :
                `${index} days ago`).reverse(),
        datasets: [
            {
                label: 'Interview Score',
                data: [...data].reverse(),
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.3,
                pointBackgroundColor: 'rgb(99, 102, 241)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                min: Math.max(0, Math.min(...data) - 10),
                max: Math.min(100, Math.max(...data) + 10),
                ticks: {
                    stepSize: 10,
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                bodyFont: {
                    size: 14,
                },
                callbacks: {
                    label: function (context: any) {
                        return `Score: ${context.raw}%`;
                    }
                },
            },
        },
    };

    return (
        <div className="w-full h-80" data-testid="performance-chart">
            <Line data={chartData} options={options} />
        </div>
    );
}