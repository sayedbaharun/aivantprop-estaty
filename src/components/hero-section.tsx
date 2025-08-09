'use client';

import { useState } from 'react';
import { ArrowRightIcon, PlayIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export function HeroSection() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Video/Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"
          alt="Luxury Dubai Architecture"
          className="h-full w-full object-cover"
        />
        {/* Luxury Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/80 via-black/60 to-gray-900/90" />
        {/* Animated Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%227%22%20cy%3D%227%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex min-h-screen items-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-4xl">
            {/* Premium Badge */}
            <div className="mb-8">
              <span className="inline-flex items-center rounded-full bg-teal-500/20 px-6 py-2 text-sm font-medium text-teal-100 ring-1 ring-teal-400/30 backdrop-blur-sm">
                UAE&apos;s Premier Off-Plan Platform
              </span>
            </div>

            {/* Main Headline - Dubai Face Inspired */}
            <h1 className="mb-6 text-5xl lg:text-7xl xl:text-8xl font-bold leading-tight tracking-tight">
              <span className="block text-white">LIVE THE</span>
              <span className="block bg-gradient-to-r from-teal-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                ART OF
              </span>
              <span className="block text-white">LUXURY.</span>
            </h1>

            {/* Subtitle */}
            <p className="mb-8 max-w-2xl text-xl lg:text-2xl font-light text-white/90 leading-relaxed">
              Discover breathtaking villas, timeless interiors, and stunning exteriors 
              in Dubai&apos;s most exclusive off-plan developments.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link 
                href="/properties"
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-teal-900 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full hover:from-teal-300 hover:to-cyan-300 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-teal-500/25"
              >
                Explore Properties
                <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button 
                onClick={() => setIsVideoPlaying(true)}
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-full hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
              >
                <PlayIcon className="mr-2 w-5 h-5" />
                Watch Preview
              </button>
            </div>

            {/* Luxury Stats */}
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-teal-400">500+</div>
                <div className="text-sm lg:text-base text-white/70 uppercase tracking-wider">Projects</div>
              </div>
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-teal-400">50+</div>
                <div className="text-sm lg:text-base text-white/70 uppercase tracking-wider">Developers</div>
              </div>
              <div>
                <div className="text-3xl lg:text-4xl font-bold text-teal-400">AED 50B+</div>
                <div className="text-sm lg:text-base text-white/70 uppercase tracking-wider">Portfolio</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex flex-col items-center text-white/60">
          <span className="text-sm uppercase tracking-wider mb-2">Scroll Down</span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-white/60 to-transparent animate-pulse" />
        </div>
      </div>
    </section>
  );
}
