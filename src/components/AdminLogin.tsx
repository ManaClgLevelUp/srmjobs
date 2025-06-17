
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Lock, Mail, Eye, EyeOff, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
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

      // Store admin login in Firestore
      await setDoc(doc(db, 'adminUsers', user.uid), {
        email: user.email,
        lastLogin: serverTimestamp(),
        uid: user.uid
      }, { merge: true });

      toast({
        title: "Login Successful",
        description: "Welcome to the admin dashboard!",
      });

      onLogin();
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
        <div className="professional-card p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Login</h1>
            <p className="text-gray-600">ManaCLG LevelUp SRM Dashboard</p>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:input-focus transition-all duration-300"
                placeholder="Enter your admin email"
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
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:input-focus transition-all duration-300"
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

            {/* Default credentials hint */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-700 text-sm">
                <strong>Default Credentials:</strong><br />
                Email: srm@gmail.com<br />
                Password: srm@12345
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLogging}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLogging ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Signing In...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
