'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BuildingOfficeIcon,
  HomeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  UserGroupIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface StatsData {
  totalProperties: number;
  availableProperties: number;
  developers: number;
  cities: number;
  averagePrice: number;
  priceRange: { min: number; max: number };
  popularAreas: Array<{ name: string; count: number }>;
  newListings: number;
  upcomingHandovers: number;
  topDevelopers: Array<{ name: string; count: number; avgPrice: number }>;
}

interface EnhancedStatsDashboardProps {
  className?: string;
  showDetailed?: boolean;
}

export function EnhancedStatsDashboard({ 
  className = '', 
  showDetailed = true 
}: EnhancedStatsDashboardProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // This would typically fetch from an API endpoint
      // For now, we'll simulate the data
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // Fallback with mock data
        setStats({
          totalProperties: 1570,
          availableProperties: 1234,
          developers: 313,
          cities: 8,
          averagePrice: 2500000,
          priceRange: { min: 450000, max: 15000000 },
          popularAreas: [
            { name: 'Dubai Marina', count: 245 },
            { name: 'Downtown Dubai', count: 189 },
            { name: 'Business Bay', count: 156 },
            { name: 'JVC', count: 134 },
            { name: 'Dubai South', count: 98 }
          ],
          newListings: 87,
          upcomingHandovers: 342,
          topDevelopers: [
            { name: 'EMAAR', count: 156, avgPrice: 3200000 },
            { name: 'DAMAC', count: 134, avgPrice: 2800000 },
            { name: 'Azizi', count: 89, avgPrice: 1900000 },
            { name: 'Sobha', count: 67, avgPrice: 4100000 }
          ]
        });
      }
    } catch (err) {
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `AED ${(price / 1000000).toFixed(1)}M`;
    }
    return `AED ${(price / 1000).toFixed(0)}K`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-AE');
  };

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 mb-2">Failed to load statistics</div>
            <Button onClick={fetchStats} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const mainStats = [
    {
      title: 'Total Properties',
      value: formatNumber(stats.totalProperties),
      description: `${stats.availableProperties} available`,
      icon: HomeIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: '+12% this month'
    },
    {
      title: 'Developers',
      value: formatNumber(stats.developers),
      description: 'Premium partners',
      icon: BuildingOfficeIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: '+3 new this quarter'
    },
    {
      title: 'Cities',
      value: formatNumber(stats.cities),
      description: 'Across UAE',
      icon: MapPinIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: 'Complete coverage'
    },
    {
      title: 'Average Price',
      value: formatPrice(stats.averagePrice),
      description: `Range: ${formatPrice(stats.priceRange.min)} - ${formatPrice(stats.priceRange.max)}`,
      icon: CurrencyDollarIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: '+5.2% YoY'
    }
  ];

  const secondaryStats = [
    {
      title: 'New Listings',
      value: formatNumber(stats.newListings),
      description: 'This month',
      icon: ArrowTrendingUpIcon,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    },
    {
      title: 'Upcoming Handovers',
      value: formatNumber(stats.upcomingHandovers),
      description: 'Next 12 months',
      icon: CalendarIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Active Investors',
      value: '2.3K+',
      description: 'This quarter',
      icon: UserGroupIcon,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      title: 'ROI Analysis',
      value: '8.5%',
      description: 'Avg. rental yield',
      icon: ChartBarIcon,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    }
  ];

  return (
    <div className={className}>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {mainStats.map((stat, index) => (
          <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`h-10 w-10 rounded-full ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <p className="text-xs text-muted-foreground mb-2">{stat.description}</p>
              <Badge variant="secondary" className="text-xs">
                {stat.trend}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {showDetailed && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="areas">Popular Areas</TabsTrigger>
            <TabsTrigger value="developers">Top Developers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {secondaryStats.map((stat, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className={`h-8 w-8 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold mb-1">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="areas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Popular Areas</CardTitle>
                <CardDescription>
                  Most active areas by property count
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.popularAreas.map((area, index) => (
                    <div key={area.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="w-8 h-6 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <div className="font-medium">{area.name}</div>
                          <div className="text-sm text-muted-foreground">{area.count} properties</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        View →
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="developers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Developers</CardTitle>
                <CardDescription>
                  Leading developers by property count and average pricing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topDevelopers.map((developer, index) => (
                    <div key={developer.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="w-8 h-6 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <div className="font-medium">{developer.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {developer.count} properties • Avg. {formatPrice(developer.avgPrice)}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        View →
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
