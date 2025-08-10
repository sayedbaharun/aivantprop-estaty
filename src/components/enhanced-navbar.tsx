'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  HeartIcon,
  PhoneIcon,
  Bars3Icon,
  XMarkIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  ChartBarIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const navigation = [
  {
    name: 'Home',
    href: '/',
    icon: HomeIcon,
  },
  {
    name: 'Properties',
    href: '/properties',
    icon: BuildingOfficeIcon,
  },
  {
    name: 'Developers',
    href: '/developers',
    icon: BuildingOfficeIcon,
  },
  {
    name: 'Areas',
    href: '/areas',
    icon: MapPinIcon,
  },
  {
    name: 'Map',
    href: '/map',
    icon: MapPinIcon,
  },
  {
    name: 'Investment',
    href: '/investment',
    icon: ChartBarIcon,
  },
];

const popularSearches = [
  'Dubai Marina',
  'Downtown Dubai',
  'Business Bay',
  'Palm Jumeirah',
  'EMAAR',
  'DAMAC',
  'Azizi',
  'Studio Apartments',
  '1 Bedroom',
  '2 Bedroom'
];

export function EnhancedNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [favorites, setFavorites] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-100' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-teal-500/25 transition-all duration-300">
                  <span className="text-white font-bold text-lg">O</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              </div>
              <div className="flex flex-col">
                <span className={`text-xl font-bold tracking-tight transition-colors ${
                  isScrolled ? 'text-gray-900' : 'text-white'
                }`}>
                  Off Plan Dub.ai
                </span>
                <span className={`text-xs uppercase tracking-wider transition-colors ${
                  isScrolled ? 'text-teal-600' : 'text-teal-300'
                }`}>
                  Luxury Properties
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  asChild
                  className={`h-12 px-6 rounded-full transition-all duration-300 ${
                    isActive(item.href)
                      ? isScrolled
                        ? 'text-teal-600 bg-teal-50 hover:bg-teal-100'
                        : 'text-teal-300 bg-white/10 hover:bg-white/20'
                      : isScrolled
                        ? 'text-gray-700 hover:text-teal-600 hover:bg-teal-50'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Link href={item.href} className="flex items-center space-x-2">
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                </Button>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              {/* Search */}
              <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-10 w-10 rounded-full transition-all duration-300 ${
                      isScrolled
                        ? 'text-gray-600 hover:text-teal-600 hover:bg-teal-50'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Search Properties</DialogTitle>
                  </DialogHeader>
                  
                  <Command className="rounded-lg border shadow-md">
                    <CommandInput placeholder="Search properties, developers, or locations..." />
                    <CommandList>
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandGroup heading="Popular Searches">
                        {popularSearches.map((term) => (
                          <CommandItem
                            key={term}
                            onSelect={() => {
                              // Handle search selection
                              setSearchOpen(false);
                            }}
                          >
                            <MagnifyingGlassIcon className="mr-2 h-4 w-4" />
                            <span>{term}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </DialogContent>
              </Dialog>

              {/* Favorites */}
              <Button
                variant="ghost"
                size="icon"
                className={`relative h-10 w-10 rounded-full transition-all duration-300 ${
                  isScrolled
                    ? 'text-gray-600 hover:text-teal-600 hover:bg-teal-50'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {favorites > 0 ? (
                  <HeartSolidIcon className="h-5 w-5 text-red-500" />
                ) : (
                  <HeartIcon className="h-5 w-5" />
                )}
                {favorites > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {favorites}
                  </Badge>
                )}
              </Button>

              {/* Contact Button */}
              <Button
                asChild
                className={`hidden md:flex h-10 px-6 rounded-full transition-all duration-300 ${
                  isScrolled
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg shadow-teal-500/25'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                }`}
              >
                <Link href="/contact" className="flex items-center space-x-2">
                  <PhoneIcon className="w-4 h-4" />
                  <span>Contact</span>
                </Link>
              </Button>

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`lg:hidden h-10 w-10 rounded-full transition-all duration-300 ${
                      isScrolled
                        ? 'text-gray-600 hover:text-teal-600 hover:bg-teal-50'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Bars3Icon className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  
                  <div className="mt-6 space-y-2">
                    {navigation.map((item) => (
                      <Button
                        key={item.name}
                        variant={isActive(item.href) ? "default" : "ghost"}
                        asChild
                        className="w-full justify-start h-12"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link href={item.href} className="flex items-center space-x-3">
                          <item.icon className="w-5 h-5" />
                          <span>{item.name}</span>
                        </Link>
                      </Button>
                    ))}
                    
                    <div className="pt-4 border-t">
                      <Button asChild className="w-full h-12">
                        <Link href="/contact" className="flex items-center space-x-2">
                          <PhoneIcon className="w-4 h-4" />
                          <span>Contact Us</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
