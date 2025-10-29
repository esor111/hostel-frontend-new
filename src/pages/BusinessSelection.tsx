/**
 * Business Selection Page Component
 * Allows users to select which hostel/business to manage
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Business } from '../services/authService';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Loader2, Building2, MapPin, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function BusinessSelection() {
  const { state, selectBusiness, refreshBusinesses } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBusinesses, setTotalBusinesses] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);
  const itemsPerPage = 15; // 5x3 grid for better space utilization

  // Redirect after successful business selection
  useEffect(() => {
    if (state.authState === 'business_selected') {
      // Redirect to Student Management section instead of admin dashboard
      const from = (location.state as any)?.from || '/ledger?section=student-management';
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
    <div className="min-h-screen kaha-bg-brand relative overflow-hidden">
      {/* Enhanced Animated Background Shapes */}
      <div className="absolute top-10 right-5 w-80 h-80 bg-green-400/15 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 left-5 w-96 h-96 bg-blue-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Search Bar at Top */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6">
        <div className="relative max-w-lg mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-green-600" />
          <Input
            type="text"
            placeholder="Search hostels by name..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-12 pr-12 h-14 text-base border-2 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:scale-[1.02] hover:border-green-300 shadow-sm bg-white/95 backdrop-blur-sm"
            disabled={state.loading || isSearching}
          />
          {isSearching && (
            <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 animate-spin text-green-600" />
          )}
        </div>
      </div>

      {/* Main Container with Full Width */}
      <div className="px-6 py-8 min-h-screen flex flex-col justify-center relative z-10 pt-24">
        <div className="w-full space-y-8">
          {/* Error Alert */}
          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {/* Business Selection Content */}
            {state.loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center space-y-6 animate-fade-in">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                      <Loader2 className="h-10 w-10 animate-spin text-green-600" />
                    </div>
                    <div className="absolute inset-0 animate-ping opacity-30">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-200 to-blue-200 rounded-2xl mx-auto"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-700 font-semibold text-lg">Loading your hostels...</p>
                    <p className="text-gray-500 text-sm">Please wait while we fetch your data</p>
                  </div>
                </div>
              </div>
            ) : state.availableBusinesses.length === 0 ? (
              <div className="text-center py-20 animate-fade-in">
                <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-blue-100 rounded-3xl mx-auto mb-8 flex items-center justify-center transform transition-all duration-300 hover:scale-110 shadow-xl">
                  <Building2 className="h-16 w-16 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Hostels Found</h3>
                <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg leading-relaxed">
                  {searchTerm ? (
                    <>No hostels match <span className="font-semibold text-green-600">"{searchTerm}"</span>. Try a different search term.</>
                  ) : (
                    "You don't have access to any hostels yet. Contact your administrator for access."
                  )}
                </p>
                <Button
                  onClick={() => fetchBusinesses(searchTerm, currentPage)}
                  className="kaha-button-primary px-8 py-3 text-base"
                >
                  <Building2 className="h-5 w-5 mr-3" />
                  Refresh Hostels
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {state.availableBusinesses.map((business, index) => (
                    <Card
                      key={business.id}
                      className={`group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-3 hover:scale-[1.03] active:scale-[0.97] animate-scale-in rounded-2xl border-2 ${selectedBusinessId === business.id
                          ? 'ring-4 ring-green-400 bg-gradient-to-br from-green-50 to-blue-50 shadow-2xl border-green-300'
                          : 'hover:bg-gradient-to-br hover:from-green-50/50 hover:to-blue-50/50 border-gray-200 hover:border-green-300'
                        }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => handleBusinessSelect(business)}
                    >
                      <CardContent className="p-8">
                        <div className="space-y-6">
                          {/* Enhanced Business Avatar */}
                          <div className="flex items-center justify-center">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg ring-4 ring-white">
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
                              <Building2 className={`h-12 w-12 text-green-600 ${business.avatar ? 'hidden' : ''}`} />
                            </div>
                          </div>

                          {/* Enhanced Business Info */}
                          <div className="text-center space-y-4">
                            <h3 className="font-bold text-xl text-gray-900 line-clamp-2 min-h-[3rem] flex items-center justify-center leading-tight">
                              {business.name}
                            </h3>

                            <div className="flex items-center justify-center text-sm text-gray-600 gap-2 bg-gray-50 rounded-lg p-2">
                              <MapPin className="h-4 w-4 flex-shrink-0 text-green-600" />
                              <span className="truncate font-medium">{business.address}</span>
                            </div>

                            <Badge variant="secondary" className="text-sm bg-green-100 text-green-700 hover:bg-green-200 transition-colors px-3 py-1 font-semibold">
                              ID: {business.kahaId}
                            </Badge>
                          </div>

                          {/* Enhanced Selection Button */}
                          <Button
                            className={`w-full h-12 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] font-bold text-base rounded-xl ${selectedBusinessId === business.id
                                ? 'kaha-button-primary opacity-75 cursor-not-allowed'
                                : 'kaha-button-primary'
                              }`}
                            disabled={selectedBusinessId === business.id}
                          >
                            {selectedBusinessId === business.id ? (
                              <span className="flex items-center justify-center">
                                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                <span>Connecting</span>
                                <span className="flex gap-1 ml-2">
                                  <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" />
                                  <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                  <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                </span>
                              </span>
                            ) : (
                              <span className="flex items-center justify-center gap-3 group">
                                <span>Manage Hostel</span>
                                <span className="transform transition-transform group-hover:translate-x-1 text-lg">→</span>
                              </span>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                ))}
              </div>
            )}

            {/* Enhanced Pagination */}
            {totalPages > 1 && !state.loading && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-8 border-t-2 border-gray-100 animate-fade-in gap-4">
                <div className="text-base font-semibold text-gray-700 bg-gray-50 px-4 py-2 rounded-lg">
                  Page <span className="text-green-600 font-bold text-lg">{currentPage}</span> of <span className="font-bold">{totalPages}</span>
                  <span className="text-sm text-gray-500 ml-2">({totalBusinesses} total hostels)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isSearching}
                    className="transition-all duration-200 hover:scale-110 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border-2 font-semibold px-6"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum: number;
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
                          onClick={() => handlePageChange(pageNum)}
                          disabled={isSearching}
                          className={`w-12 h-12 p-0 transition-all duration-200 hover:scale-110 active:scale-95 font-bold text-base ${currentPage === pageNum
                              ? 'kaha-button-primary shadow-lg'
                              : 'hover:border-green-400 hover:text-green-600 border-2'
                            }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isSearching}
                    className="transition-all duration-200 hover:scale-110 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border-2 font-semibold px-6"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}