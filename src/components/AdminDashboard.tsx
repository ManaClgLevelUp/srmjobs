import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, Timestamp, addDoc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { Users, TrendingUp, Target, LogOut, Search, Filter, Edit2, Phone, Mail, MapPin, Clock, CheckCircle, XCircle, AlertCircle, Download, MessageCircle, Shield, Trash2, Eye, Plus, Settings, UserCheck, Briefcase, UserPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Applicant {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  education: string;
  city: string;
  currentPosition: string;
  workingHours: string;
  weeklyAvailability: string;
  whyThisRole: string;
  reference: string;
  referenceId?: string;
  referenceName?: string;
  status: 'New' | 'Contacted' | 'Hired' | 'Rejected' | 'In Review';
  salesCompleted: number;
  notes?: string;
  submittedAt: Timestamp;
}

interface Reference {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt?: Timestamp;
  createdBy?: string;
  type: string;
}

const AdminDashboard = () => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [filteredApplicants, setFilteredApplicants] = useState<Applicant[]>([]);
  const [references, setReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [referenceFilter, setReferenceFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('applicants');
  const [editingApplicant, setEditingApplicant] = useState<string | null>(null);
  const [editingSales, setEditingSales] = useState<number>(0);
  const [editingNotes, setEditingNotes] = useState<string>('');
  const [viewingApplicant, setViewingApplicant] = useState<Applicant | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [newReferenceName, setNewReferenceName] = useState('');
  const [editingReference, setEditingReference] = useState<string | null>(null);
  const [editingReferenceName, setEditingReferenceName] = useState('');
  const [showCreateReference, setShowCreateReference] = useState(false);
  const [newReferenceData, setNewReferenceData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [creatingReference, setCreatingReference] = useState(false);

  useEffect(() => {
    fetchApplicants();
    fetchReferences();
  }, []);

  useEffect(() => {
    filterApplicants();
  }, [applicants, searchTerm, statusFilter, cityFilter, referenceFilter]);

  const fetchApplicants = async () => {
    try {
      const q = query(collection(db, 'applicants'), orderBy('submittedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const applicantsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Applicant[];
      
      setApplicants(applicantsData);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      toast({
        title: "Error",
        description: "Failed to fetch applicants data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReferences = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'references'));
      const referencesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        email: doc.data().email,
        phone: doc.data().phone,
        createdAt: doc.data().createdAt,
        createdBy: doc.data().createdBy,
        type: doc.data().type
      })) as Reference[];
      
      setReferences(referencesData.filter(ref => ref.type === 'reference'));
    } catch (error) {
      console.error('Error fetching references:', error);
    }
  };

  const filterApplicants = () => {
    let filtered = applicants;

    if (searchTerm) {
      filtered = filtered.filter(applicant =>
        applicant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.phone.includes(searchTerm)
      );
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(applicant => applicant.status === statusFilter);
    }

    if (cityFilter !== 'All') {
      filtered = filtered.filter(applicant => applicant.city === cityFilter);
    }

    if (referenceFilter !== 'All') {
      filtered = filtered.filter(applicant => applicant.referenceId === referenceFilter);
    }

    setFilteredApplicants(filtered);
  };

  const addReference = async () => {
    if (!newReferenceName.trim()) return;
    
    try {
      await addDoc(collection(db, 'references'), { name: newReferenceName.trim(), type: 'reference' });
      setNewReferenceName('');
      fetchReferences();
      toast({
        title: "Reference Added",
        description: `${newReferenceName} has been added to the reference list`,
      });
    } catch (error) {
      console.error('Error adding reference:', error);
      toast({
        title: "Error",
        description: "Failed to add reference",
        variant: "destructive"
      });
    }
  };

  const updateReference = async (id: string, newName: string) => {
    try {
      await updateDoc(doc(db, 'references', id), { name: newName });
      setEditingReference(null);
      setEditingReferenceName('');
      fetchReferences();
      toast({
        title: "Reference Updated",
        description: "Reference name has been updated",
      });
    } catch (error) {
      console.error('Error updating reference:', error);
      toast({
        title: "Error",
        description: "Failed to update reference",
        variant: "destructive"
      });
    }
  };

  const deleteReference = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'references', id));
      fetchReferences();
      toast({
        title: "Reference Deleted",
        description: "Reference has been removed",
      });
    } catch (error) {
      console.error('Error deleting reference:', error);
      toast({
        title: "Error",
        description: "Failed to delete reference",
        variant: "destructive"
      });
    }
  };

  const updateApplicantStatus = async (id: string, newStatus: 'New' | 'Contacted' | 'Hired' | 'Rejected' | 'In Review') => {
    try {
      await updateDoc(doc(db, 'applicants', id), { status: newStatus });
      setApplicants(prev => prev.map(app => 
        app.id === id ? { ...app, status: newStatus } : app
      ));
      toast({
        title: "Status Updated",
        description: `Applicant status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const updateSalesCount = async (id: string, salesCount: number) => {
    try {
      await updateDoc(doc(db, 'applicants', id), { salesCompleted: salesCount });
      setApplicants(prev => prev.map(app => 
        app.id === id ? { ...app, salesCompleted: salesCount } : app
      ));
      setEditingApplicant(null);
      toast({
        title: "Registrations Updated",
        description: `Registration count updated to ${salesCount}`,
      });
    } catch (error) {
      console.error('Error updating registrations:', error);
      toast({
        title: "Error",
        description: "Failed to update registration count",
        variant: "destructive"
      });
    }
  };

  const updateNotes = async (id: string, notes: string) => {
    try {
      await updateDoc(doc(db, 'applicants', id), { notes });
      setApplicants(prev => prev.map(app => 
        app.id === id ? { ...app, notes } : app
      ));
      setEditingApplicant(null);
      setEditingNotes('');
      toast({
        title: "Notes Updated",
        description: "Applicant notes have been updated",
      });
    } catch (error) {
      console.error('Error updating notes:', error);
      toast({
        title: "Error",
        description: "Failed to update notes",
        variant: "destructive"
      });
    }
  };

  const deleteApplicant = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'applicants', id));
      setApplicants(prev => prev.filter(app => app.id !== id));
      setShowDeleteConfirm(null);
      toast({
        title: "Applicant Deleted",
        description: "Applicant has been removed from the system",
      });
    } catch (error) {
      console.error('Error deleting applicant:', error);
      toast({
        title: "Error",
        description: "Failed to delete applicant",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleCallClick = (phone: string) => {
    window.open(`tel:+91${phone}`, '_self');
  };

  const handleWhatsAppClick = (phone: string, name: string) => {
    const message = `Hi ${name}, thank you for applying as SRM at ManaCLG LevelUp. Our team will be in touch shortly.`;
    const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const exportToExcel = () => {
    const headers = ['Name', 'Email', 'Phone', 'Age', 'Gender', 'Education', 'City', 'Current Position', 'Working Hours', 'Weekly Availability', 'Reference', 'Status', 'Registrations Completed', 'Notes', 'Application Date'];
    const csvContent = [
      headers.join(','),
      ...filteredApplicants.map(app => [
        app.fullName,
        app.email,
        app.phone,
        app.age,
        app.gender,
        app.education,
        app.city,
        app.currentPosition || '',
        app.workingHours,
        app.weeklyAvailability,
        app.reference,
        app.status,
        app.salesCompleted,
        app.notes || '',
        app.submittedAt?.toDate().toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `srm_applicants_${referenceFilter !== 'All' ? referenceFilter + '_' : ''}${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Export Successful",
      description: `${filteredApplicants.length} applicant records exported to CSV`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Contacted':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'In Review':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'Hired':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Calculate KPIs
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();

  const monthlyApplicants = applicants.filter(app => {
    const date = app.submittedAt?.toDate();
    return date && date.getMonth() === thisMonth && date.getFullYear() === thisYear;
  }).length;

  const qualifiedCandidates = applicants.filter(app => app.status === 'Hired').length;
  const totalRegistrations = applicants.reduce((sum, app) => sum + app.salesCompleted, 0);
  const targetAchieved = Math.min((totalRegistrations / (applicants.length * 4) * 100), 100);
  const uniqueCities = [...new Set(applicants.map(app => app.city))];
  const referenceStats = references.map(ref => ({
    name: ref.name,
    count: applicants.filter(app => app.referenceId === ref.id || app.reference === ref.name).length
  }));

  const createReference = async () => {
    if (!newReferenceData.name.trim() || !newReferenceData.email.trim() || !newReferenceData.phone.trim() || !newReferenceData.password.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (newReferenceData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    setCreatingReference(true);
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, newReferenceData.email, newReferenceData.password);
      const user = userCredential.user;

      // Save reference data in Firestore
      await setDoc(doc(db, 'references', user.uid), {
        name: newReferenceData.name,
        email: newReferenceData.email,
        phone: newReferenceData.phone,
        createdBy: auth.currentUser?.uid,
        createdAt: Timestamp.now(),
        type: 'reference'
      });

      // Reset form and close panel
      setNewReferenceData({ name: '', email: '', phone: '', password: '' });
      setShowCreateReference(false);
      
      // Refresh references list
      fetchReferences();

      toast({
        title: "Reference Created",
        description: `Reference login created for ${newReferenceData.name}`,
      });
    } catch (error: any) {
      console.error('Error creating reference:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create reference login",
        variant: "destructive"
      });
    } finally {
      setCreatingReference(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      {/* Header - Sticky */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-5 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">SRM Admin Dashboard</h1>
                <p className="text-sm text-gray-600 hidden sm:block">ManaCLG LevelUp – Student Relationship Manager</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition-all duration-300 text-sm font-medium"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="px-5 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex space-x-1 p-1 bg-gray-100 rounded-xl mb-8 max-w-md">
          <button
            onClick={() => setActiveTab('applicants')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === 'applicants'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Applicants
          </button>
          <button
            onClick={() => setActiveTab('references')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === 'references'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            References
          </button>
        </div>

        {activeTab === 'applicants' && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Total Applicants This Month</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{monthlyApplicants}</p>
                  </div>
                  <div className="text-3xl">👥</div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Qualified Candidates</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{qualifiedCandidates}</p>
                  </div>
                  <div className="text-3xl">✅</div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Total Registrations</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totalRegistrations}</p>
                  </div>
                  <div className="text-3xl">📈</div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Target Achieved</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{targetAchieved.toFixed(1)}%</p>
                  </div>
                  <div className="text-3xl">🎯</div>
                </div>
                <div className="mt-4 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${targetAchieved}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-gray-100 mb-8">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="w-full lg:flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search applicants..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all duration-300"
                      />
                    </div>

                    {/* Status Filter */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all duration-300"
                    >
                      <option value="All">All Status</option>
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="In Review">In Review</option>
                      <option value="Hired">Hired</option>
                      <option value="Rejected">Rejected</option>
                    </select>

                    {/* City Filter */}
                    <select
                      value={cityFilter}
                      onChange={(e) => setCityFilter(e.target.value)}
                      className="px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all duration-300"
                    >
                      <option value="All">All Cities</option>
                      {uniqueCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>

                    {/* Reference Filter */}
                    <select
                      value={referenceFilter}
                      onChange={(e) => setReferenceFilter(e.target.value)}
                      className="px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all duration-300"
                    >
                      <option value="All">All References</option>
                      {references.map(ref => (
                        <option key={ref.id} value={ref.id}>{ref.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Results count */}
                <div className="flex items-center text-gray-600 text-sm">
                  <Filter className="w-4 h-4 mr-2" />
                  <span>
                    {filteredApplicants.length} of {applicants.length} applicants
                  </span>
                </div>
              </div>
            </div>

            {/* Applicants Table/Cards */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-20">
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Applicant</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Details</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reference</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Registrations</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredApplicants.map((applicant) => (
                      <tr key={applicant.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-gray-900">{applicant.fullName}</div>
                            <div className="text-sm text-gray-600 flex items-center mt-1">
                              <MapPin className="w-3 h-3 mr-1" />
                              {applicant.city}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {applicant.age} years, {applicant.gender}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-900">
                              <Phone className="w-3 h-3 mr-2" />
                              {applicant.phone}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="w-3 h-3 mr-2" />
                              {applicant.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">{applicant.education}</div>
                            <div className="text-xs text-gray-600 flex items-center">
                              <Briefcase className="w-3 h-3 mr-1" />
                              {applicant.currentPosition || 'Not specified'}
                            </div>
                            <div className="text-xs text-gray-600">{applicant.workingHours}</div>
                            <div className="text-xs text-gray-500">{applicant.weeklyAvailability}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <UserCheck className="w-3 h-3 mr-1 text-orange-500" />
                            <span className="text-sm font-medium text-gray-900">{applicant.reference}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {editingApplicant === applicant.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={editingSales}
                                onChange={(e) => setEditingSales(Number(e.target.value))}
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-gray-900 text-sm focus:border-orange-500 outline-none"
                                min="0"
                              />
                              <button
                                onClick={() => updateSalesCount(applicant.id, editingSales)}
                                className="text-green-600 hover:text-green-800"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingApplicant(null)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-gray-900">{applicant.salesCompleted}</span>
                              <button
                                onClick={() => {
                                  setEditingApplicant(applicant.id);
                                  setEditingSales(applicant.salesCompleted);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={applicant.status}
                            onChange={(e) => updateApplicantStatus(applicant.id, e.target.value as any)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(applicant.status)} focus:outline-none focus:ring-2 focus:ring-orange-500`}
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="In Review">In Review</option>
                            <option value="Hired">Hired</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setViewingApplicant(applicant)}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-300"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCallClick(applicant.phone)}
                              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-300"
                              title="Call applicant"
                            >
                              <Phone className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleWhatsAppClick(applicant.phone, applicant.fullName)}
                              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-300"
                              title="WhatsApp message"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(applicant.id)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-300"
                              title="Delete applicant"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View - Fixed responsive layout */}
              <div className="lg:hidden p-4">
                <div className="space-y-4">
                  {filteredApplicants.map((applicant) => (
                    <div key={applicant.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-lg truncate">{applicant.fullName}</h3>
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{applicant.city} • {applicant.age} years, {applicant.gender}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center">
                            <UserCheck className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">Ref: {applicant.reference}</span>
                          </p>
                        </div>
                        <div className="ml-3 flex-shrink-0">
                          <select
                            value={applicant.status}
                            onChange={(e) => updateApplicantStatus(applicant.id, e.target.value as any)}
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(applicant.status)} focus:outline-none min-w-0`}
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="In Review">In Review</option>
                            <option value="Hired">Hired</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2 mb-4 text-sm">
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                          <span className="font-medium text-gray-900 truncate">{applicant.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                          <span className="text-gray-600 truncate">{applicant.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                          <span className="text-gray-600 truncate">{applicant.currentPosition || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                          <span className="text-gray-600 text-xs truncate">{applicant.workingHours} • {applicant.weeklyAvailability}</span>
                        </div>
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                          <span className="text-gray-600 text-sm">Registrations: </span>
                          {editingApplicant === applicant.id ? (
                            <div className="flex items-center space-x-2 ml-2">
                              <input
                                type="number"
                                value={editingSales}
                                onChange={(e) => setEditingSales(Number(e.target.value))}
                                className="w-14 px-2 py-1 border border-gray-300 rounded text-gray-900 text-xs focus:border-orange-500 outline-none"
                                min="0"
                              />
                              <button
                                onClick={() => updateSalesCount(applicant.id, editingSales)}
                                className="text-green-600 p-1"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingApplicant(null)}
                                className="text-red-600 p-1"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2 ml-2">
                              <span className="font-semibold text-gray-900">{applicant.salesCompleted}</span>
                              <button
                                onClick={() => {
                                  setEditingApplicant(applicant.id);
                                  setEditingSales(applicant.salesCompleted);
                                }}
                                className="text-gray-400 p-1"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Fixed Mobile Action Buttons */}
                      <div className="pt-3 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex space-x-1">
                            <button
                              onClick={() => setViewingApplicant(applicant)}
                              className="flex-1 flex items-center justify-center px-2 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all duration-300 text-xs font-medium min-w-0"
                            >
                              <Eye className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">View</span>
                            </button>
                            <button
                              onClick={() => handleCallClick(applicant.phone)}
                              className="flex-1 flex items-center justify-center px-2 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all duration-300 text-xs font-medium min-w-0"
                            >
                              <Phone className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">Call</span>
                            </button>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleWhatsAppClick(applicant.phone, applicant.fullName)}
                              className="flex-1 flex items-center justify-center px-2 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all duration-300 text-xs font-medium min-w-0"
                            >
                              <MessageCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">WhatsApp</span>
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(applicant.id)}
                              className="flex items-center justify-center px-2 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-300 text-xs font-medium flex-shrink-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {filteredApplicants.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No applicants found matching your criteria</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'references' && (
          <div className="space-y-8">
            {/* Reference Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {referenceStats.map((stat) => (
                <div key={stat.name} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{stat.name}</h3>
                      <p className="text-2xl font-bold text-orange-600">{stat.count}</p>
                      <p className="text-sm text-gray-500">applicants</p>
                    </div>
                    <UserCheck className="w-8 h-8 text-orange-500" />
                  </div>
                </div>
              ))}
            </div>

            {/* Create Reference Login */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <UserPlus className="w-5 h-5 mr-2 text-orange-500" />
                  Create Reference Login
                </h3>
                <button
                  onClick={() => setShowCreateReference(!showCreateReference)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all duration-300 font-medium text-sm"
                >
                  {showCreateReference ? 'Cancel' : 'New Reference'}
                </button>
              </div>

              {showCreateReference && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={newReferenceData.name}
                        onChange={(e) => setNewReferenceData({ ...newReferenceData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        value={newReferenceData.email}
                        onChange={(e) => setNewReferenceData({ ...newReferenceData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                      <input
                        type="tel"
                        value={newReferenceData.phone}
                        onChange={(e) => setNewReferenceData({ ...newReferenceData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                      <input
                        type="password"
                        value={newReferenceData.password}
                        onChange={(e) => setNewReferenceData({ ...newReferenceData, password: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                        placeholder="Minimum 6 characters"
                        minLength={6}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={createReference}
                      disabled={creatingReference}
                      className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium flex items-center"
                    >
                      {creatingReference ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Reference Login
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Add New Reference */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Reference</h3>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newReferenceName}
                  onChange={(e) => setNewReferenceName(e.target.value)}
                  placeholder="Enter reference name"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                />
                <button
                  onClick={addReference}
                  disabled={!newReferenceName.trim()}
                  className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
                >
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Add
                </button>
              </div>
            </div>

            {/* References List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Manage References</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {references.map((reference) => (
                  <div key={reference.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <UserCheck className="w-5 h-5 text-orange-500" />
                      {editingReference === reference.id ? (
                        <input
                          type="text"
                          value={editingReferenceName}
                          onChange={(e) => setEditingReferenceName(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:border-orange-500 outline-none"
                        />
                      ) : (
                        <span className="font-medium text-gray-900">{reference.name}</span>
                      )}
                      <span className="text-sm text-gray-500">
                        ({referenceStats.find(s => s.name === reference.name)?.count || 0} applicants)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {editingReference === reference.id ? (
                        <>
                          <button
                            onClick={() => updateReference(reference.id, editingReferenceName)}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-300"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingReference(null);
                              setEditingReferenceName('');
                            }}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-300"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingReference(reference.id);
                              setEditingReferenceName(reference.name);
                            }}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-300"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteReference(reference.id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Export Button */}
      {activeTab === 'applicants' && (
        <div className="fixed bottom-5 right-5 z-50">
          <button
            onClick={exportToExcel}
            className="premium-cta-button"
          >
            <Download className="w-5 h-5 mr-2" />
            Export {referenceFilter !== 'All' ? referenceFilter : 'All'} Data
          </button>
        </div>
      )}

      {/* Applicant Detail Modal */}
      {viewingApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Applicant Details</h3>
              <button
                onClick={() => setViewingApplicant(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <p className="text-gray-900">{viewingApplicant.fullName}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{viewingApplicant.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                  <p className="text-gray-900">{viewingApplicant.phone}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Age</label>
                  <p className="text-gray-900">{viewingApplicant.age} years</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
                  <p className="text-gray-900">{viewingApplicant.gender}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Education</label>
                  <p className="text-gray-900">{viewingApplicant.education}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                  <p className="text-gray-900">{viewingApplicant.city}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Current Position</label>
                  <p className="text-gray-900">{viewingApplicant.currentPosition || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Reference</label>
                  <p className="text-gray-900">{viewingApplicant.reference}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Working Hours</label>
                  <p className="text-gray-900">{viewingApplicant.workingHours}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Weekly Availability</label>
                  <p className="text-gray-900">{viewingApplicant.weeklyAvailability}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(viewingApplicant.status)}`}>
                    {viewingApplicant.status}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Registrations</label>
                <p className="text-gray-900 font-semibold">{viewingApplicant.salesCompleted}</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Why This Role?</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{viewingApplicant.whyThisRole}</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Admin Notes</label>
                {editingApplicant === `notes-${viewingApplicant.id}` ? (
                  <div className="space-y-2">
                    <textarea
                      value={editingNotes}
                      onChange={(e) => setEditingNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                      rows={3}
                      placeholder="Add notes about this applicant..."
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateNotes(viewingApplicant.id, editingNotes)}
                        className="px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingApplicant(null);
                          setEditingNotes('');
                        }}
                        className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start space-x-2">
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg flex-1">
                      {viewingApplicant.notes || 'No notes added yet'}
                    </p>
                    <button
                      onClick={() => {
                        setEditingApplicant(`notes-${viewingApplicant.id}`);
                        setEditingNotes(viewingApplicant.notes || '');
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this applicant? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => deleteApplicant(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="px-5 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            ManaCLG LevelUp © 2025. Built with ❤️
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;
