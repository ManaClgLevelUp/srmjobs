
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Lock, Mail, Eye, EyeOff, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ReferenceLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLogging(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verify user is a reference
      const userDoc = await getDoc(doc(db, 'references', user.uid));
      if (!userDoc.exists() || userDoc.data().type !== 'reference') {
        throw new Error('Access denied. This account is not authorized for reference access.');
      }

      toast({
        title: "Login Successful",
        description: "Welcome to your reference dashboard!",
      });
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 rounded-xl mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Reference Login</h1>
            <p className="text-gray-600">ManaCLG LevelUp Reference Portal</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="flex items-center text-sm font-semibold text-gray-700">
                <Mail className="w-4 h-4 mr-2" />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter your reference email"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="flex items-center text-sm font-semibold text-gray-700">
                <Lock className="w-4 h-4 mr-2" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLogging}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-700 hover:to-green-800 focus:ring-4 focus:ring-green-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLogging ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3 inline-block"></div>
                  Signing In...
                </>
              ) : (
                'Access Reference Dashboard'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReferenceLogin;
