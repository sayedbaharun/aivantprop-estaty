'use client';

import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';

interface ChartData {
  year?: number;
  month?: string;
  value?: number;
  income?: number;
  appreciation?: number;
  totalROI?: number;
  cashFlow?: number;
  propertyValue?: number;
  cumulativeInvestment?: number;
  netIncome?: number;
  expenses?: number;
  name?: string;
  percentage?: number;
  fill?: string;
}

interface InteractiveChartsProps {
  roiTimelineData: ChartData[];
  cashFlowData: ChartData[];
  propertyValueData: ChartData[];
  incomeBreakdownData: ChartData[];
  riskAnalysisData: ChartData[];
}

export function InteractiveCharts({
  roiTimelineData,
  cashFlowData,
  propertyValueData,
  incomeBreakdownData,
  riskAnalysisData
}: InteractiveChartsProps) {
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  const COLORS = ['#1f2937', '#374151', '#6b7280', '#9ca3af', '#d1d5db'];

  return (
    <div className="space-y-8">
      
      {/* ROI Over Time */}
      <div className="bg-white p-6 rounded-xl border">
        <h4 className="text-lg font-semibold mb-4">ROI Timeline</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={roiTimelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="year" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={formatPercent}
              />
              <Tooltip 
                formatter={(value: number) => [formatPercent(value), 'ROI']}
                labelFormatter={(label) => `Year ${label}`}
                contentStyle={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="totalROI" 
                stroke="#1f2937" 
                strokeWidth={3}
                dot={{ fill: '#1f2937', r: 4 }}
                activeDot={{ r: 6 }}
                name="Total ROI"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cash Flow Analysis */}
      <div className="bg-white p-6 rounded-xl border">
        <h4 className="text-lg font-semibold mb-4">Annual Cash Flow</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="year" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                labelFormatter={(label) => `Year ${label}`}
                contentStyle={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="income" 
                stackId="1"
                stroke="#059669" 
                fill="#d1fae5"
                name="Rental Income"
              />
              <Area 
                type="monotone" 
                dataKey="appreciation" 
                stackId="1"
                stroke="#1f2937" 
                fill="#f3f4f6"
                name="Capital Appreciation"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Property Value Growth */}
      <div className="bg-white p-6 rounded-xl border">
        <h4 className="text-lg font-semibold mb-4">Property Value Growth</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={propertyValueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="year" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Property Value']}
                labelFormatter={(label) => `Year ${label}`}
                contentStyle={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="propertyValue" 
                stroke="#1f2937" 
                fill="#e5e7eb"
                name="Property Value"
              />
              <Line 
                type="monotone" 
                dataKey="cumulativeInvestment" 
                stroke="#dc2626" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Total Investment"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Income vs Expenses Breakdown */}
      <div className="bg-white p-6 rounded-xl border">
        <h4 className="text-lg font-semibold mb-4">Annual Income vs Expenses</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={incomeBreakdownData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="year" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                labelFormatter={(label) => `Year ${label}`}
                contentStyle={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar 
                dataKey="netIncome" 
                fill="#059669"
                name="Net Income"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="expenses" 
                fill="#dc2626"
                name="Expenses"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Analysis Radial Chart */}
      <div className="bg-white p-6 rounded-xl border">
        <h4 className="text-lg font-semibold mb-4">Investment Risk Analysis</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="20%" 
              outerRadius="90%" 
              data={riskAnalysisData}
            >
              <RadialBar 
                dataKey="percentage" 
                cornerRadius={10} 
                fill="#1f2937"
              />
              <Tooltip 
                formatter={(value: number, name: string) => [`${value}%`, name]}
                contentStyle={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend 
                iconSize={10}
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          {riskAnalysisData.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-gray-800 font-medium">{item.name}: {item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Investment Composition Pie Chart */}
      <div className="bg-white p-6 rounded-xl border">
        <h4 className="text-lg font-semibold mb-4">Investment Composition</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={incomeBreakdownData.slice(0, 5)} // Show first 5 years
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="netIncome"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {incomeBreakdownData.slice(0, 5).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Net Income']}
                contentStyle={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}

// Helper functions to generate chart data
export function generateROITimelineData(
  holdingPeriod: number, 
  totalInvestment: number, 
  annualIncome: number, 
  appreciationRate: number, 
  propertyPrice: number
): ChartData[] {
  const data: ChartData[] = [];
  let cumulativeROI = 0;
  
  for (let year = 1; year <= holdingPeriod; year++) {
    const yearlyAppreciation = propertyPrice * Math.pow(1 + appreciationRate / 100, year) - propertyPrice;
    const totalIncome = annualIncome * year;
    const totalGains = totalIncome + yearlyAppreciation;
    cumulativeROI = (totalGains / totalInvestment) * 100;
    
    data.push({
      year,
      totalROI: cumulativeROI,
    });
  }
  
  return data;
}

export function generateCashFlowData(
  holdingPeriod: number, 
  annualIncome: number, 
  appreciationRate: number, 
  propertyPrice: number
): ChartData[] {
  const data: ChartData[] = [];
  
  for (let year = 1; year <= holdingPeriod; year++) {
    const yearlyAppreciation = propertyPrice * (Math.pow(1 + appreciationRate / 100, year) - Math.pow(1 + appreciationRate / 100, year - 1));
    
    data.push({
      year,
      income: annualIncome,
      appreciation: yearlyAppreciation,
    });
  }
  
  return data;
}

export function generatePropertyValueData(
  holdingPeriod: number, 
  propertyPrice: number, 
  appreciationRate: number, 
  totalInvestment: number
): ChartData[] {
  const data: ChartData[] = [];
  
  for (let year = 0; year <= holdingPeriod; year++) {
    const propertyValue = propertyPrice * Math.pow(1 + appreciationRate / 100, year);
    
    data.push({
      year,
      propertyValue,
      cumulativeInvestment: totalInvestment,
    });
  }
  
  return data;
}

export function generateIncomeBreakdownData(
  holdingPeriod: number, 
  annualIncome: number, 
  annualExpenses: number
): ChartData[] {
  const data: ChartData[] = [];
  
  for (let year = 1; year <= holdingPeriod; year++) {
    data.push({
      year,
      netIncome: annualIncome,
      expenses: annualExpenses,
    });
  }
  
  return data;
}

export function generateRiskAnalysisData(
  marketRisk: 'low' | 'medium' | 'high',
  liquidityScore: number,
  investmentGrade: 'A' | 'B' | 'C' | 'D'
): ChartData[] {
  const riskPercentage = marketRisk === 'low' ? 20 : marketRisk === 'medium' ? 50 : 80;
  const gradePercentage = investmentGrade === 'A' ? 90 : investmentGrade === 'B' ? 75 : investmentGrade === 'C' ? 60 : 40;
  
  return [
    { name: 'Market Risk', percentage: riskPercentage, fill: '#dc2626' },
    { name: 'Liquidity Score', percentage: liquidityScore, fill: '#059669' },
    { name: 'Investment Grade', percentage: gradePercentage, fill: '#1f2937' },
    { name: 'Location Premium', percentage: 75, fill: '#7c3aed' },
    { name: 'Developer Reputation', percentage: 85, fill: '#0891b2' },
  ];
}
