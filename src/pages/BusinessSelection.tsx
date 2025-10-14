/**
 * Business Selection Page Component
 * Allows users to select which hostel/business to manage
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Business } from '../services/authService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Loader2, Building2, MapPin, LogOut, RefreshCw, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { KahaLogo } from '../components/common/KahaLogo';

export default function BusinessSelection() {
  const { state, selectBusiness, logout, refreshBusinesses } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBusinesses, setTotalBusinesses] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);
  const itemsPerPage = 9; // 3x3 grid

  // Redirect after successful business selection
  useEffect(() => {
    if (state.authState === 'business_selected') {
      const from = (location.state as any)?.from || '/admin';
      navigate(from, { replace: true });
    }
  }, [state.authState, navigate, location.state]);

  const handleBusinessSelect = async (business: Business) => {
    setSelectedBusinessId(business.id);
    
    try {
      await selectBusiness(business);
      // Navigation is handled by useEffect above
    } catch (error) {
      console.error('Business selection error:', error);
      setSelectedBusinessId(null);
    }
  };

  const fetchBusinesses = async (search?: string, page: number = 1) => {
    setIsSearching(true);
    try {
      const result = await refreshBusinesses({
        name: search || undefined,
        page,
        take: itemsPerPage
      });
      setTotalPages(result.totalPages);
      setTotalBusinesses(result.total);
      setCurrentPage(page);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    
    // Clear previous timeout
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }
    
    // Set new timeout - wait 500ms after user stops typing
    const timeout = setTimeout(() => {
      fetchBusinesses(value, 1);
    }, 500);
    
    setSearchDebounce(timeout);
  };

  const handlePageChange = (page: number) => {
    fetchBusinesses(searchTerm, page);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchBusinesses(searchTerm, currentPage);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Initial load
  React.useEffect(() => {
    if (state.availableBusinesses.length === 0 && !state.loading) {
      fetchBusinesses();
    }
    
    // Cleanup debounce timeout on unmount
    return () => {
      if (searchDebounce) {
        clearTimeout(searchDebounce);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background Shapes */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-indigo-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      
      <div className="w-full max-w-4xl space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="transform transition-all duration-500 hover:scale-110">
            <KahaLogo size="lg" animated className="justify-center" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-slide-up">
              Select Your Hostel
            </h1>
            <p className="text-gray-600 font-medium animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Choose which hostel you want to manage
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {state.error && (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {/* Business Selection */}
        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95 transform transition-all duration-500 hover:shadow-3xl animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between pb-6">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Your Hostels</CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                {totalBusinesses > 0 ? (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    {totalBusinesses} hostel{totalBusinesses > 1 ? 's' : ''} found
                  </span>
                ) : (
                  'Select a hostel to access its management dashboard'
                )}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing || state.loading || isSearching}
                className="transition-all duration-200 hover:scale-110 hover:shadow-md active:scale-95 hover:border-blue-400 hover:text-blue-600"
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={state.loading}
                className="transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 hover:border-red-400 hover:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <div className="mb-6 group">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors group-focus-within:text-blue-600" />
                <Input
                  type="text"
                  placeholder="Search hostels by name..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:scale-[1.01] hover:border-blue-300"
                  disabled={state.loading || isSearching}
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-blue-600" />
                )}
              </div>
            </div>
            {state.loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center space-y-4 animate-fade-in">
                  <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
                    <div className="absolute inset-0 animate-ping">
                      <Loader2 className="h-12 w-12 mx-auto text-blue-400 opacity-20" />
                    </div>
                  </div>
                  <p className="text-gray-600 font-medium">Loading your hostels...</p>
                </div>
              </div>
            ) : state.availableBusinesses.length === 0 ? (
              <div className="text-center py-16 animate-fade-in">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mx-auto mb-6 flex items-center justify-center transform transition-all duration-300 hover:scale-110">
                  <Building2 className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Hostels Found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchTerm ? `No hostels match "${searchTerm}". Try a different search term.` : "You don't have access to any hostels yet."}
                </p>
                <Button 
                  variant="outline" 
                  onClick={handleRefresh}
                  className="transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {state.availableBusinesses.map((business, index) => (
                  <Card
                    key={business.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] active:scale-[0.98] animate-scale-in ${
                      selectedBusinessId === business.id
                        ? 'ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg'
                        : 'hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50'
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => handleBusinessSelect(business)}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Business Avatar */}
                        <div className="flex items-center justify-center">
                          <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center transform transition-all duration-300 hover:scale-110 hover:rotate-6 shadow-md">
                            {business.avatar ? (
                              <img
                                src={business.avatar}
                                alt={business.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <Building2 className={`h-10 w-10 text-blue-600 ${business.avatar ? 'hidden' : ''}`} />
                          </div>
                        </div>

                        {/* Business Info */}
                        <div className="text-center space-y-3">
                          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 min-h-[3.5rem] flex items-center justify-center">
                            {business.name}
                          </h3>
                          
                          <div className="flex items-center justify-center text-sm text-gray-600 gap-1">
                            <MapPin className="h-4 w-4 flex-shrink-0 text-blue-600" />
                            <span className="truncate">{business.address}</span>
                          </div>

                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                            ID: {business.kahaId}
                          </Badge>
                        </div>

                        {/* Selection Button */}
                        <Button
                          className={`w-full transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] font-semibold ${
                            selectedBusinessId === business.id 
                              ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                          }`}
                          disabled={selectedBusinessId === business.id}
                          variant={selectedBusinessId === business.id ? "secondary" : "default"}
                        >
                          {selectedBusinessId === business.id ? (
                            <span className="flex items-center justify-center">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              <span>Selecting</span>
                              <span className="flex gap-1 ml-1">
                                <span className="w-1 h-1 bg-current rounded-full animate-bounce" />
                                <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                              </span>
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <span>Select Hostel</span>
                              <span className="transform transition-transform group-hover:translate-x-1">→</span>
                            </span>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !state.loading && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 animate-fade-in">
                <div className="text-sm font-medium text-gray-600">
                  Page <span className="text-blue-600 font-bold">{currentPage}</span> of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isSearching}
                    className="transition-all duration-200 hover:scale-110 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={isSearching}
                          className={`w-10 h-10 p-0 transition-all duration-200 hover:scale-110 active:scale-95 ${
                            currentPage === pageNum 
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md' 
                              : 'hover:border-blue-400 hover:text-blue-600'
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isSearching}
                    className="transition-all duration-200 hover:scale-110 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 space-y-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="font-medium">Kaha Hostel Control Center</p>
          <p className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Multi-hostel management system</span>
          </p>
          <p className="text-xs text-gray-400">© 2025 Kaha. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}