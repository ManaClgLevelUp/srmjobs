import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { LogOut, Users, Target, CheckCircle, TrendingUp, Phone, MessageCircle, Eye, Download, Search, Filter, ChevronLeft, ChevronRight, XCircle, User, Briefcase, Heart } from 'lucide-react';
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
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [viewingApplication, setViewingApplication] = useState<Application | null>(null);

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
    return `https://wa.me/91${phone.replace(/\D/g, '')}?text=${message}`;
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

  // Add function to handle registration toggle
  const handleRegistrationToggle = async (applicationId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'applicants', applicationId), {
        registrationCompleted: !currentStatus
      });
      
      // Update local state
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, registrationCompleted: !currentStatus } : app
      ));

      toast({
        title: "Registration Status Updated",
        description: `Registration marked as ${!currentStatus ? 'completed' : 'incomplete'}`,
      });
    } catch (error) {
      console.error('Error updating registration status:', error);
      toast({
        title: "Error",
        description: "Failed to update registration status",
        variant: "destructive"
      });
    }
  };

  // Add application details modal
  const ApplicationDetailsModal = ({ application }: { application: Application }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Application Details</h3>
          <button
            onClick={() => {
              setIsViewingDetails(false);
              setSelectedApplication(null);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Full Name</label>
              <p className="text-gray-900 font-medium">{selectedApplication.fullName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{selectedApplication.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <p className="text-gray-900">{selectedApplication.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">City</label>
              <p className="text-gray-900">{selectedApplication.city}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Age</label>
              <p className="text-gray-900">{selectedApplication.age}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Gender</label>
              <p className="text-gray-900">{selectedApplication.gender}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Education</label>
              <p className="text-gray-900">{selectedApplication.education}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Current Position</label>
              <p className="text-gray-900">{selectedApplication.currentPosition}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Working Hours</label>
              <p className="text-gray-900">{selectedApplication.workingHours}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Why This Role?</label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg mt-1">{selectedApplication.whyThisRole}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Replace the mobile view section with this updated version
  const renderMobileView = () => (
    <div className="lg:hidden space-y-4 p-4">
      {paginatedApplications.map((application) => (
        <div key={application.id} className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex justify-between items-start mb-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-gray-900 truncate">{application.fullName}</h3>
              <p className="text-sm text-gray-600 truncate">{application.email}</p>
            </div>
            <div className="flex-shrink-0 ml-2">
              <div className="inline-flex px-2 py-1 rounded-full text-xs font-medium border-0 outline-none truncate whitespace-nowrap max-w-[80px] overflow-hidden overflow-ellipsis"
                style={{
                  backgroundColor: application.status === 'New' ? '#EFF6FF' : 
                                  application.status === 'Hired' ? '#ECFDF5' : 
                                  application.status === 'Rejected' ? '#FEF2F2' : 
                                  application.status === 'Interview Scheduled' ? '#F5F3FF' : '#FEF3C7',
                  color: application.status === 'New' ? '#2563EB' : 
                        application.status === 'Hired' ? '#059669' : 
                        application.status === 'Rejected' ? '#DC2626' : 
                        application.status === 'Interview Scheduled' ? '#7C3AED' : '#D97706'
                }}
              >
                {application.status || 'New'}
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-3 mt-2">
            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div>
                <span className="text-gray-500">Phone:</span>
                <p className="font-medium truncate">{application.phone}</p>
              </div>
              <div>
                <span className="text-gray-500">City:</span>
                <p className="font-medium truncate">{application.city}</p>
              </div>
              <div>
                <span className="text-gray-500">Age:</span>
                <p className="font-medium">{application.age}</p>
              </div>
              <div>
                <span className="text-gray-500">Education:</span>
                <p className="font-medium truncate">{application.education}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-500">Registration:</span>
                {application.registrationCompleted ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <div className="w-4 h-4 border border-gray-300 rounded-full"></div>
                )}
              </div>
              <select
                value={application.status || 'New'}
                onChange={(e) => handleStatusUpdate(application.id, e.target.value)}
                className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 max-w-[110px]"
              >
                {STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-4">
            <a
              href={getWhatsAppLink(application.phone, application.fullName)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex justify-center items-center py-2 bg-green-50 text-green-600 rounded-lg text-xs font-medium"
            >
              <MessageCircle className="w-3 h-3 mr-1" />
              WhatsApp
            </a>
            <a
              href={getCallLink(application.phone)}
              className="flex justify-center items-center py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium"
            >
              <Phone className="w-3 h-3 mr-1" />
              Call
            </a>
            <button
              onClick={() => setViewingApplication(application)}
              className="flex justify-center items-center py-2 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium"
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center overflow-hidden">
              <img 
                src="https://res.cloudinary.com/dvmrhs2ek/image/upload/v1750141579/qkehxe09cunkcvyh8o1i.jpg"
                alt="ManaCLG LevelUp"
                className="h-10 w-auto flex-shrink-0"
              />
              <div className="ml-4 min-w-0">
                <h1 className="text-lg font-semibold text-gray-900 truncate">Reference Dashboard</h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">Welcome, {referenceData?.name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors flex-shrink-0"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Widgets */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">This Month</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{thisMonthApplications.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Hired</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{qualifiedCandidates.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Registrations</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{completedRegistrations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Target Achieved</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{targetAchieved.toFixed(1)}%</p>
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
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative w-full sm:w-auto">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                      className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Excel</span>
                </button>
              </div>
            </div>

            {/* Desktop View: Applications Table */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border overflow-hidden">
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
                          <div className="max-w-[120px]">
                            <select
                              value={app.status || 'New'}
                              onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                              className={`px-2 py-1 rounded-full text-xs sm:text-sm font-medium border-0 outline-none truncate ${
                                STATUS_COLORS[app.status as keyof typeof STATUS_COLORS] || STATUS_COLORS['New']
                              }`}
                            >
                              {STATUS_OPTIONS.map(status => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1 sm:space-x-2">
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
                              onClick={() => setViewingApplication(app)}
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
            
            {/* Mobile View: Application Cards */}
            <div className="md:hidden space-y-4">
              {paginatedApplications.map((app) => (
                <div key={app.id} className="bg-white p-4 rounded-xl shadow-sm border">
                  <div className="flex justify-between items-start mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900 truncate">{app.fullName}</h3>
                      <p className="text-sm text-gray-600 truncate">{app.email}</p>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      <div className="inline-flex px-2 py-1 rounded-full text-xs font-medium border-0 outline-none truncate whitespace-nowrap max-w-[80px] overflow-hidden overflow-ellipsis"
                        style={{
                          backgroundColor: app.status === 'New' ? '#EFF6FF' : 
                                          app.status === 'Hired' ? '#ECFDF5' : 
                                          app.status === 'Rejected' ? '#FEF2F2' : 
                                          app.status === 'Interview Scheduled' ? '#F5F3FF' : '#FEF3C7',
                          color: app.status === 'New' ? '#2563EB' : 
                                app.status === 'Hired' ? '#059669' : 
                                app.status === 'Rejected' ? '#DC2626' : 
                                app.status === 'Interview Scheduled' ? '#7C3AED' : '#D97706'
                        }}
                      >
                        {app.status || 'New'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-3 mt-2">
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">Phone:</span>
                        <p className="font-medium truncate">{app.phone}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">City:</span>
                        <p className="font-medium truncate">{app.city}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Age:</span>
                        <p className="font-medium">{app.age}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Education:</span>
                        <p className="font-medium truncate">{app.education}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-gray-500">Registration:</span>
                        {app.registrationCompleted ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <div className="w-4 h-4 border border-gray-300 rounded-full"></div>
                        )}
                      </div>
                      <select
                        value={app.status || 'New'}
                        onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                        className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 max-w-[110px]"
                      >
                        {STATUS_OPTIONS.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <a
                      href={getWhatsAppLink(app.phone, app.fullName)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex justify-center items-center py-2 bg-green-50 text-green-600 rounded-lg text-xs font-medium"
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      WhatsApp
                    </a>
                    <a
                      href={getCallLink(app.phone)}
                      className="flex justify-center items-center py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium"
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      Call
                    </a>
                    <button
                      onClick={() => setViewingApplication(app)}
                      className="flex justify-center items-center py-2 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </button>
                  </div>
                </div>
              ))}
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
          </>
        )}
      </div>

      {/* Application Details Modal */}
      {isViewingDetails && selectedApplication && (
        <ApplicationDetailsModal application={selectedApplication} />
      )}

      {/* Application Detail Modal */}
      {viewingApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-lg p-5 max-w-lg w-full max-h-[90vh] overflow-y-auto m-2">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-lg font-bold text-gray-900">Application Details</h3>
              <button
                onClick={() => setViewingApplication(null)}
                className="p-1 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            {/* Personal Information */}
            <div className="space-y-4 mb-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <User className="w-4 h-4 mr-1 text-gray-500" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 gap-2 pl-1">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Full Name</span>
                    <span className="font-medium text-gray-900">{viewingApplication.fullName}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Email</span>
                    <span className="font-medium text-gray-900 break-all">{viewingApplication.email}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Phone</span>
                    <span className="font-medium text-gray-900">{viewingApplication.phone}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Age & Gender</span>
                    <span className="font-medium text-gray-900">{viewingApplication.age} years, {viewingApplication.gender}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">City</span>
                    <span className="font-medium text-gray-900">{viewingApplication.city}</span>
                  </div>
                </div>
              </div>
              
              {/* Professional Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Briefcase className="w-4 h-4 mr-1 text-gray-500" />
                  Professional Information
                </h4>
                <div className="grid grid-cols-1 gap-2 pl-1">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Education</span>
                    <span className="font-medium text-gray-900">{viewingApplication.education}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Current Position</span>
                    <span className="font-medium text-gray-900">{viewingApplication.currentPosition}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Working Hours</span>
                    <span className="font-medium text-gray-900">{viewingApplication.workingHours}</span>
                  </div>
                </div>
              </div>
              
              {/* Application Status */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1 text-gray-500" />
                  Application Status
                </h4>
                <div className="grid grid-cols-2 gap-2 pl-1">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Status</span>
                    <select
                      value={viewingApplication.status || 'New'}
                      onChange={(e) => handleStatusUpdate(viewingApplication.id, e.target.value)}
                      className="mt-1 px-2 py-1 rounded text-sm font-medium border max-w-[150px]"
                    >
                      {STATUS_OPTIONS.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Registration Completed</span>
                    <span className="font-medium text-gray-900">
                      {viewingApplication.registrationCompleted ? 
                        <span className="text-green-600">Yes</span> : 
                        <span className="text-red-600">No</span>
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Why This Role */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <Heart className="w-4 h-4 mr-1 text-gray-500" />
                Why This Role
              </h4>
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <p className="text-gray-700 whitespace-pre-wrap">{viewingApplication.whyThisRole}</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-2 mt-5 pt-3 border-t border-gray-100">
              <a
                href={getWhatsAppLink(viewingApplication.phone, viewingApplication.fullName)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex justify-center items-center py-2 bg-green-600 text-white rounded-lg text-sm font-medium"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                WhatsApp
              </a>
              <a
                href={getCallLink(viewingApplication.phone)}
                className="flex-1 flex justify-center items-center py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
              >
                <Phone className="w-4 h-4 mr-1" />
                Call
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferenceDashboard;
