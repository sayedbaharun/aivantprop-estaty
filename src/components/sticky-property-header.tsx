'use client';

import { useState, useEffect } from 'react';
import { HeartIcon, PhoneIcon, ChatBubbleBottomCenterIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface StickyPropertyHeaderProps {
  propertyTitle: string;
  propertyPrice?: string;
  propertyId?: string;
  isVisible: boolean;
}

export function StickyPropertyHeader({ 
  propertyTitle, 
  propertyPrice, 
  propertyId,
  isVisible 
}: StickyPropertyHeaderProps) {
  const [isSaved, setIsSaved] = useState(false);

  const handleContact = () => {
    const message = `Hi, I'm interested in ${propertyTitle}. Can we discuss the details?`;
    window.open(`https://wa.me/971501234567?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleEnquire = () => {
    document.getElementById('enquire')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-lg transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          {/* Property Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {propertyTitle}
            </h3>
            {propertyPrice && (
              <p className="text-sm text-teal-600 font-medium">
                {propertyPrice}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 ml-4">
            {/* Favorite Button */}
            <button
              onClick={() => setIsSaved(!isSaved)}
              className="p-2 rounded-full text-gray-600 hover:text-red-500 hover:bg-gray-100 transition-colors duration-200"
              title={isSaved ? "Remove from favorites" : "Add to favorites"}
            >
              {isSaved ? (
                <HeartSolidIcon className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
            </button>

            {/* Call Button */}
            <button
              onClick={() => window.open('tel:+971501234567', '_self')}
              className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
            >
              <PhoneIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Call</span>
            </button>

            {/* WhatsApp Button */}
            <button
              onClick={handleContact}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
            >
              <ChatBubbleBottomCenterIcon className="w-4 h-4" />
              <span className="text-sm font-medium">WhatsApp</span>
            </button>

            {/* Enquire Button */}
            <button
              onClick={handleEnquire}
              className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all duration-200"
            >
              <span className="text-sm">Enquire Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
