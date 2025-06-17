
import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { LogOut, Users, Target, CheckCircle, TrendingUp, Phone, MessageCircle, Eye, Download, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';

interface Application {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  age: string;
  gender: string;
  education: string;
  currentPosition: string;
  workingHours: string;
  whyThisRole: string;
  status: string;
  registrationCompleted: boolean;
  createdAt: any;
  referenceId?: string;
  referenceName?: string;
}

interface ReferenceData {
  name: string;
  email: string;
  target: number;
}

const STATUS_OPTIONS = [
  'New',
  'Applied', 
  'Shortlisted',
  'Interview Scheduled',
  'Hired',
  'Rejected'
];

const STATUS_COLORS = {
  'New': 'bg-gray-100 text-gray-800',
  'Applied': 'bg-blue-100 text-blue-800',
  'Shortlisted': 'bg-yellow-100 text-yellow-800',
  'Interview Scheduled': 'bg-purple-100 text-purple-800',
  'Hired': 'bg-green-100 text-green-800',
  'Rejected': 'bg-red-100 text-red-800'
};

const ReferenceDashboard = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchReferenceData();
  }, []);

  useEffect(() => {
    if (referenceData) {
      fetchApplications();
    }
  }, [referenceData]);

  const fetchReferenceData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const refDoc = await getDoc(doc(db, 'references', user.uid));
        if (refDoc.exists()) {
          setReferenceData(refDoc.data() as ReferenceData);
        }
      }
    } catch (error) {
      console.error('Error fetching reference data:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const q = query(
          collection(db, 'applicants'),
          where('referenceId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const apps: Application[] = [];
        querySnapshot.forEach((doc) => {
          apps.push({ id: doc.id, ...doc.data() } as Application);
        });
        
        apps.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return b.createdAt.toDate() - a.createdAt.toDate();
          }
          return 0;
        });
        
        setApplications(apps);
        console.log(`Fetched ${apps.length} applications for reference ${user.uid}`);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to load applications. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'applicants', applicationId), {
        status: newStatus
      });
      
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
      
      toast({
        title: "Status Updated",
        description: `Application status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getWhatsAppLink = (phone: string, name: string) => {
    const message = encodeURIComponent(`Hi ${name}, I'm reaching out regarding your application with ManaCLG LevelUp. Let's discuss the next steps!`);
    return `https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`;
  };

  const getCallLink = (phone: string) => {
    return `tel:${phone}`;
  };

  const exportToExcel = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'City', 'Age', 'Education', 'Status', 'Registration', 'Date'].join(','),
      ...filteredApplications.map(app => [
        app.fullName,
        app.email,
        app.phone,
        app.city,
        app.age,
        app.education,
        app.status || 'New',
        app.registrationCompleted ? 'Yes' : 'No',
        app.createdAt ? new Date(app.createdAt.toDate()).toLocaleDateString() : 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${referenceData?.name || 'Reference'}_Applications.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'All' || (app.status || 'New') === statusFilter;
    const matchesCity = cityFilter === 'All' || app.city === cityFilter;
    return matchesSearch && matchesStatus && matchesCity;
  });

  // Pagination
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + itemsPerPage);

  const thisMonthApplications = applications.filter(app => {
    if (!app.createdAt) return false;
    const appDate = new Date(app.createdAt.toDate());
    const now = new Date();
    return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
  });

  const qualifiedCandidates = applications.filter(app => app.status === 'Hired');
  const completedRegistrations = applications.filter(app => app.registrationCompleted);
  const targetAchieved = referenceData?.target ? (completedRegistrations.length / referenceData.target * 100) : 0;

  const uniqueCities = [...new Set(applications.map(app => app.city).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src="https://res.cloudinary.com/dvmrhs2ek/image/upload/v1750141579/qkehxe09cunkcvyh8o1i.jpg"
                alt="ManaCLG LevelUp"
                className="h-10 w-auto"
              />
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">Reference Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome, {referenceData?.name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{thisMonthApplications.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hired</p>
                <p className="text-2xl font-bold text-gray-900">{qualifiedCandidates.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Registrations</p>
                <p className="text-2xl font-bold text-gray-900">{completedRegistrations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Target Achieved</p>
                <p className="text-2xl font-bold text-gray-900">{targetAchieved.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <div className="flex flex-col items-center">
              <Users className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Applications Found Yet</h3>
              <p className="text-gray-500 max-w-md">
                You haven't received any applications yet. Once candidates apply through your reference, they will appear here.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="All">All Status</option>
                    {STATUS_OPTIONS.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>

                  {uniqueCities.length > 0 && (
                    <select
                      value={cityFilter}
                      onChange={(e) => setCityFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="All">All Cities</option>
                      {uniqueCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  )}
                </div>

                <button
                  onClick={exportToExcel}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Excel</span>
                </button>
              </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Registration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedApplications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{app.fullName}</p>
                            <p className="text-sm text-gray-600">{app.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{app.phone}</p>
                            <p className="text-sm text-gray-600">{app.city}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p><span className="font-medium">Age:</span> {app.age}</p>
                            <p><span className="font-medium">Education:</span> {app.education}</p>
                            <p><span className="font-medium">Position:</span> {app.currentPosition}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {app.referenceName}
                          </span>
                        </TableCell>
                        <TableCell>
                          {app.registrationCompleted ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                          )}
                        </TableCell>
                        <TableCell>
                          <select
                            value={app.status || 'New'}
                            onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                            className={`px-2 py-1 rounded-full text-sm font-medium border-0 outline-none ${
                              STATUS_COLORS[app.status as keyof typeof STATUS_COLORS] || STATUS_COLORS['New']
                            }`}
                          >
                            {STATUS_OPTIONS.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <a
                              href={getWhatsAppLink(app.phone, app.fullName)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title="WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                            <a
                              href={getCallLink(app.phone)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Call"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                            <button
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredApplications.length)} of {filteredApplications.length} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReferenceDashboard;
