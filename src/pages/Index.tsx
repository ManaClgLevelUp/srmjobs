
import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import RemoteJobBanner from '../components/RemoteJobBanner';
import RoleOverview from '../components/RoleOverview';
import MotivationalQuotes from '../components/MotivationalQuotes';
import AboutUs from '../components/AboutUs';
import RegistrationForm from '../components/RegistrationForm';
import Footer from '../components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-inter scroll-smooth">
      <Header />
      <div id="hero">
        <Hero />
      </div>
      <div id="benefits">
        <RemoteJobBanner />
      </div>
      <RegistrationForm />
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
