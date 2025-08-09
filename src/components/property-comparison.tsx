'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon, ScaleIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface PropertyOption {
  id: string;
  title: string;
  developer: string;
  area: string;
  minPrice: number;
  maxPrice: number;
  minArea: number;
  maxArea: number;
  propertyType: string;
  handoverYear?: number;
}

interface ComparisonResults {
  propertyId: string;
  title: string;
  avgPrice: number;
  pricePerSqft: number;
  expectedROI: number;
  rentalYield: number;
  appreciation: number;
  paybackPeriod: number;
  investmentGrade: string;
  riskLevel: string;
}

interface PropertyComparisonProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PropertyComparison({ isOpen, onClose }: PropertyComparisonProps) {
  const [selectedProperties, setSelectedProperties] = useState<PropertyOption[]>([]);
  const [availableProperties, setAvailableProperties] = useState<PropertyOption[]>([]);
  const [comparisonResults, setComparisonResults] = useState<ComparisonResults[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch available properties
  useEffect(() => {
    if (isOpen) {
      fetchAvailableProperties();
    }
  }, [isOpen]);

  const fetchAvailableProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/properties?limit=50&include_images=false');
      const data = await response.json();
      
      if (data.success && data.data) {
        const properties = data.data.map((p: any) => ({
          id: p.id,
          title: p.title || 'Untitled Property',
          developer: p.developer?.name || 'Unknown Developer',
          area: p.district?.name || p.city?.name || 'Unknown Area',
          minPrice: p.min_price || 0,
          maxPrice: p.max_price || 0,
          minArea: p.min_area || 0,
          maxArea: p.max_area || 0,
          propertyType: p.propertyType || 'apartment',
          handoverYear: p.handover_year,
        }));
        setAvailableProperties(properties);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = availableProperties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.developer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addPropertyToComparison = (property: PropertyOption) => {
    if (selectedProperties.length < 4 && !selectedProperties.find(p => p.id === property.id)) {
      setSelectedProperties([...selectedProperties, property]);
    }
  };

  const removePropertyFromComparison = (propertyId: string) => {
    setSelectedProperties(selectedProperties.filter(p => p.id !== propertyId));
  };

  const calculateComparison = async () => {
    if (selectedProperties.length < 2) return;

    setLoading(true);
    try {
      const results: ComparisonResults[] = [];

      for (const property of selectedProperties) {
        // Calculate metrics for each property
        const avgPrice = (property.minPrice + property.maxPrice) / 2;
        const avgArea = (property.minArea + property.maxArea) / 2;
        const pricePerSqft = avgArea > 0 ? avgPrice / avgArea : 0;

        // Basic ROI calculations (simplified)
        const rentalYield = calculateRentalYield(property);
        const appreciation = calculateAppreciation(property);
        const expectedROI = rentalYield + appreciation;
        const paybackPeriod = 100 / rentalYield; // Years to break even on rental
        const investmentGrade = calculateInvestmentGrade(property, pricePerSqft);
        const riskLevel = calculateRiskLevel(property);

        results.push({
          propertyId: property.id,
          title: property.title,
          avgPrice,
          pricePerSqft,
          expectedROI,
          rentalYield,
          appreciation,
          paybackPeriod,
          investmentGrade,
          riskLevel,
        });
      }

      setComparisonResults(results);
    } catch (error) {
      console.error('Error calculating comparison:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper calculation functions
  const calculateRentalYield = (property: PropertyOption): number => {
    const baseYields: { [key: string]: number } = {
      'studio': 7.5,
      'apartment': 6.5,
      'villa': 5.5,
      'townhouse': 6.0,
      'penthouse': 5.0,
    };
    return baseYields[property.propertyType.toLowerCase()] || 6.0;
  };

  const calculateAppreciation = (property: PropertyOption): number => {
    let appreciation = 4.5; // Base Dubai rate
    
    // Premium areas get higher appreciation
    if (property.area.toLowerCase().includes('marina') || 
        property.area.toLowerCase().includes('downtown')) {
      appreciation += 1.0;
    }
    
    // Off-plan properties might have higher potential
    const currentYear = new Date().getFullYear();
    if (property.handoverYear && property.handoverYear > currentYear) {
      appreciation += 0.5;
    }
    
    return Math.min(appreciation, 7.0);
  };

  const calculateInvestmentGrade = (property: PropertyOption, pricePerSqft: number): string => {
    let score = 0;

    // Location scoring
    if (property.area.toLowerCase().includes('marina') || 
        property.area.toLowerCase().includes('downtown')) {
      score += 30;
    } else {
      score += 15;
    }

    // Developer reputation
    if (property.developer.toLowerCase().includes('emaar') || 
        property.developer.toLowerCase().includes('damac')) {
      score += 25;
    } else {
      score += 15;
    }

    // Price point
    if (pricePerSqft > 0 && pricePerSqft < 2000) {
      score += 25;
    } else if (pricePerSqft < 3000) {
      score += 15;
    } else {
      score += 10;
    }

    if (score >= 70) return 'A';
    if (score >= 55) return 'B';
    if (score >= 40) return 'C';
    return 'D';
  };

  const calculateRiskLevel = (property: PropertyOption): string => {
    let riskFactors = 0;

    // Future delivery adds risk
    const currentYear = new Date().getFullYear();
    if (property.handoverYear && property.handoverYear > currentYear + 2) {
      riskFactors += 1;
    }

    // Unknown developer adds risk
    if (property.developer === 'Unknown Developer') {
      riskFactors += 1;
    }

    if (riskFactors === 0) return 'Low';
    if (riskFactors === 1) return 'Medium';
    return 'High';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <ScaleIcon className="w-6 h-6 text-gray-900" />
            <h2 className="text-2xl font-bold text-gray-900">Property Comparison</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          
          {/* Property Selection */}
          <div className="p-6 border-b bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Select Properties to Compare (2-4 properties)</h3>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search properties by name, developer, or area..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {/* Selected Properties */}
            {selectedProperties.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Selected Properties:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProperties.map((property) => (
                    <div key={property.id} className="flex items-center bg-gray-900 text-white px-3 py-1 rounded-full text-sm">
                      <span className="truncate max-w-[200px]">{property.title}</span>
                      <button
                        onClick={() => removePropertyFromComparison(property.id)}
                        className="ml-2 hover:bg-gray-700 rounded-full p-1"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                {selectedProperties.length >= 2 && (
                  <button
                    onClick={calculateComparison}
                    disabled={loading}
                    className="mt-3 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Calculating...' : 'Compare Properties'}
                  </button>
                )}
              </div>
            )}

            {/* Available Properties */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
              {filteredProperties.slice(0, 12).map((property) => (
                <div 
                  key={property.id}
                  onClick={() => addPropertyToComparison(property)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedProperties.find(p => p.id === property.id)
                      ? 'bg-gray-900 text-white border-gray-900'
                      : selectedProperties.length >= 4
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <h5 className="font-medium text-sm truncate">{property.title}</h5>
                  <p className="text-xs opacity-75">{property.developer}</p>
                  <p className="text-xs opacity-75">{property.area}</p>
                  <p className="text-xs font-medium mt-1">
                    {formatCurrency((property.minPrice + property.maxPrice) / 2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Results */}
          {comparisonResults.length > 0 && (
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <ChartBarIcon className="w-5 h-5 text-gray-900" />
                <h3 className="text-lg font-semibold">Comparison Results</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-semibold">Property</th>
                      <th className="text-right py-3 px-2 font-semibold">Avg Price</th>
                      <th className="text-right py-3 px-2 font-semibold">Price/sqft</th>
                      <th className="text-right py-3 px-2 font-semibold">Expected ROI</th>
                      <th className="text-right py-3 px-2 font-semibold">Rental Yield</th>
                      <th className="text-right py-3 px-2 font-semibold">Appreciation</th>
                      <th className="text-right py-3 px-2 font-semibold">Payback Period</th>
                      <th className="text-center py-3 px-2 font-semibold">Grade</th>
                      <th className="text-center py-3 px-2 font-semibold">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonResults.map((result, index) => (
                      <tr key={result.propertyId} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                        <td className="py-3 px-2">
                          <div className="max-w-[200px] truncate font-medium">{result.title}</div>
                        </td>
                        <td className="text-right py-3 px-2">{formatCurrency(result.avgPrice)}</td>
                        <td className="text-right py-3 px-2">{formatCurrency(result.pricePerSqft)}</td>
                        <td className="text-right py-3 px-2 font-semibold text-green-600">
                          {result.expectedROI.toFixed(1)}%
                        </td>
                        <td className="text-right py-3 px-2">{result.rentalYield.toFixed(1)}%</td>
                        <td className="text-right py-3 px-2">{result.appreciation.toFixed(1)}%</td>
                        <td className="text-right py-3 px-2">{result.paybackPeriod.toFixed(1)} yrs</td>
                        <td className="text-center py-3 px-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            result.investmentGrade === 'A' ? 'bg-green-100 text-green-800' :
                            result.investmentGrade === 'B' ? 'bg-yellow-100 text-yellow-800' :
                            result.investmentGrade === 'C' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {result.investmentGrade}
                          </span>
                        </td>
                        <td className="text-center py-3 px-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            result.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                            result.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {result.riskLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Best Investment Recommendation */}
              {comparisonResults.length > 0 && (
                <div className="mt-6 p-4 bg-gray-900 text-white rounded-xl">
                  <h4 className="font-semibold mb-2">🏆 Recommended Investment</h4>
                  {(() => {
                    const best = comparisonResults.reduce((prev, current) => 
                      current.expectedROI > prev.expectedROI ? current : prev
                    );
                    return (
                      <p className="text-sm">
                        <strong>{best.title}</strong> offers the highest expected ROI at {best.expectedROI.toFixed(1)}% 
                        with a {best.investmentGrade} grade and {best.riskLevel.toLowerCase()} risk level.
                      </p>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
