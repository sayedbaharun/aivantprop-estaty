'use client';

import { useState, useEffect } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  BuildingOfficeIcon,
  MapPinIcon,
  PhoneIcon,
  GlobeAltIcon,
  CalendarIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  HomeIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

async function getDeveloper(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002'}/api/developers/${slug}`, {
      cache: 'no-store'
    });
    
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Failed to fetch developer:', error);
    return null;
  }
}

export default function DeveloperDetailPage({ params }: { params: { slug: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const result = await getDeveloper(params.slug);
      setData(result);
      setLoading(false);
    }
    fetchData();
  }, [params.slug]);

  if (loading) return <div className="max-w-4xl mx-auto p-8">Loading...</div>;
  if (!data?.success) return notFound();
  
  const { developer, properties, projectsByStatus, stats } = data.data;

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return 'Price on request';
    if (price >= 1000000) {
      return `AED ${(price / 1000000).toFixed(1)}M`;
    }
    return `AED ${Math.round(price).toLocaleString('en-AE')}`;
  };

  const getStatusBadge = (status: string | null | undefined) => {
    switch (status) {
      case 'SELLING':
        return <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Available</span>;
      case 'LAUNCHING':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">Launching</span>;
      case 'COMING_SOON':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">Coming Soon</span>;
      case 'SOLD_OUT':
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">Sold Out</span>;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-6">
            <Link 
              href="/developers" 
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Developers</span>
            </Link>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start space-x-6">
              {developer.logo ? (
                <img 
                  src={developer.logo} 
                  alt={`${developer.name} logo`} 
                  className="w-24 h-24 object-contain rounded-xl bg-gray-50 p-3"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                  <BuildingOfficeIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{developer.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                  {developer.establishedYear && (
                    <span className="flex items-center space-x-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Established {developer.establishedYear}</span>
                    </span>
                  )}
                  {developer.headquarters && (
                    <span className="flex items-center space-x-1">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{developer.headquarters}</span>
                    </span>
                  )}
                </div>
                
                {developer.description && (
                  <p className="text-gray-700 max-w-2xl">{developer.description}</p>
                )}
              </div>
            </div>
            
            {/* Contact Info */}
            <div className="mt-6 lg:mt-0 bg-gray-50 rounded-xl p-6 min-w-[300px]">
              <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3 mb-6">
                {developer.phone && (
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{developer.phone}</span>
                  </div>
                )}
                {developer.email && (
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.708a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700">{developer.email}</span>
                  </div>
                )}
                {developer.website && (
                  <div className="flex items-center space-x-3">
                    <GlobeAltIcon className="w-5 h-5 text-gray-400" />
                    <a 
                      href={developer.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 truncate"
                    >
                      {developer.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>

              {/* Action CTAs */}
              <div className="space-y-3">
                <button 
                  className="w-full px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center"
                  onClick={() => {
                    const phone = developer.phone || '971501234567';
                    const message = `Hi, I'm interested in ${developer.name}'s projects. Can we schedule a consultation?`;
                    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Contact Developer
                </button>

                <button 
                  className="w-full px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors duration-200 flex items-center justify-center"
                  onClick={() => {
                    const email = developer.email || 'info@offplandub.ai';
                    const subject = `Portfolio Request - ${developer.name}`;
                    const body = `Hi, I would like to request a complete portfolio of all ${developer.name} projects including floor plans, pricing, and payment plans.`;
                    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Get All Projects
                </button>

                <button 
                  className="w-full px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium rounded-lg border border-amber-200 transition-colors duration-200 flex items-center justify-center"
                  onClick={() => {
                    // Redirect to investment consultation
                    window.location.href = `/investment?developer=${encodeURIComponent(developer.name)}`;
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Investment Consultation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalProjects}</div>
            <div className="text-sm text-gray-600">Total Projects</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <ChartBarIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.activeProjects}</div>
            <div className="text-sm text-gray-600">Active Projects</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <HomeIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalUnits.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Units</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <CurrencyDollarIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.avgPrice > 0 ? formatPrice(stats.avgPrice) : 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Average Price</div>
          </div>
        </div>

        {/* Projects by Status */}
        <div className="space-y-8">
          {/* Active Projects */}
          {projectsByStatus.active.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Active Projects</h2>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {projectsByStatus.active.length} projects
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectsByStatus.active.map((project) => (
                  <Link key={project.id} href={`/properties/${project.slug}`} className="group">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-200 mb-4">
                      {project.heroImage ? (
                        <img 
                          src={project.heroImage} 
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BuildingOfficeIcon className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="absolute top-3 left-3">
                        {getStatusBadge(project.salesStatus)}
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 mb-2">
                      {project.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>{project.city?.name}{project.district ? `, ${project.district.name}` : ''}</span>
                      {project.handoverYear && (
                        <span>Handover: Q{project.handoverQuarter || '-'} {project.handoverYear}</span>
                      )}
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatPrice(project.minPrice)}
                      {project.maxPrice && project.maxPrice !== project.minPrice && (
                        <span className="text-sm text-gray-600 font-normal"> - {formatPrice(project.maxPrice)}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Projects */}
          {projectsByStatus.upcoming.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Upcoming Projects</h2>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  {projectsByStatus.upcoming.length} projects
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectsByStatus.upcoming.slice(0, 6).map((project) => (
                  <Link key={project.id} href={`/properties/${project.slug}`} className="group">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-200 mb-4">
                      {project.heroImage ? (
                        <img 
                          src={project.heroImage} 
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BuildingOfficeIcon className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="absolute top-3 left-3">
                        {getStatusBadge(project.salesStatus)}
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 mb-2">
                      {project.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>{project.city?.name}{project.district ? `, ${project.district.name}` : ''}</span>
                      {project.handoverYear && (
                        <span>Handover: Q{project.handoverQuarter || '-'} {project.handoverYear}</span>
                      )}
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatPrice(project.minPrice)}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Completed Projects */}
          {projectsByStatus.completed.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Completed Projects</h2>
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                  {projectsByStatus.completed.length} projects
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectsByStatus.completed.slice(0, 6).map((project) => (
                  <Link key={project.id} href={`/properties/${project.slug}`} className="group">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-200 mb-4">
                      {project.heroImage ? (
                        <img 
                          src={project.heroImage} 
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BuildingOfficeIcon className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="absolute top-3 left-3">
                        {getStatusBadge(project.salesStatus)}
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 mb-2">
                      {project.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>{project.city?.name}{project.district ? `, ${project.district.name}` : ''}</span>
                      {project.handoverYear && (
                        <span>Completed {project.handoverYear}</span>
                      )}
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatPrice(project.minPrice)}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl shadow-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Interested in {developer.name} Properties?</h2>
          <p className="text-gray-200 mb-6 max-w-2xl mx-auto">
            Get exclusive access to new launches, floor plans, and investment opportunities from {developer.name}.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center space-x-2 bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            <span>Contact Our Experts</span>
            <PhoneIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
