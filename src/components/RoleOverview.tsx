import React from 'react';
import { DollarSign, Clock, Target, TrendingUp, Award, Home } from 'lucide-react';

const RoleOverview = () => {
  const benefits = [
    {
      icon: <DollarSign className="w-8 h-8 text-green-600" />,
      title: "Monthly Salary",
      value: "₹10,000",
      description: "Fixed monthly compensation"
    },
    {
      icon: <Clock className="w-8 h-8 text-blue-600" />,
      title: "Daily Work",
      value: "4 hours/day",
      description: "12+ hours/week minimum"
    },
    {
      icon: <Target className="w-8 h-8 text-orange-600" />,
      title: "Minimum Target",
      value: "1 registration/week",
      description: "Achievable weekly goal"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-purple-600" />,
      title: "Incentives",
      value: "₹500 per registration",
      description: "After 4 confirmed registrations/month"
    },
    {
      icon: <Award className="w-8 h-8 text-red-600" />,
      title: "Benefits",
      value: "LOR + Certificate",
      description: "Experience Certificate, Monthly Payslip"
    },
    {
      icon: <Home className="w-8 h-8 text-indigo-600" />,
      title: "Work Mode",
      value: "Work from Home",
      description: "Remote work + Free daily training"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 animate-fade-in-up">
              SRM Role Details
            </h2>
            <p className="text-xl text-gray-600 animate-fade-in-up-delay max-w-3xl mx-auto">
              Join our team and start building meaningful relationships with students while developing your professional skills
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="professional-card p-8 text-center group professional-hover animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="mb-6 flex justify-center">
                  <div className="p-4 rounded-2xl bg-gray-50 group-hover:scale-110 transition-transform duration-300">
                    {benefit.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-2xl font-black gradient-text-primary mb-3">{benefit.value}</p>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="professional-card p-8 md:p-12 bg-gradient-to-r from-orange-50 to-blue-50">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Ready to Start Your Career?
              </h3>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Join hundreds of students who have kickstarted their professional journey with ManaCLG LevelUp
              </p>
              <a
                href="#form"
                className="premium-cta-button text-lg"
              >
                APPLY NOW
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoleOverview;
