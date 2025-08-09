import { prisma } from '@/lib/db';

export interface MarketData {
  averageRentalYield: number;
  averageAppreciationRate: number;
  currentMortgageRates: {
    fixed: number;
    variable: number;
  };
  marketTrends: {
    priceDirection: 'up' | 'down' | 'stable';
    demandLevel: 'high' | 'medium' | 'low';
    supplyLevel: 'high' | 'medium' | 'low';
  };
  areaSpecificData?: {
    averagePrice: number;
    pricePerSqft: number;
    appreciationTrend: number;
    rentalYieldRange: {
      min: number;
      max: number;
    };
  };
}

export interface PropertyMarketInsights {
  recommendedDownPayment: number;
  expectedRentalYield: number;
  projectedAppreciation: number;
  marketRisk: 'low' | 'medium' | 'high';
  liquidityScore: number;
  investmentGrade: 'A' | 'B' | 'C' | 'D';
  comparableProperties: Array<{
    id: string;
    title: string;
    pricePerSqft: number;
    area: string;
    developer: string;
  }>;
}

export class MarketDataService {
  
  // Get current UAE mortgage rates (static for now, can be API-driven later)
  static getCurrentMortgageRates() {
    return {
      fixed: 4.99, // Average UAE fixed rate
      variable: 4.49, // Average UAE variable rate
    };
  }

  // Calculate market data for a specific area/developer
  static async getMarketData(filters?: {
    cityId?: string;
    districtId?: string;
    developerId?: string;
    propertyType?: string;
  }): Promise<MarketData> {
    try {
      const whereClause: any = {};
      
      if (filters?.cityId) whereClause.city_id = filters.cityId;
      if (filters?.districtId) whereClause.district_id = filters.districtId;
      if (filters?.developerId) whereClause.developer_id = filters.developerId;
      if (filters?.propertyType) whereClause.propertyType = filters.propertyType;

      // Get properties matching filters
      const properties = await prisma.property.findMany({
        where: whereClause,
        select: {
          min_price: true,
          max_price: true,
          min_area: true,
          max_area: true,
          status: true,
          handover_year: true,
          createdAt: true,
          city: { select: { name: true } },
          district: { select: { name: true } },
          developer: { select: { name: true } },
        },
        take: 500,
      });

      if (properties.length === 0) {
        return this.getDefaultMarketData();
      }

      // Calculate average rental yield based on Dubai market standards
      const averageRentalYield = this.calculateRentalYield(properties);
      
      // Calculate appreciation rate based on property age and market trends
      const averageAppreciationRate = this.calculateAppreciationRate(properties);

      // Calculate area-specific data
      const areaSpecificData = this.calculateAreaSpecificData(properties);

      return {
        averageRentalYield,
        averageAppreciationRate,
        currentMortgageRates: this.getCurrentMortgageRates(),
        marketTrends: {
          priceDirection: 'up', // Based on Dubai's current market
          demandLevel: 'high',
          supplyLevel: 'medium',
        },
        areaSpecificData,
      };
    } catch (error) {
      console.error('Error fetching market data:', error);
      return this.getDefaultMarketData();
    }
  }

  // Get property-specific market insights
  static async getPropertyInsights(propertyId: string): Promise<PropertyMarketInsights> {
    try {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: {
          city: true,
          district: true,
          developer: true,
        },
      });

      if (!property) {
        throw new Error('Property not found');
      }

      // Find comparable properties
      const comparableProperties = await prisma.property.findMany({
        where: {
          AND: [
            { id: { not: propertyId } },
            { 
              OR: [
                { district_id: property.district_id },
                { city_id: property.city_id },
                { developer_id: property.developer_id },
              ]
            },
            { min_price: { gte: (property.min_price || 0) * 0.8 } },
            { max_price: { lte: (property.max_price || 0) * 1.2 } },
          ]
        },
        include: {
          city: true,
          district: true,
          developer: true,
        },
        take: 5,
      });

