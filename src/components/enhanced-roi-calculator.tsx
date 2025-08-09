'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { XMarkIcon, CalculatorIcon, DocumentArrowDownIcon, ScaleIcon, LightBulbIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { InteractiveCharts, generateROITimelineData, generateCashFlowData, generatePropertyValueData, generateIncomeBreakdownData, generateRiskAnalysisData } from './interactive-charts';
import { PropertyComparison } from './property-comparison';
import { MarketDataService, type MarketData, type PropertyMarketInsights } from '@/lib/market-data';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface CalculatorInputs {
  propertyId?: string;
  propertyPrice: number;
  downPaymentPercent: number;
  serviceCharges: number;
  rentalYield: number;
  appreciationRate: number;
  holdingPeriod: number;
  financingType: 'cash' | 'mortgage';
  interestRate: number;
  loanTerm: number;
  registrationFees: number;
  agentCommission: number;
  insuranceCost: number;
}

interface CalculatorResults {
  totalInvestment: number;
  downPayment: number;
  loanAmount: number;
  monthlyPayment: number;
  annualRentalIncome: number;
  annualExpenses: number;
  netAnnualIncome: number;
  totalAppreciation: number;
  totalROI: number;
  paybackPeriod: number;
  cashOnCashReturn: number;
  irr: number;
  yearlyBreakdown: Array<{
    year: number;
    rentalIncome: number;
    expenses: number;
    netIncome: number;
    propertyValue: number;
    cumulativeROI: number;
  }>;
}

const defaultInputs: CalculatorInputs = {
  propertyPrice: 1500000,
  downPaymentPercent: 25,
  serviceCharges: 2.5,
  rentalYield: 6.0,
  appreciationRate: 4.5,
  holdingPeriod: 10,
  financingType: 'mortgage',
  interestRate: 4.99,
  loanTerm: 25,
  registrationFees: 4.0,
  agentCommission: 2.0,
  insuranceCost: 0.5,
};

