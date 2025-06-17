
import React, { useState, useEffect } from 'react';

const MotivationalQuotes = () => {
  const quotes = [
    "Great leaders build meaningful relationships.",
    "Believe in your impact.",
    "Start where you are. Use what you have. Do what you can."
  ];

  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 bg-gradient-to-r from-gray-50 to-blue-50">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-cream rounded-2xl p-8 md:p-12 shadow-sm border border-orange-100 animate-fade-in-up">
            <div className="relative h-20 flex items-center justify-center">
              {quotes.map((quote, index) => (
                <p
                  key={index}
                  className={`absolute inset-0 flex items-center justify-center text-xl md:text-2xl font-montserrat italic text-gray-600 transition-opacity duration-1000 ${
                    index === currentQuote ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  "{quote}"
                </p>
              ))}
            </div>
            
            {/* Quote indicator dots */}
            <div className="flex justify-center space-x-2 mt-6">
              {quotes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuote(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentQuote 
                      ? 'bg-orange-500 scale-110' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MotivationalQuotes;
