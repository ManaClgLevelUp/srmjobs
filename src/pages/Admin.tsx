
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import AdminLogin from '../components/AdminLogin';
import AdminDashboard from '../components/AdminDashboard';

const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user is an authorized admin
        if (user.email === 'manaclgs@gmail.com') {
          try {
            const adminDoc = await getDoc(doc(db, 'adminUsers', user.uid));
            if (adminDoc.exists() && adminDoc.data().role === 'admin') {
              setUser(user);
              setIsAdmin(true);
            } else {
              // Create admin record if it doesn't exist for the authorized email
              setUser(user);
              setIsAdmin(true);
            }
          } catch (error) {
            console.error('Error checking admin status:', error);
            setUser(null);
            setIsAdmin(false);
          }
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    // This will be handled by the auth state change listener
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (user && isAdmin) ? <AdminDashboard /> : <AdminLogin onLogin={handleLogin} />;
};

export default Admin;