      const avgPrice = (property.min_price || 0 + property.max_price || 0) / 2;
      const avgArea = (property.min_area || 0 + property.max_area || 0) / 2;
      const pricePerSqft = avgArea > 0 ? avgPrice / avgArea : 0;

      // Calculate investment grade based on multiple factors
      const investmentGrade = this.calculateInvestmentGrade(property, pricePerSqft);
      
      // Calculate market risk
      const marketRisk = this.calculateMarketRisk(property);

      return {
        recommendedDownPayment: 25, // UAE standard
        expectedRentalYield: this.getExpectedRentalYield(property),
        projectedAppreciation: this.getProjectedAppreciation(property),
        marketRisk,
        liquidityScore: this.calculateLiquidityScore(property),
        investmentGrade,
        comparableProperties: comparableProperties.map(p => ({
          id: p.id,
          title: p.title || 'Untitled Property',
          pricePerSqft: this.calculatePricePerSqft(p),
          area: p.district?.name || p.city?.name || 'Unknown',
          developer: p.developer?.name || 'Unknown Developer',
        })),
      };
    } catch (error) {
      console.error('Error getting property insights:', error);
      return this.getDefaultPropertyInsights();
    }
  }

  // Helper methods
  private static calculateRentalYield(properties: any[]): number {
    // Dubai average rental yields by property type
    const dubaiRentalYields = {
      'apartment': 6.5,
      'villa': 5.8,
      'townhouse': 6.2,
      'penthouse': 5.5,
      'studio': 7.2,
    };

    // Calculate weighted average based on property types
    let totalYield = 0;
    let count = 0;

    properties.forEach(property => {
      const propertyType = property.propertyType?.toLowerCase() || 'apartment';
      const propertyYield = dubaiRentalYields[propertyType as keyof typeof dubaiRentalYields] || 6.0;
      totalYield += propertyYield;
      count++;
    });

    return count > 0 ? totalYield / count : 6.0;
  }

  private static calculateAppreciationRate(properties: any[]): number {
    // Dubai market appreciation rates (conservative estimates)
    const baseAppreciation = 4.5; // Average annual appreciation
    
    // Adjust based on property age and market conditions
    const currentYear = new Date().getFullYear();
    let adjustedRate = baseAppreciation;

    properties.forEach(property => {
      if (property.handover_year && property.handover_year > currentYear) {
        // Off-plan properties typically have higher appreciation potential
        adjustedRate += 0.5;
      }
    });

    return Math.min(adjustedRate, 8.0); // Cap at 8%
  }

  private static calculateAreaSpecificData(properties: any[]) {
    const prices = properties
      .filter(p => p.min_price && p.max_price)
      .map(p => (p.min_price + p.max_price) / 2);
    
    const areas = properties
      .filter(p => p.min_area && p.max_area)
      .map(p => (p.min_area + p.max_area) / 2);

    const averagePrice = prices.length > 0 
      ? prices.reduce((a, b) => a + b, 0) / prices.length 
      : 0;

    const averageArea = areas.length > 0 
      ? areas.reduce((a, b) => a + b, 0) / areas.length 
      : 0;

    const pricePerSqft = averageArea > 0 ? averagePrice / averageArea : 0;

    return {
      averagePrice,
      pricePerSqft,
      appreciationTrend: 4.5, // Default appreciation trend
      rentalYieldRange: {
        min: 5.0,
        max: 8.0,
      },
    };
  }

  private static calculateInvestmentGrade(property: any, pricePerSqft: number): 'A' | 'B' | 'C' | 'D' {
    let score = 0;

    // Location scoring
    if (property.district?.name?.includes('Marina') || 
        property.district?.name?.includes('Downtown') ||
        property.district?.name?.includes('JBR')) {
      score += 30;
    } else if (property.city?.name === 'Dubai') {
      score += 20;
    } else {
      score += 10;
    }

    // Developer reputation (simplified)
    if (property.developer?.name?.includes('Emaar') || 
        property.developer?.name?.includes('DAMAC') ||
        property.developer?.name?.includes('Meraas')) {
      score += 25;
    } else {
      score += 15;
    }

    // Price point
    if (pricePerSqft > 0 && pricePerSqft < 2000) {
      score += 25; // Good value
    } else if (pricePerSqft < 3000) {
      score += 15; // Fair value
    } else {
      score += 10; // Premium pricing
    }

    // Delivery timeline
    const currentYear = new Date().getFullYear();
    if (property.handover_year && property.handover_year <= currentYear + 2) {
      score += 20; // Near-term delivery
    } else {
      score += 10; // Future delivery
    }

    // Convert score to grade
    if (score >= 80) return 'A';
    if (score >= 65) return 'B';
    if (score >= 50) return 'C';
    return 'D';
  }

  private static calculateMarketRisk(property: any): 'low' | 'medium' | 'high' {
    let riskFactors = 0;

    // Location risk
    if (!property.district?.name || property.district.name === 'Unknown') {
      riskFactors += 1;
    }

    // Developer risk
    if (!property.developer?.name || property.developer.name === 'Unknown Developer') {
      riskFactors += 1;
    }

    // Delivery risk
    const currentYear = new Date().getFullYear();
    if (property.handover_year && property.handover_year > currentYear + 3) {
      riskFactors += 1;
    }

    if (riskFactors === 0) return 'low';
    if (riskFactors === 1) return 'medium';
    return 'high';
  }

  private static getExpectedRentalYield(property: any): number {
    const baseYield = 6.0; // Dubai average
    
    // Adjust based on property type
    if (property.propertyType?.toLowerCase() === 'studio') return baseYield + 1.2;
    if (property.propertyType?.toLowerCase() === 'apartment') return baseYield + 0.5;
    if (property.propertyType?.toLowerCase() === 'villa') return baseYield - 0.2;
    
    return baseYield;
  }

  private static getProjectedAppreciation(property: any): number {
    let appreciation = 4.5; // Dubai base rate
    
    // Premium locations get higher appreciation
    if (property.district?.name?.includes('Marina') || 
        property.district?.name?.includes('Downtown')) {
      appreciation += 1.0;
    }
    
    return Math.min(appreciation, 7.0);
  }

  private static calculateLiquidityScore(property: any): number {
    let score = 50; // Base score
    
    // Location impact
    if (property.district?.name?.includes('Marina') || 
        property.district?.name?.includes('Downtown') ||
        property.district?.name?.includes('JBR')) {
      score += 30;
    }
    
    // Property type impact
    if (property.propertyType?.toLowerCase() === 'apartment') score += 15;
    if (property.propertyType?.toLowerCase() === 'studio') score += 10;
    
    return Math.min(score, 100);
  }

  private static calculatePricePerSqft(property: any): number {
    const avgPrice = (property.min_price || 0 + property.max_price || 0) / 2;
    const avgArea = (property.min_area || 0 + property.max_area || 0) / 2;
    return avgArea > 0 ? avgPrice / avgArea : 0;
  }

  private static getDefaultMarketData(): MarketData {
    return {
      averageRentalYield: 6.0,
      averageAppreciationRate: 4.5,
      currentMortgageRates: this.getCurrentMortgageRates(),
      marketTrends: {
        priceDirection: 'up',
        demandLevel: 'high',
        supplyLevel: 'medium',
      },
    };
  }

  private static getDefaultPropertyInsights(): PropertyMarketInsights {
    return {
      recommendedDownPayment: 25,
      expectedRentalYield: 6.0,
      projectedAppreciation: 4.5,
      marketRisk: 'medium',
      liquidityScore: 60,
      investmentGrade: 'B',
      comparableProperties: [],
    };
  }
}