export function EnhancedROICalculator({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [inputs, setInputs] = useState<CalculatorInputs>(defaultInputs);
  const [activeTab, setActiveTab] = useState<'calculator' | 'charts' | 'comparison' | 'insights' | 'summary'>('calculator');
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [propertyInsights, setPropertyInsights] = useState<PropertyMarketInsights | null>(null);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load market data on component mount
  useEffect(() => {
    if (isOpen) {
      loadMarketData();
    }
  }, [isOpen]);

  // Load property-specific insights when a property is selected
  useEffect(() => {
    if (inputs.propertyId) {
      loadPropertyInsights(inputs.propertyId);
    }
  }, [inputs.propertyId]);

  const loadMarketData = async () => {
    try {
      setIsLoading(true);
      const data = await MarketDataService.getMarketData();
      setMarketData(data);
      
      // Update defaults with market data
      setInputs(prev => ({
        ...prev,
        rentalYield: data.averageRentalYield,
        appreciationRate: data.averageAppreciationRate,
        interestRate: data.currentMortgageRates.fixed,
      }));
    } catch (error) {
      console.error('Error loading market data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPropertyInsights = async (propertyId: string) => {
    try {
      const insights = await MarketDataService.getPropertyInsights(propertyId);
      setPropertyInsights(insights);
      
      // Update inputs with property-specific data
      setInputs(prev => ({
        ...prev,
        downPaymentPercent: insights.recommendedDownPayment,
        rentalYield: insights.expectedRentalYield,
        appreciationRate: insights.projectedAppreciation,
      }));
    } catch (error) {
      console.error('Error loading property insights:', error);
    }
  };

  const results = useMemo((): CalculatorResults => {
    const downPayment = inputs.propertyPrice * (inputs.downPaymentPercent / 100);
    const loanAmount = inputs.financingType === 'mortgage' ? inputs.propertyPrice - downPayment : 0;
    
    const monthlyInterestRate = inputs.interestRate / 100 / 12;
    const numberOfPayments = inputs.loanTerm * 12;
    const monthlyPayment = inputs.financingType === 'mortgage' && loanAmount > 0
      ? (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
        (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)
      : 0;

    const registrationCost = inputs.propertyPrice * (inputs.registrationFees / 100);
    const commissionCost = inputs.propertyPrice * (inputs.agentCommission / 100);
    const insuranceCost = inputs.propertyPrice * (inputs.insuranceCost / 100);
    
    const totalInvestment = downPayment + registrationCost + commissionCost + insuranceCost;
    
    const annualRentalIncome = inputs.propertyPrice * (inputs.rentalYield / 100);
    const annualServiceCharges = inputs.propertyPrice * (inputs.serviceCharges / 100);
    const annualMortgagePayments = monthlyPayment * 12;
    const annualExpenses = annualServiceCharges + annualMortgagePayments + insuranceCost;
    const netAnnualIncome = annualRentalIncome - annualExpenses;

    const finalPropertyValue = inputs.propertyPrice * Math.pow(1 + inputs.appreciationRate / 100, inputs.holdingPeriod);
    const totalAppreciation = finalPropertyValue - inputs.propertyPrice;
    
    const totalGains = (netAnnualIncome * inputs.holdingPeriod) + totalAppreciation;
    const totalROI = (totalGains / totalInvestment) * 100;
    
    const paybackPeriod = totalInvestment / Math.max(netAnnualIncome, 1);
    const cashOnCashReturn = (netAnnualIncome / totalInvestment) * 100;

    // Calculate IRR (simplified approximation)
    const irr = Math.pow(finalPropertyValue / totalInvestment, 1 / inputs.holdingPeriod) - 1;

    // Generate yearly breakdown
    const yearlyBreakdown = [];
    for (let year = 1; year <= inputs.holdingPeriod; year++) {
      const propertyValue = inputs.propertyPrice * Math.pow(1 + inputs.appreciationRate / 100, year);
      const cumulativeIncome = netAnnualIncome * year;
      const cumulativeAppreciation = propertyValue - inputs.propertyPrice;
      const cumulativeROI = ((cumulativeIncome + cumulativeAppreciation) / totalInvestment) * 100;

      yearlyBreakdown.push({
        year,
        rentalIncome: annualRentalIncome,
        expenses: annualExpenses,
        netIncome: netAnnualIncome,
        propertyValue,
        cumulativeROI,
      });
    }

    return {
      totalInvestment,
      downPayment,
      loanAmount,
      monthlyPayment,
      annualRentalIncome,
      annualExpenses,
      netAnnualIncome,
      totalAppreciation,
      totalROI,
      paybackPeriod,
      cashOnCashReturn,
      irr: irr * 100,
      yearlyBreakdown,
    };
  }, [inputs]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  const handleInputChange = (field: keyof CalculatorInputs, value: number | string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const exportResults = async () => {
    try {
      const element = document.getElementById('calculator-results');
      if (!element) return;

      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('property-roi-analysis.pdf');
    } catch (error) {
      console.error('Error exporting results:', error);
    }
  };

  // Generate chart data
  const roiTimelineData = generateROITimelineData(
    inputs.holdingPeriod,
    results.totalInvestment,
    results.netAnnualIncome,
    inputs.appreciationRate,
    inputs.propertyPrice
  );

  const cashFlowData = generateCashFlowData(
    inputs.holdingPeriod,
    results.netAnnualIncome,
    inputs.appreciationRate,
    inputs.propertyPrice
  );

  const propertyValueData = generatePropertyValueData(
    inputs.holdingPeriod,
    inputs.propertyPrice,
    inputs.appreciationRate,
    results.totalInvestment
  );

  const incomeBreakdownData = generateIncomeBreakdownData(
    inputs.holdingPeriod,
    results.annualRentalIncome,
    results.annualExpenses
  );

  const riskAnalysisData = generateRiskAnalysisData(
    propertyInsights?.marketRisk || 'medium',
    propertyInsights?.liquidityScore || 60,
    propertyInsights?.investmentGrade || 'B'
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex items-center space-x-3">
            <CalculatorIcon className="w-7 h-7 text-gray-900" />
            <h2 className="text-3xl font-bold text-gray-900">Enhanced ROI Calculator</h2>
            {marketData && (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                Live Market Data
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b bg-gray-50">
          <div className="flex space-x-0">
            {[
              { key: 'calculator', label: 'Calculator', icon: CalculatorIcon },
              { key: 'charts', label: 'Charts & Analysis', icon: ChartBarIcon },
              { key: 'comparison', label: 'Compare Properties', icon: ScaleIcon },
              { key: 'insights', label: 'Market Insights', icon: LightBulbIcon },
              { key: 'summary', label: 'Summary Report', icon: DocumentArrowDownIcon },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as typeof activeTab)}
                className={`flex items-center space-x-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === key
                    ? 'border-gray-900 text-gray-900 bg-white'
                    : 'border-transparent text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div id="calculator-results" className="overflow-y-auto max-h-[calc(90vh-200px)]">
          
          {activeTab === 'calculator' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Input Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Investment Parameters</h3>
                  
                  {/* Property Details */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Property Details</h4>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-1">
                        Property Price (AED)
                      </label>
                      <input
                        type="number"
                        value={inputs.propertyPrice}
                        onChange={(e) => handleInputChange('propertyPrice', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-1">
                        Down Payment (%)
                        {marketData && propertyInsights && (
                          <span className="ml-2 text-xs font-semibold text-green-700">
                            Recommended: {propertyInsights.recommendedDownPayment}%
                          </span>
                        )}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={inputs.downPaymentPercent}
                        onChange={(e) => handleInputChange('downPaymentPercent', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-1">
                        Expected Rental Yield (% annually)
                        {marketData && (
                          <span className="ml-2 text-xs font-semibold text-blue-700">
                            Market Avg: {marketData.averageRentalYield.toFixed(1)}%
                          </span>
                        )}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={inputs.rentalYield}
                        onChange={(e) => handleInputChange('rentalYield', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-1">
                        Property Appreciation (% annually)
                        {marketData && (
                          <span className="ml-2 text-xs font-semibold text-blue-700">
                            Market Avg: {marketData.averageAppreciationRate.toFixed(1)}%
                          </span>
                        )}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={inputs.appreciationRate}
                        onChange={(e) => handleInputChange('appreciationRate', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-1">
                        Holding Period (years)
                      </label>
                      <input
                        type="number"
                        value={inputs.holdingPeriod}
                        onChange={(e) => handleInputChange('holdingPeriod', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Financing */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Financing</h4>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-1">
                        Financing Type
                      </label>
                      <select
                        value={inputs.financingType}
                        onChange={(e) => handleInputChange('financingType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      >
                        <option value="cash">Cash Purchase</option>
                        <option value="mortgage">Mortgage</option>
                      </select>
                    </div>

                    {inputs.financingType === 'mortgage' && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-1">
                            Interest Rate (%)
                            {marketData && (
                              <span className="ml-2 text-xs font-semibold text-blue-700">
                                Current: {marketData.currentMortgageRates.fixed}%
                              </span>
                            )}
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={inputs.interestRate}
                            onChange={(e) => handleInputChange('interestRate', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-1">
                            Loan Term (years)
                          </label>
                          <input
                            type="number"
                            value={inputs.loanTerm}
                            onChange={(e) => handleInputChange('loanTerm', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Additional Costs */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Additional Costs (%)</h4>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-800 mb-1">
                          Registration (4%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={inputs.registrationFees}
                          onChange={(e) => handleInputChange('registrationFees', Number(e.target.value))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-800 mb-1">
                          Commission (2%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={inputs.agentCommission}
                          onChange={(e) => handleInputChange('agentCommission', Number(e.target.value))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-800 mb-1">
                          Insurance (0.5%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={inputs.insuranceCost}
                          onChange={(e) => handleInputChange('insuranceCost', Number(e.target.value))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-gray-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Investment Summary</h3>
                    <button
                      onClick={exportResults}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <DocumentArrowDownIcon className="w-4 h-4" />
                      <span>Export PDF</span>
                    </button>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-800 font-medium">Total Investment</div>
                      <div className="text-xl font-bold text-gray-900">{formatCurrency(results.totalInvestment)}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm text-green-800 font-semibold">Total ROI</div>
                      <div className="text-xl font-bold text-green-700">{formatPercent(results.totalROI)}</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-blue-800 font-semibold">Annual Cash Flow</div>
                      <div className="text-xl font-bold text-blue-700">{formatCurrency(results.netAnnualIncome)}</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-sm text-purple-800 font-semibold">Payback Period</div>
                      <div className="text-xl font-bold text-purple-700">{results.paybackPeriod.toFixed(1)} years</div>
                    </div>
                  </div>

                  {/* Detailed Breakdown */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Financial Breakdown</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-800 font-medium">Down Payment:</span>
                        <span className="font-medium">{formatCurrency(results.downPayment)}</span>
                      </div>
                      {inputs.financingType === 'mortgage' && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-800 font-medium">Loan Amount:</span>
                            <span className="font-medium">{formatCurrency(results.loanAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-800 font-medium">Monthly Payment:</span>
                            <span className="font-medium">{formatCurrency(results.monthlyPayment)}</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-800 font-medium">Annual Rental Income:</span>
                        <span className="font-medium text-green-600">{formatCurrency(results.annualRentalIncome)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-800 font-medium">Annual Expenses:</span>
                        <span className="font-medium text-red-600">{formatCurrency(results.annualExpenses)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-gray-800 font-medium">Net Annual Income:</span>
                        <span className="font-bold text-gray-900">{formatCurrency(results.netAnnualIncome)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-800 font-medium">Total Appreciation ({inputs.holdingPeriod} years):</span>
                        <span className="font-medium text-blue-600">{formatCurrency(results.totalAppreciation)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-800 font-medium">Cash-on-Cash Return:</span>
                        <span className="font-medium">{formatPercent(results.cashOnCashReturn)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-800 font-medium">IRR (Internal Rate of Return):</span>
                        <span className="font-medium">{formatPercent(results.irr)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Investment Grade */}
                  {propertyInsights && (
                    <div className="p-4 bg-gray-900 text-white rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Investment Grade</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          propertyInsights.investmentGrade === 'A' ? 'bg-green-500' :
                          propertyInsights.investmentGrade === 'B' ? 'bg-yellow-500' :
                          propertyInsights.investmentGrade === 'C' ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}>
                          {propertyInsights.investmentGrade}
                        </span>
                      </div>
                      <div className="text-xs text-gray-300">
                        Risk Level: {propertyInsights.marketRisk} • Liquidity Score: {propertyInsights.liquidityScore}/100
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'charts' && (
            <div className="p-6">
              <InteractiveCharts
                roiTimelineData={roiTimelineData}
                cashFlowData={cashFlowData}
                propertyValueData={propertyValueData}
                incomeBreakdownData={incomeBreakdownData}
                riskAnalysisData={riskAnalysisData}
              />
            </div>
          )}

          {activeTab === 'comparison' && (
            <div className="p-6">
              <div className="text-center">
                <button
                  onClick={() => setComparisonOpen(true)}
                  className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Launch Property Comparison Tool
                </button>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="p-6">
              {marketData ? (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Live Market Insights</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900">Market Trends</h4>
                      <div className="mt-2 space-y-1 text-sm">
                        <div>Price Direction: <span className="font-medium capitalize">{marketData.marketTrends.priceDirection}</span></div>
                        <div>Demand Level: <span className="font-medium capitalize">{marketData.marketTrends.demandLevel}</span></div>
                        <div>Supply Level: <span className="font-medium capitalize">{marketData.marketTrends.supplyLevel}</span></div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900">Average Returns</h4>
                      <div className="mt-2 space-y-1 text-sm">
                        <div>Rental Yield: <span className="font-medium">{formatPercent(marketData.averageRentalYield)}</span></div>
                        <div>Appreciation: <span className="font-medium">{formatPercent(marketData.averageAppreciationRate)}</span></div>
                        <div>Combined ROI: <span className="font-medium">{formatPercent(marketData.averageRentalYield + marketData.averageAppreciationRate)}</span></div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900">Financing Rates</h4>
                      <div className="mt-2 space-y-1 text-sm">
                        <div>Fixed Rate: <span className="font-medium">{formatPercent(marketData.currentMortgageRates.fixed)}</span></div>
                        <div>Variable Rate: <span className="font-medium">{formatPercent(marketData.currentMortgageRates.variable)}</span></div>
                        <div>Spread: <span className="font-medium">{formatPercent(marketData.currentMortgageRates.fixed - marketData.currentMortgageRates.variable)}</span></div>
                      </div>
                    </div>
                  </div>

                  {propertyInsights && (
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-semibold mb-4">Property-Specific Insights</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-medium mb-2">Investment Metrics</h5>
                          <div className="space-y-1 text-sm">
                            <div>Expected Yield: {formatPercent(propertyInsights.expectedRentalYield)}</div>
                            <div>Projected Appreciation: {formatPercent(propertyInsights.projectedAppreciation)}</div>
                            <div>Recommended Down Payment: {propertyInsights.recommendedDownPayment}%</div>
                            <div>Market Risk: {propertyInsights.marketRisk}</div>
                            <div>Liquidity Score: {propertyInsights.liquidityScore}/100</div>
                          </div>
                        </div>
                        
                        {propertyInsights.comparableProperties.length > 0 && (
                          <div>
                            <h5 className="font-medium mb-2">Comparable Properties</h5>
                            <div className="space-y-2">
                              {propertyInsights.comparableProperties.slice(0, 3).map((prop, index) => (
                                <div key={index} className="text-xs bg-white p-2 rounded">
                                  <div className="font-medium truncate">{prop.title}</div>
                                  <div className="text-gray-800 font-medium">{prop.developer} • {prop.area}</div>
                                  <div className="text-gray-800 font-medium">{formatCurrency(prop.pricePerSqft)}/sqft</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-lg font-semibold text-gray-900">Loading market insights...</div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="p-6">
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Investment Analysis Report</h3>
                  <p className="text-gray-800 font-medium">Comprehensive ROI analysis and investment recommendations</p>
                </div>

                {/* Executive Summary */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold mb-4">Executive Summary</h4>
                  <div className="text-sm text-gray-900">
                    <p>
                      Based on your investment parameters for a property valued at {formatCurrency(inputs.propertyPrice)}, 
                      this analysis projects a total ROI of {formatPercent(results.totalROI)} over {inputs.holdingPeriod} years.
                    </p>
                    <p className="mt-2">
                      The investment requires an initial capital of {formatCurrency(results.totalInvestment)} and is expected 
                      to generate an annual cash flow of {formatCurrency(results.netAnnualIncome)}, representing a 
                      cash-on-cash return of {formatPercent(results.cashOnCashReturn)}.
                    </p>
                  </div>
                </div>

                {/* Investment Recommendation */}
                <div className="border-l-4 border-gray-900 pl-6">
                  <h4 className="text-lg font-semibold mb-3">Investment Recommendation</h4>
                  <div className="space-y-2 text-base text-gray-900">
                    {results.totalROI > 50 && (
                      <div className="flex items-center space-x-2 text-green-800">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="font-semibold"><strong>Strong Buy:</strong> Projected ROI exceeds 50% over the holding period</span>
                      </div>
                    )}
                    {results.totalROI >= 30 && results.totalROI <= 50 && (
                      <div className="flex items-center space-x-2 text-blue-800">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span className="font-semibold"><strong>Buy:</strong> Solid investment opportunity with good returns</span>
                      </div>
                    )}
                    {results.totalROI < 30 && (
                      <div className="flex items-center space-x-2 text-yellow-800">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                        <span className="font-semibold"><strong>Consider:</strong> Moderate returns, evaluate alternatives</span>
                      </div>
                    )}
                    
                    {results.paybackPeriod <= 10 && (
                      <div className="flex items-center space-x-2 text-green-800">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="font-semibold">Fast payback period of {results.paybackPeriod.toFixed(1)} years</span>
                      </div>
                    )}
                    
                    {results.cashOnCashReturn > 8 && (
                      <div className="flex items-center space-x-2 text-green-800">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="font-semibold">Excellent cash flow generation</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Summary Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-base text-gray-900">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-semibold">Year</th>
                        <th className="text-right py-2 font-semibold">Rental Income</th>
                        <th className="text-right py-2 font-semibold">Net Income</th>
                        <th className="text-right py-2 font-semibold">Property Value</th>
                        <th className="text-right py-2 font-semibold">Cumulative ROI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.yearlyBreakdown.slice(0, 10).map((year) => (
                        <tr key={year.year} className="border-b">
                          <td className="py-2">{year.year}</td>
                          <td className="text-right py-2">{formatCurrency(year.rentalIncome)}</td>
                          <td className="text-right py-2">{formatCurrency(year.netIncome)}</td>
                          <td className="text-right py-2">{formatCurrency(year.propertyValue)}</td>
                          <td className="text-right py-2 font-medium">{formatPercent(year.cumulativeROI)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Risk Assessment */}
                {propertyInsights && (
                  <div className="bg-yellow-50 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold mb-3">Risk Assessment</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-base text-gray-900">
                      <div>
                        <div className="font-medium">Market Risk</div>
                        <div className={`capitalize font-semibold ${
                          propertyInsights.marketRisk === 'low' ? 'text-green-800' :
                          propertyInsights.marketRisk === 'medium' ? 'text-yellow-800' :
                          'text-red-800'
                        }`}>
                          {propertyInsights.marketRisk}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Liquidity</div>
                        <div className="text-blue-800 font-semibold">{propertyInsights.liquidityScore}/100</div>
                      </div>
                      <div>
                        <div className="font-medium">Investment Grade</div>
                        <div className={`font-semibold ${
                          propertyInsights.investmentGrade === 'A' ? 'text-green-800' :
                          propertyInsights.investmentGrade === 'B' ? 'text-blue-800' :
                          propertyInsights.investmentGrade === 'C' ? 'text-yellow-800' :
                          'text-red-800'
                        }`}>
                          Grade {propertyInsights.investmentGrade}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Export Button */}
                <div className="text-center">
                  <button
                    onClick={exportResults}
                    className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Export Complete Report as PDF
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Property Comparison Modal */}
      <PropertyComparison 
        isOpen={comparisonOpen} 
        onClose={() => setComparisonOpen(false)} 
      />
    </div>
  );
}
