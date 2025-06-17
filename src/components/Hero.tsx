
import React from 'react';
import { ArrowDown } from 'lucide-react';

const Hero = () => {
  const scrollToForm = () => {
    const formElement = document.getElementById('registration-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://res.cloudinary.com/dvmrhs2ek/image/upload/v1750141293/m5apruz8sdf27kc2hv9c.jpg')`
      }}
    >
      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="max-w-4xl mx-auto text-white">
          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 animate-fade-in-up leading-tight">
            Join as a Student Relationship Manager
          </h1>

          {/* Subheading */}
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-8 animate-fade-in-up-delay text-orange-300">
            Remote Job – Work From Your Home
          </h2>

          {/* Salary info */}
          <p className="text-xl md:text-2xl mb-12 animate-fade-in-up-delay leading-relaxed">
            Earn a Fixed <span className="text-green-400 font-bold">₹10,000/month</span> + 
            <span className="text-orange-300 font-bold"> ₹500 per extra student registration</span>
          </p>

          {/* CTA Button */}
          <button
            onClick={scrollToForm}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg rounded-xl hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all duration-300 shadow-2xl animate-fade-in-up-delay"
          >
            Apply Now
            <ArrowDown className="ml-2 w-5 h-5 animate-bounce" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
