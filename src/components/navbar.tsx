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
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const navigation = [
  {
    name: 'Properties',
    href: '/properties',
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
    name: 'Investment',
    href: '/investment',
    icon: ChartBarIcon,
  },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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
            {/* Luxury Logo */}
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
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-1 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive(item.href)
                      ? isScrolled
                        ? 'text-teal-600 bg-teal-50'
                        : 'text-teal-300 bg-white/10'
                      : isScrolled
                        ? 'text-gray-700 hover:text-teal-600 hover:bg-teal-50'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className={`p-3 rounded-full transition-all duration-300 ${
                  isScrolled
                    ? 'text-gray-600 hover:text-teal-600 hover:bg-teal-50'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                title="Search Properties"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>

              {/* Favorites */}
              <button className={`relative p-3 rounded-full transition-all duration-300 ${
                isScrolled
                  ? 'text-gray-600 hover:text-teal-600 hover:bg-teal-50'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}>
                {favorites > 0 ? (
                  <HeartSolidIcon className="w-5 h-5 text-red-500" />
                ) : (
                  <HeartIcon className="w-5 h-5" />
                )}
                {favorites > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {favorites}
                  </span>
                )}
              </button>

              {/* Contact Button */}
              <a
                href="/contact"
                className={`hidden md:flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  isScrolled
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700 shadow-lg shadow-teal-500/25'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                }`}
              >
                <PhoneIcon className="w-4 h-4" />
                <span>Contact</span>
              </a>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`lg:hidden p-3 rounded-full transition-all duration-300 ${
                  isScrolled
                    ? 'text-gray-600 hover:text-teal-600 hover:bg-teal-50'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {isOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-lg border-t border-gray-100">
            <div className="px-4 py-6 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon && <item.icon className="w-5 h-5" />}
                  <span>{item.name}</span>
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200">
                <a
                  href="/contact"
                  className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-medium hover:from-teal-600 hover:to-cyan-700 transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  <PhoneIcon className="w-4 h-4" />
                  <span>Contact Us</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Search Modal Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="flex items-start justify-center pt-16 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Search Properties</h3>
                  <button
                    onClick={() => setSearchOpen(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by location, developer, or property name..."
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg"
                    autoFocus
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-sm text-gray-500">Popular searches:</span>
                  {['Dubai Marina', 'Downtown Dubai', 'Business Bay', 'Emaar', 'DAMAC'].map((term) => (
                    <button
                      key={term}
                      className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm hover:bg-teal-100 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
