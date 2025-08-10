'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

interface SearchFilters {
  query?: string;
  city?: string;
  developer?: string;
  priceRange?: string;
  propertyType?: string;
  salesStatus?: string;
}

interface EnhancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  placeholder?: string;
  showFilters?: boolean;
  className?: string;
}

const popularSearches = [
  'Dubai Marina',
  'Downtown Dubai', 
  'Business Bay',
  'Palm Jumeirah',
  'Jumeirah Village Circle',
  'Dubai South',
  'Al Barsha',
  'DIFC'
];

const developers = [
  'EMAAR',
  'DAMAC',
  'Azizi',
  'Sobha',
  'Meraas',
  'Nakheel',
  'Dubai Properties',
  'Aldar'
];

const priceRanges = [
  { value: '0-1000000', label: 'Under AED 1M' },
  { value: '1000000-2000000', label: 'AED 1M - 2M' },
  { value: '2000000-5000000', label: 'AED 2M - 5M' },
  { value: '5000000-10000000', label: 'AED 5M - 10M' },
  { value: '10000000-', label: 'Above AED 10M' }
];

export function EnhancedSearch({ 
  onSearch, 
  placeholder = "Search properties, developers, or locations...",
  showFilters = true,
  className = ""
}: EnhancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onSearch({});
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-6">
        {/* Main Search */}
        <div className="space-y-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={placeholder}
              value={filters.query || ''}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              className="pl-10 pr-4 h-12 text-base"
            />
            
            {/* Advanced Search Dialog */}
            {showFilters && (
              <Dialog open={showAdvanced} onOpenChange={setShowAdvanced}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    <FunnelIcon className="h-4 w-4 mr-1" />
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Advanced Search Filters</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    {/* City Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">City</label>
                      <Select value={filters.city || ''} onValueChange={(value) => handleFilterChange('city', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select city..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Cities</SelectItem>
                          <SelectItem value="Dubai">Dubai</SelectItem>
                          <SelectItem value="Abu Dhabi">Abu Dhabi</SelectItem>
                          <SelectItem value="Sharjah">Sharjah</SelectItem>
                          <SelectItem value="Ras Al Khaimah">Ras Al Khaimah</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Developer Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Developer</label>
                      <Select value={filters.developer || ''} onValueChange={(value) => handleFilterChange('developer', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select developer..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Developers</SelectItem>
                          {developers.map(dev => (
                            <SelectItem key={dev} value={dev}>{dev}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Price Range Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Price Range</label>
                      <Select value={filters.priceRange || ''} onValueChange={(value) => handleFilterChange('priceRange', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select price range..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any Price</SelectItem>
                          {priceRanges.map(range => (
                            <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sales Status Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sales Status</label>
                      <Select value={filters.salesStatus || ''} onValueChange={(value) => handleFilterChange('salesStatus', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any Status</SelectItem>
                          <SelectItem value="AVAILABLE">Available</SelectItem>
                          <SelectItem value="LIMITED_AVAILABILITY">Limited Availability</SelectItem>
                          <SelectItem value="COMING_SOON">Coming Soon</SelectItem>
                          <SelectItem value="SOLD_OUT">Sold Out</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={clearFilters}>
                        Clear All
                      </Button>
                      <Button onClick={() => setShowAdvanced(false)}>
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Quick Search Suggestions */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Popular:</span>
            {popularSearches.slice(0, 4).map((term) => (
              <Badge
                key={term}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleFilterChange('query', term)}
              >
                {term}
              </Badge>
            ))}
          </div>

          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {Object.entries(filters).map(([key, value]) => {
                if (!value) return null;
                return (
                  <Badge
                    key={key}
                    variant="default"
                    className="cursor-pointer"
                    onClick={() => handleFilterChange(key as keyof SearchFilters, '')}
                  >
                    {key}: {value} ×
                  </Badge>
                );
              })}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
