'use client';

import { useState } from 'react';
import { EnhancedROICalculator } from '@/components/enhanced-roi-calculator';

export default function InvestmentPage() {
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Property Investment Guide</h1>
          <p className="text-xl text-gray-600">
            Make informed investment decisions with our comprehensive market insights
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">ROI Calculator</h3>
            <p className="text-gray-600 mb-6">
              Calculate potential returns on your UAE property investment with our comprehensive ROI calculator.
            </p>
            <button 
              onClick={() => setCalculatorOpen(true)}
              className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Launch Calculator
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Market Trends</h3>
            <p className="text-gray-600 mb-6">
              Stay updated with the latest UAE property market trends, price movements, and investment hotspots.
            </p>
            <button className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors">
              View Trends
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Why Invest in UAE Off-Plan Properties?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Lower Entry Costs</h3>
              <p className="text-gray-600 text-sm">
                Off-plan properties typically require lower down payments and offer flexible payment plans.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Capital Appreciation</h3>
              <p className="text-gray-600 text-sm">
                Properties often appreciate in value from construction to completion.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏗️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Modern Amenities</h3>
              <p className="text-gray-600 text-sm">
                New developments feature the latest technology and luxury amenities.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl shadow-lg p-8 text-white text-center">
          <h2 className="text-2xl font-semibold mb-4">Ready to Start Investing?</h2>
          <p className="text-gray-200 mb-6 max-w-2xl mx-auto">
            Connect with our investment specialists for personalized guidance on UAE property investments.
          </p>
          <button className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Schedule Consultation
          </button>
        </div>
      </div>

      <EnhancedROICalculator isOpen={calculatorOpen} onClose={() => setCalculatorOpen(false)} />
    </main>
  );
}
