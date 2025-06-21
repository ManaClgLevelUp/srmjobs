import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import RemoteJobBanner from '../components/RemoteJobBanner';
import RegistrationForm from '../components/RegistrationForm';
import RoleOverview from '../components/RoleOverview';
import AboutUs from '../components/AboutUs';
import MotivationalQuotes from '../components/MotivationalQuotes';
import Footer from '../components/Footer';
import '../styles/hero.css';

const Index = () => {
  return (
    <div className="relative min-h-screen bg-gray-50 font-inter scroll-smooth">
      {/* Hero Background Section with Header */}      <div className="hero-section">
        <Header />
        <div id="hero">
          <Hero />
        </div>
      </div>

      <div id="benefits">
        <RemoteJobBanner />
      </div>

      <div id="registration-form">
        <RegistrationForm />
      </div>

      <RoleOverview />

      <div id="about">
        <AboutUs />
      </div>

      <MotivationalQuotes />
      <Footer />
    </div>
  );
};

export default Index;
