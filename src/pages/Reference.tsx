
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import ReferenceLogin from '../components/ReferenceLogin';
import ReferenceDashboard from '../components/ReferenceDashboard';

const Reference = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isReference, setIsReference] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user is a reference
        const userDoc = await getDoc(doc(db, 'references', user.uid));
        if (userDoc.exists() && userDoc.data().type === 'reference') {
          setUser(user);
          setIsReference(true);
        } else {
          setUser(null);
          setIsReference(false);
        }
      } else {
        setUser(null);
        setIsReference(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return user && isReference ? <ReferenceDashboard /> : <ReferenceLogin />;
};

export default Reference;
