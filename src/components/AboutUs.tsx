
import React from 'react';
import { GraduationCap, Briefcase, Award, Code, Brain, Shield } from 'lucide-react';

const AboutUs = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-serif">
              About ManaCLG LevelUp
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-blue-500 mx-auto mb-6"></div>
          </div>

          {/* Main Content */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 md:p-12 mb-12">
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8 font-serif">
              ManaCLG LevelUp is an Online Education Institution that trains students in cutting-edge technologies 
              and prepares them for successful careers in the digital world.
            </p>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <Code className="w-8 h-8 text-blue-600 mb-4" />
                <h4 className="font-bold text-gray-900 mb-2">Frontend & Fullstack Development</h4>
                <p className="text-gray-600 text-sm">Modern web development with React, Node.js, and cloud technologies</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <Brain className="w-8 h-8 text-purple-600 mb-4" />
                <h4 className="font-bold text-gray-900 mb-2">Generative AI, ML & AI</h4>
                <p className="text-gray-600 text-sm">Advanced AI/ML concepts, ChatGPT integration, and automation</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <Shield className="w-8 h-8 text-green-600 mb-4" />
                <h4 className="font-bold text-gray-900 mb-2">Data Science & Cyber Security</h4>
                <p className="text-gray-600 text-sm">Data analysis, visualization, and cybersecurity fundamentals</p>
              </div>
            </div>

            {/* Level System */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-4 bg-white rounded-xl p-4 shadow-sm">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">Level 1: Skill Building</h5>
                  <p className="text-gray-600 text-sm">Project-based learning with hands-on experience</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 bg-white rounded-xl p-4 shadow-sm">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">Level 2: Job Preparation</h5>
                  <p className="text-gray-600 text-sm">Interview preparation, resume building, and soft skills</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 bg-white rounded-xl p-4 shadow-sm">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">Level 3: Job Placements</h5>
                  <p className="text-gray-600 text-sm">Direct placement assistance with partner companies</p>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center bg-white rounded-xl p-6 shadow-sm">
                <GraduationCap className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                <h5 className="font-bold text-gray-900 mb-2">🎓 Certificates</h5>
                <p className="text-gray-600 text-sm">Industry-recognized completion certificates</p>
              </div>
              
              <div className="text-center bg-white rounded-xl p-6 shadow-sm">
                <Briefcase className="w-10 h-10 text-orange-600 mx-auto mb-3" />
                <h5 className="font-bold text-gray-900 mb-2">💼 Internships</h5>
                <p className="text-gray-600 text-sm">Paid internships up to ₹15,000</p>
              </div>
              
              <div className="text-center bg-white rounded-xl p-6 shadow-sm">
                <Award className="w-10 h-10 text-green-600 mx-auto mb-3" />
                <h5 className="font-bold text-gray-900 mb-2">📝 LOR & Experience</h5>
                <p className="text-gray-600 text-sm">Letter of Recommendation & Experience Letters</p>
              </div>
            </div>
          </div>

          {/* Role Description */}
          <div className="bg-gradient-to-r from-orange-50 to-blue-50 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Role as an SRM</h3>
            <p className="text-lg text-gray-700 font-serif">
              You will register students into this transformative program, helping them build careers 
              in technology while earning attractive commissions for your efforts.
            </p>
          </div>

          {/* Inspirational Quote */}
          <div className="mt-12 text-center">
            <blockquote className="text-2xl md:text-3xl font-serif italic text-gray-700 mb-4">
              "The best time to plant a tree was 20 years ago. The second best time is now."
            </blockquote>
            <cite className="text-gray-500 font-medium">– Chinese Proverb</cite>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
