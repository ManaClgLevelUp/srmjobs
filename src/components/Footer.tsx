
import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      <div className="container mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-8">
          {/* Company Info & Contact */}
          <div>
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Ready to Start Your SRM Career?
              </h3>
              <p className="text-gray-600 mb-6">
                Join ManaCLG LevelUp and make a difference in students' educational journey
              </p>
              <div className="inline-flex items-center px-6 py-3 bg-orange-50 border border-orange-200 rounded-full">
                <span className="text-orange-700 font-medium">
                  ⚠️ Limited positions available • First come, first serve basis
                </span>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h4>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <a href="tel:+919849834102" className="text-gray-900 font-medium hover:text-blue-600 transition-colors">
                    +91 9849834102
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <a href="mailto:manaclglevelup@gmail.com" className="text-gray-900 font-medium hover:text-green-600 transition-colors">
                    manaclglevelup@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="text-gray-900 font-medium">ManaClg LevelUp Office</p>
                </div>
              </div>
            </div>
          </div>

          {/* Google Maps */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Find Us</h4>
            <div className="rounded-xl overflow-hidden shadow-sm border">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3816.725188057379!2d82.23050167520032!3d16.93884278387385!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a3827e45a16438b%3A0x6a2f6c26a8d09ae7!2sManaClg%20LevelUp!5e0!3m2!1sen!2sru!4v1750162494388!5m2!1sen!2sru" 
                width="100%" 
                height="250" 
                style={{ border: 0, borderRadius: '12px' }}
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 pt-8">
          <div className="text-center">
            <p className="text-gray-500 mb-2">
              ManaCLG LevelUp © 2025. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm">
              Empowering students through innovative career opportunities
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
