'use client';

import { useState } from 'react';
import { EnhancedSearch } from '@/components/enhanced-search';
import { EnhancedPropertyCard } from '@/components/enhanced-property-card';
import { EnhancedContactForm } from '@/components/enhanced-contact-form';
import { EnhancedStatsDashboard } from '@/components/enhanced-stats-dashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const sampleProperty = {
  id: '1',
  title: 'Luxury Marina Residence',
  slug: 'luxury-marina-residence',
  salesStatus: 'AVAILABLE' as const,
  minPrice: 1250000,
  maxPrice: 2800000,
  minArea: 650,
  handoverYear: 2026,
  handoverQuarter: 2,
  images: [{ url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }],
  city: { name: 'Dubai' },
  district: { name: 'Dubai Marina' },
  developer: { name: 'EMAAR Properties' },
  description: 'Experience unparalleled luxury in this stunning marina residence featuring panoramic views, world-class amenities, and prime waterfront location.',
  keyFeatures: ['Sea View', 'Balcony', 'Gym Access', 'Swimming Pool', 'Concierge']
};

export default function DemoPage() {
  const [favorites, setFavorites] = useState<string[]>([]);

  const handleSearch = (filters: any) => {
    console.log('Search filters:', filters);
  };

  const handleFavorite = (propertyId: string) => {
    setFavorites(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            shadcn/ui Components Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore the enhanced UI components built with shadcn/ui for Off Plan Dub.ai
          </p>
        </div>

        <Tabs defaultValue="search" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="cards">Property Cards</TabsTrigger>
            <TabsTrigger value="forms">Contact Forms</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="components">UI Components</TabsTrigger>
          </TabsList>

          {/* Enhanced Search Demo */}
          <TabsContent value="search" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Search Component</CardTitle>
                <CardDescription>
                  Advanced search with filters, popular suggestions, and real-time results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedSearch 
                  onSearch={handleSearch}
                  showFilters={true}
                />
              </CardContent>
            </Card>

            <Alert>
              <CheckCircleIcon className="h-4 w-4" />
              <AlertDescription>
                Features: Advanced filtering, popular searches, real-time updates, and responsive design
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Enhanced Property Cards Demo */}
          <TabsContent value="cards" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Property Cards</CardTitle>
                <CardDescription>
                  Interactive property cards with quick view, favorites, and enhanced CTAs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  <EnhancedPropertyCard
                    property={sampleProperty}
                    onFavorite={handleFavorite}
                    isFavorite={favorites.includes(sampleProperty.id)}
                    variant="default"
                  />
                  <EnhancedPropertyCard
                    property={{...sampleProperty, id: '2', title: 'Compact Card Example'}}
                    onFavorite={handleFavorite}
                    isFavorite={false}
                    variant="compact"
                    showDescription={false}
                  />
                  <EnhancedPropertyCard
                    property={{...sampleProperty, id: '3', title: 'Featured Luxury Villa', salesStatus: 'LIMITED_AVAILABILITY'}}
                    onFavorite={handleFavorite}
                    isFavorite={favorites.includes('3')}
                    variant="featured"
                  />
                </div>
              </CardContent>
            </Card>

            <Alert>
              <CheckCircleIcon className="h-4 w-4" />
              <AlertDescription>
                Features: Quick view dialog, favorite system, multiple variants, hover effects, and enhanced CTAs
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Enhanced Contact Forms Demo */}
          <TabsContent value="forms" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <EnhancedContactForm 
                propertyTitle="Luxury Marina Residence"
                defaultInquiryType="property_inquiry"
              />
              
              <EnhancedContactForm 
                defaultInquiryType="investment_consultation"
              />
            </div>

            <Alert>
              <CheckCircleIcon className="h-4 w-4" />
              <AlertDescription>
                Features: Form validation, multiple inquiry types, WhatsApp integration, and success/error handling
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Enhanced Dashboard Demo */}
          <TabsContent value="dashboard" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Stats Dashboard</CardTitle>
                <CardDescription>
                  Comprehensive analytics and statistics with interactive tabs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedStatsDashboard showDetailed={true} />
              </CardContent>
            </Card>

            <Alert>
              <CheckCircleIcon className="h-4 w-4" />
              <AlertDescription>
                Features: Real-time stats, interactive tabs, trending data, and responsive design
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* UI Components Demo */}
          <TabsContent value="components" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Buttons */}
              <Card>
                <CardHeader>
                  <CardTitle>Buttons</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full">Primary Button</Button>
                  <Button variant="secondary" className="w-full">Secondary</Button>
                  <Button variant="outline" className="w-full">Outline</Button>
                  <Button variant="ghost" className="w-full">Ghost</Button>
                  <Button variant="destructive" className="w-full">Destructive</Button>
                </CardContent>
              </Card>

              {/* Badges */}
              <Card>
                <CardHeader>
                  <CardTitle>Badges</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-green-500">Available</Badge>
                    <Badge className="bg-orange-500">Limited</Badge>
                    <Badge className="bg-red-500">Sold Out</Badge>
                    <Badge className="bg-blue-500">Coming Soon</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Cards */}
              <Card>
                <CardHeader>
                  <CardTitle>Card Example</CardTitle>
                  <CardDescription>
                    A card with header and content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This is an example of a shadcn/ui card component with consistent styling.
                  </p>
                </CardContent>
              </Card>

              {/* Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle>Alerts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Alert>
                    <CheckCircleIcon className="h-4 w-4" />
                    <AlertDescription>
                      Success alert message
                    </AlertDescription>
                  </Alert>
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertDescription className="text-orange-800">
                      Warning alert message
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Progress/Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Available Properties</span>
                      <span>78%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>New Listings</span>
                      <span>45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Interactive Elements */}
              <Card>
                <CardHeader>
                  <CardTitle>Interactive</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full">
                    Small Button
                  </Button>
                  <Button size="lg" className="w-full">
                    Large Button
                  </Button>
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline">
                      ❤️
                    </Button>
                    <Button size="icon" variant="outline">
                      📍
                    </Button>
                    <Button size="icon" variant="outline">
                      📞
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <CheckCircleIcon className="h-4 w-4" />
              <AlertDescription>
                All components are built with shadcn/ui for consistency, accessibility, and modern design
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <Card className="mt-12">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Ready to Integrate</h3>
            <p className="text-muted-foreground mb-4">
              These enhanced components are now available throughout the application
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild variant="outline">
                <a href="/properties">View Properties</a>
              </Button>
              <Button asChild>
                <a href="/map">Explore Map</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
