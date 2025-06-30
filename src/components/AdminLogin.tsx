
import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Lock, Mail, Eye, EyeOff, Shield, UserPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);

  const createAdminAccount = async () => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password to create admin account.",
        variant: "destructive"
      });
      return;
    }

    if (email !== 'manaclgs@gmail.com') {
      toast({
        title: "Error",
        description: "Only manaclgs@gmail.com can be set as admin.",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    setIsLogging(true);
    try {
      // Create the admin user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store admin user in Firestore with admin role
      await setDoc(doc(db, 'adminUsers', user.uid), {
        email: user.email,
        role: 'admin',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        uid: user.uid
      });

      toast({
        title: "Admin Account Created",
        description: "Admin account has been created successfully. You can now login.",
      });

      setShowCreateAdmin(false);
      onLogin();
    } catch (error: any) {
      console.error('Create admin error:', error);
      toast({
        title: "Account Creation Failed",
        description: error.message || "Failed to create admin account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLogging(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLogging(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if the user is an authorized admin
      if (user.email !== 'manaclgs@gmail.com') {
        toast({
          title: "Access Denied",
          description: "You are not authorized to access the admin dashboard.",
          variant: "destructive"
        });
        return;
      }

      // Store/update admin user in Firestore with admin role
      await setDoc(doc(db, 'adminUsers', user.uid), {
        email: user.email,
        role: 'admin',
        lastLogin: serverTimestamp(),
        uid: user.uid,
        createdAt: serverTimestamp()
      }, { merge: true });

      toast({
        title: "Login Successful",
        description: "Welcome to the admin dashboard!",
      });

      onLogin();
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Check if the error is due to user not found
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        toast({
          title: "Account Not Found",
          description: "Admin account doesn't exist. Would you like to create it?",
          variant: "destructive"
        });
        setShowCreateAdmin(true);
      } else {
        toast({
          title: "Login Failed",
          description: error.message || "Invalid credentials. Please try again.",
          variant: "destructive"
        });
      }
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
            {showCreateAdmin && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-yellow-800 font-semibold">Create Admin Account</h3>
                </div>
                <p className="text-yellow-700 text-sm mb-4">
                  The admin account doesn't exist. Click the button below to create the admin account with the credentials you entered.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={createAdminAccount}
                    disabled={isLogging}
                    className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-300 text-sm font-medium disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Admin Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateAdmin(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-300 text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

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
