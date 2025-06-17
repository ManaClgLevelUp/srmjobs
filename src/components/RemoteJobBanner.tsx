
import React from 'react';
import { Home } from 'lucide-react';

const RemoteJobBanner = () => {
  return (
    <section className="py-8 bg-gradient-to-r from-blue-50 to-orange-50">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100 text-center">
            <div className="flex items-center justify-center mb-4">
              <Home className="w-8 h-8 text-orange-500 mr-3" />
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              This is a Remote Job Opportunity
            </h3>
            <p className="text-lg md:text-xl text-gray-600">
              Work from Anywhere in India! No commute, flexible hours, perfect work-life balance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RemoteJobBanner;
