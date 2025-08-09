'use client';

import React, { useState, useMemo } from 'react';
import { XMarkIcon, CalculatorIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

interface CalculatorInputs {
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
    appreciation: number;
    totalValue: number;
    cumulativeROI: number;
  }>;
}

const defaultInputs: CalculatorInputs = {
  propertyPrice: 2000000,
  downPaymentPercent: 20,
  serviceCharges: 1.5,
  rentalYield: 6,
  appreciationRate: 5,
  holdingPeriod: 5,
  financingType: 'mortgage',
  interestRate: 3.5,
  loanTerm: 25,
  registrationFees: 4,
  agentCommission: 2,
  insuranceCost: 0.5,
};

export function ROICalculator({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [inputs, setInputs] = useState<CalculatorInputs>(defaultInputs);
  const [activeTab, setActiveTab] = useState<'calculator' | 'charts' | 'summary'>('calculator');

  const results = useMemo((): CalculatorResults => {
    const downPayment = (inputs.propertyPrice * inputs.downPaymentPercent) / 100;
    const loanAmount = inputs.propertyPrice - downPayment;
    
    // Monthly mortgage payment calculation
    const monthlyRate = inputs.interestRate / 100 / 12;
    const totalPayments = inputs.loanTerm * 12;
    const monthlyPayment = inputs.financingType === 'mortgage' && loanAmount > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
        (Math.pow(1 + monthlyRate, totalPayments) - 1)
      : 0;

    // Annual calculations
    const annualRentalIncome = (inputs.propertyPrice * inputs.rentalYield) / 100;
    const annualServiceCharges = (inputs.propertyPrice * inputs.serviceCharges) / 100;
    const annualInsurance = (inputs.propertyPrice * inputs.insuranceCost) / 100;
    const annualExpenses = annualServiceCharges + annualInsurance + (monthlyPayment * 12);
    const netAnnualIncome = annualRentalIncome - annualExpenses;

    // Total investment calculation
    const registrationFeesAmount = (inputs.propertyPrice * inputs.registrationFees) / 100;
    const agentCommissionAmount = (inputs.propertyPrice * inputs.agentCommission) / 100;
    const totalInvestment = downPayment + registrationFeesAmount + agentCommissionAmount;

    // Appreciation and ROI calculations
    const totalAppreciation = inputs.propertyPrice * Math.pow(1 + inputs.appreciationRate / 100, inputs.holdingPeriod) - inputs.propertyPrice;
    const finalPropertyValue = inputs.propertyPrice + totalAppreciation;
    const totalROI = ((netAnnualIncome * inputs.holdingPeriod + totalAppreciation) / totalInvestment) * 100;
    
    const paybackPeriod = netAnnualIncome > 0 ? totalInvestment / netAnnualIncome : 0;
    const cashOnCashReturn = totalInvestment > 0 ? (netAnnualIncome / totalInvestment) * 100 : 0;

    // IRR calculation (simplified)
    const irr = Math.pow((finalPropertyValue + (netAnnualIncome * inputs.holdingPeriod)) / totalInvestment, 1 / inputs.holdingPeriod) - 1;

    // Yearly breakdown
    const yearlyBreakdown = Array.from({ length: inputs.holdingPeriod }, (_, i) => {
      const year = i + 1;
      const yearAppreciation = inputs.propertyPrice * Math.pow(1 + inputs.appreciationRate / 100, year) - inputs.propertyPrice;
      const yearRentalIncome = netAnnualIncome * year;
      const totalValue = inputs.propertyPrice + yearAppreciation;
      const cumulativeROI = ((yearRentalIncome + yearAppreciation) / totalInvestment) * 100;
      
      return {
        year,
        rentalIncome: yearRentalIncome,
        appreciation: yearAppreciation,
        totalValue,
        cumulativeROI,
      };
    });

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

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const handleInputChange = (field: keyof CalculatorInputs, value: number | string) => {
    setInputs(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? parseFloat(value) || 0 : value,
    }));
  };

  const exportResults = () => {
    const data = {
      inputs,
      results,
      timestamp: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roi-calculator-results-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <CalculatorIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">UAE Property ROI Calculator</h2>
              <p className="text-gray-600">Calculate your investment returns for off-plan properties</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'calculator'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Calculator
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'charts'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Charts & Analysis
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'summary'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Summary Report
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'calculator' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Property Details</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Property Price (AED)
                      </label>
                      <input
                        type="number"
                        value={inputs.propertyPrice}
                        onChange={(e) => handleInputChange('propertyPrice', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="2,000,000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Down Payment (%)
                      </label>
                      <input
                        type="number"
                        value={inputs.downPaymentPercent}
                        onChange={(e) => handleInputChange('downPaymentPercent', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Charges (% of property value annually)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={inputs.serviceCharges}
                        onChange={(e) => handleInputChange('serviceCharges', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="1.5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expected Rental Yield (% annually)
                      </label>
                      <input
                        type="number"
                        value={inputs.rentalYield}
                        onChange={(e) => handleInputChange('rentalYield', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="6"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Property Appreciation (% annually)
                      </label>
                      <input
                        type="number"
                        value={inputs.appreciationRate}
                        onChange={(e) => handleInputChange('appreciationRate', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Holding Period (years)
                      </label>
                      <input
                        type="number"
                        value={inputs.holdingPeriod}
                        onChange={(e) => handleInputChange('holdingPeriod', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="5"
                      />
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mt-8">Financing Options</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Financing Type
                      </label>
                      <select
                        value={inputs.financingType}
                        onChange={(e) => handleInputChange('financingType', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="cash">Cash Purchase</option>
                        <option value="mortgage">Mortgage</option>
                      </select>
                    </div>

                    {inputs.financingType === 'mortgage' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Interest Rate (%)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={inputs.interestRate}
                            onChange={(e) => handleInputChange('interestRate', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="3.5"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Loan Term (years)
                          </label>
                          <input
                            type="number"
                            value={inputs.loanTerm}
                            onChange={(e) => handleInputChange('loanTerm', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="25"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Investment Summary</h3>
                  
                  <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Total Investment</div>
                        <div className="text-xl font-bold text-gray-900">{formatCurrency(results.totalInvestment)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Down Payment</div>
                        <div className="text-xl font-bold text-gray-900">{formatCurrency(results.downPayment)}</div>
                      </div>
                    </div>

                    {inputs.financingType === 'mortgage' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600">Loan Amount</div>
                          <div className="text-xl font-bold text-gray-900">{formatCurrency(results.loanAmount)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Monthly Payment</div>
                          <div className="text-xl font-bold text-gray-900">{formatCurrency(results.monthlyPayment)}</div>
                        </div>
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600">Annual Rental Income</div>
                          <div className="text-lg font-semibold text-green-600">{formatCurrency(results.annualRentalIncome)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Annual Expenses</div>
                          <div className="text-lg font-semibold text-red-600">{formatCurrency(results.annualExpenses)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="text-sm text-gray-600">Net Annual Income</div>
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(results.netAnnualIncome)}</div>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900">ROI Analysis</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-sm text-blue-600">Total ROI</div>
                      <div className="text-2xl font-bold text-blue-900">{formatPercent(results.totalROI)}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-sm text-green-600">Cash-on-Cash Return</div>
                      <div className="text-2xl font-bold text-green-900">{formatPercent(results.cashOnCashReturn)}</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-sm text-purple-600">IRR</div>
                      <div className="text-2xl font-bold text-purple-900">{formatPercent(results.irr)}</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="text-sm text-orange-600">Payback Period</div>
                      <div className="text-2xl font-bold text-orange-900">{results.paybackPeriod.toFixed(1)} years</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'charts' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* ROI Over Time Chart */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">ROI Over Time</h3>
                  <div className="space-y-3">
                    {results.yearlyBreakdown.map((year) => (
                      <div key={year.year} className="flex items-center space-x-4">
                        <div className="w-12 text-sm font-medium text-gray-600">Year {year.year}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-4">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(Math.max(year.cumulativeROI, 0), 100)}%` }}
                          />
                        </div>
                        <div className="w-20 text-sm font-semibold text-gray-900">
                          {formatPercent(year.cumulativeROI)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Income vs Appreciation Chart */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Income vs Appreciation</h3>
                  <div className="space-y-4">
                    {results.yearlyBreakdown.map((year) => (
                      <div key={year.year} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Year {year.year}</span>
                          <span className="font-medium">{formatCurrency(year.totalValue)}</span>
                        </div>
                        <div className="flex space-x-1 h-3">
                          <div
                            className="bg-green-500 rounded-l"
                            style={{ width: `${year.totalValue > 0 ? (Math.abs(year.rentalIncome) / year.totalValue) * 100 : 0}%` }}
                          />
                          <div
                            className="bg-blue-500 rounded-r"
                            style={{ width: `${year.totalValue > 0 ? (Math.abs(year.appreciation) / year.totalValue) * 100 : 0}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Rental: {formatCurrency(year.rentalIncome)}</span>
                          <span>Appreciation: {formatCurrency(year.appreciation)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Property Value Growth */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Value Growth</h3>
                  <div className="grid grid-cols-5 gap-4">
                    {results.yearlyBreakdown.map((year) => (
                      <div key={year.year} className="text-center">
                        <div className="text-lg font-bold text-gray-900">{formatCurrency(year.totalValue)}</div>
                        <div className="text-sm text-gray-600">Year {year.year}</div>
                        <div className="text-xs text-green-600">+{formatPercent((year.appreciation / inputs.propertyPrice) * 100)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Investment Summary Report</h3>
                <button
                  onClick={exportResults}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <DocumentArrowDownIcon className="w-4 h-4" />
                  <span>Export Report</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-xl p-6">
                  <h4 className="font-semibold text-blue-900 mb-4">Investment Overview</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Property Price:</span>
                      <span className="font-medium">{formatCurrency(inputs.propertyPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Total Investment:</span>
                      <span className="font-medium">{formatCurrency(results.totalInvestment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Down Payment:</span>
                      <span className="font-medium">{formatCurrency(results.downPayment)}</span>
                    </div>
                    {inputs.financingType === 'mortgage' && (
                      <div className="flex justify-between">
                        <span className="text-blue-700">Loan Amount:</span>
                        <span className="font-medium">{formatCurrency(results.loanAmount)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-6">
                  <h4 className="font-semibold text-green-900 mb-4">Returns Analysis</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-green-700">Total ROI:</span>
                      <span className="font-medium">{formatPercent(results.totalROI)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Cash-on-Cash:</span>
                      <span className="font-medium">{formatPercent(results.cashOnCashReturn)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">IRR:</span>
                      <span className="font-medium">{formatPercent(results.irr)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Payback Period:</span>
                      <span className="font-medium">{results.paybackPeriod.toFixed(1)} years</span>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-xl p-6">
                  <h4 className="font-semibold text-purple-900 mb-4">Annual Cash Flow</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-purple-700">Rental Income:</span>
                      <span className="font-medium text-green-600">{formatCurrency(results.annualRentalIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">Expenses:</span>
                      <span className="font-medium text-red-600">{formatCurrency(results.annualExpenses)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">Net Income:</span>
                      <span className="font-medium text-green-600">{formatCurrency(results.netAnnualIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">Appreciation:</span>
                      <span className="font-medium text-blue-600">{formatCurrency(results.totalAppreciation)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Investment Recommendation</h4>
                <div className="space-y-3 text-gray-700">
                  <p>
                    Based on your inputs, this property investment shows a <strong>{formatPercent(results.totalROI)} total ROI</strong> over {inputs.holdingPeriod} years.
                  </p>
                  <p>
                    The <strong>{formatPercent(results.cashOnCashReturn)} cash-on-cash return</strong> indicates this is a {results.cashOnCashReturn > 8 ? 'strong' : results.cashOnCashReturn > 5 ? 'moderate' : 'conservative'} investment opportunity.
                  </p>
                  <p>
                    With a payback period of <strong>{results.paybackPeriod.toFixed(1)} years</strong>, you can expect to recover your initial investment through rental income alone.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
