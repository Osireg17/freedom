// src/components/dashboard/sections/performance-chart.tsx
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

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

interface PerformanceChartProps {
    data: number[];
}

export function PerformanceChart({ data }: PerformanceChartProps) {
    // Calculate average score
    const averageScore = Math.round(data.reduce((sum, score) => sum + score, 0) / data.length);

    // Calculate improvement percentage (compare last value to first value)
    const improvementPercentage = Math.round(((data[data.length - 1] - data[0]) / data[0]) * 100);

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
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    label: function (context: any) {
                        return `Score: ${context.raw}%`;
                    }
                },
            },
        },
    };

    return (
        <Card className="w-full" data-testid="performance-chart-card">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Performance Trend</CardTitle>
                    <CardDescription>Your interview scores over time</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Average</p>
                        <p className="text-xl font-bold">{averageScore}%</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Improvement</p>
                        <p className={`text-xl font-bold ${improvementPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {improvementPercentage >= 0 ? '+' : ''}{improvementPercentage}%
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-80" data-testid="performance-chart">
                    <Line data={chartData} options={options} />
                </div>
            </CardContent>
        </Card>
    );
}