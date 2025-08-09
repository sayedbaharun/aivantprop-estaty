'use client';

import { useState } from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface ShowcaseProject {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  location: string;
  description: string;
  image: string;
  price?: string;
  developer?: string;
}

const showcaseProjects: ShowcaseProject[] = [
  {
    id: '1',
    number: '01',
    title: 'VILLA SERENE',
    subtitle: 'DUBAI HILLS',
    location: 'Dubai Hills Estate',
    description: 'Luxury meets modern minimalism in this breathtaking villa with panoramic views, infinity pool, and full smart-home automation.',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    price: 'From AED 5.2M',
    developer: 'Emaar Properties'
  },
  {
    id: '2',
    number: '02',
    title: 'CASA BLANCA',
    subtitle: 'PALM JUMEIRAH',
    location: 'Palm Jumeirah',
    description: 'Waterfront elegance redefined with private beach access, world-class amenities, and stunning Arabian Gulf views.',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80',
    price: 'From AED 8.5M',
    developer: 'Nakheel'
  },
  {
    id: '3',
    number: '03',
    title: 'THE OASIS',
    subtitle: 'DOWNTOWN DUBAI',
    location: 'Downtown Dubai',
    description: 'Urban sophistication at its finest, featuring rooftop gardens, concierge services, and direct Burj Khalifa views.',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    price: 'From AED 3.8M',
    developer: 'Emaar Properties'
  },
  {
    id: '4',
    number: '04',
    title: 'MAISON AZURE',
    subtitle: 'BLUEWATERS ISLAND',
    location: 'Bluewaters Island',
    description: 'Coastal living perfected with marina access, premium finishes, and unobstructed views of Ain Dubai.',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    price: 'From AED 6.2M',
    developer: 'Meraas'
  }
];

export function LuxuryShowcaseSection() {
  const [activeProject, setActiveProject] = useState(showcaseProjects[0]);

  return (
    <section className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpolygon%20points%3D%2250%200%2060%2040%20100%2050%2060%2060%2050%20100%2040%2060%200%2050%2040%2040%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Content */}
            <div className="space-y-8">
              {/* Section Header */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-[1px] bg-gradient-to-r from-teal-400 to-cyan-400"></div>
                  <span className="text-teal-400 uppercase tracking-wider text-sm font-medium">
                    Exclusive Projects
                  </span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                  Discover Our
                  <span className="block text-transparent bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text">
                    Premium Collection
                  </span>
                </h2>
              </div>

              {/* Project Navigation */}
              <div className="space-y-2">
                {showcaseProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => setActiveProject(project)}
                    className={`w-full text-left p-4 rounded-lg transition-all duration-300 group ${
                      activeProject.id === project.id
                        ? 'bg-teal-500/10 border-l-4 border-teal-400'
                        : 'hover:bg-white/5 border-l-4 border-transparent hover:border-teal-400/50'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <span className={`text-2xl font-bold transition-colors ${
                        activeProject.id === project.id ? 'text-teal-400' : 'text-white/40'
                      }`}>
                        {project.number}
                      </span>
                      <div>
                        <div className={`font-semibold transition-colors ${
                          activeProject.id === project.id ? 'text-white' : 'text-white/70'
                        }`}>
                          {project.title}
                        </div>
                        <div className={`text-sm transition-colors ${
                          activeProject.id === project.id ? 'text-teal-300' : 'text-white/50'
                        }`}>
                          {project.subtitle}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Side - Project Showcase */}
            <div className="relative">
              {/* Project Number - Large */}
              <div className="absolute -top-8 -left-8 z-10">
                <span className="text-8xl lg:text-9xl font-bold text-white/5">
                  {activeProject.number}
                </span>
              </div>

              {/* Main Project Image */}
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden group">
                <img
                  src={activeProject.image}
                  alt={activeProject.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Project Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-2">
                      {activeProject.title}
                    </h3>
                    <p className="text-teal-300 font-medium">
                      {activeProject.location}
                    </p>
                  </div>
                  
                  <p className="text-white/90 text-sm leading-relaxed">
                    {activeProject.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {activeProject.price}
                      </div>
                      <div className="text-teal-300 text-sm">
                        {activeProject.developer}
                      </div>
                    </div>
                    
                    <a
                      href={`/properties?search=${activeProject.title}`}
                      className="group/btn flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-cyan-600 px-6 py-3 rounded-full text-white font-medium hover:from-teal-400 hover:to-cyan-500 transition-all duration-300 transform hover:scale-105"
                    >
                      <span>View Details</span>
                      <ArrowRightIcon className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-teal-500/20 to-cyan-600/20 rounded-full blur-xl" />
              <div className="absolute -top-4 -right-8 w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-teal-600/20 rounded-full blur-lg" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
