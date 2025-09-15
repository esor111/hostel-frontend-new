/**
 * Business Selection Page Component
 * Allows users to select which hostel/business to manage
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Business } from '../services/authService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Loader2, Building2, MapPin, LogOut, RefreshCw } from 'lucide-react';
import { KahaLogo } from '../components/common/KahaLogo';

export default function BusinessSelection() {
  const { state, selectBusiness, logout, refreshBusinesses } = useAuth();
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleBusinessSelect = async (business: Business) => {
    setSelectedBusinessId(business.id);
    
    try {
      await selectBusiness(business);
    } catch (error) {
      console.error('Business selection error:', error);
      setSelectedBusinessId(null);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshBusinesses();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <KahaLogo size="lg" animated className="justify-center" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Select Your Hostel</h1>
            <p className="text-gray-600 mt-2">Choose which hostel you want to manage</p>
          </div>
        </div>

        {/* Error Alert */}
        {state.error && (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {/* Business Selection */}
        <Card className="shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Your Hostels</CardTitle>
              <CardDescription>
                Select a hostel to access its management dashboard
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing || state.loading}
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
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {state.loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                  <p className="text-gray-600">Loading your hostels...</p>
                </div>
              </div>
            ) : state.availableBusinesses.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Hostels Found</h3>
                <p className="text-gray-600 mb-4">
                  You don't have access to any hostels yet.
                </p>
                <Button variant="outline" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {state.availableBusinesses.map((business) => (
                  <Card
                    key={business.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedBusinessId === business.id
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleBusinessSelect(business)}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Business Avatar */}
                        <div className="flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
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
                            <Building2 className={`h-8 w-8 text-gray-400 ${business.avatar ? 'hidden' : ''}`} />
                          </div>
                        </div>

                        {/* Business Info */}
                        <div className="text-center space-y-2">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {business.name}
                          </h3>
                          
                          <div className="flex items-center justify-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span className="truncate">{business.address}</span>
                          </div>

                          <Badge variant="secondary" className="text-xs">
                            ID: {business.kahaId}
                          </Badge>
                        </div>

                        {/* Selection Button */}
                        <Button
                          className="w-full"
                          disabled={selectedBusinessId === business.id}
                          variant={selectedBusinessId === business.id ? "secondary" : "default"}
                        >
                          {selectedBusinessId === business.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Selecting...
                            </>
                          ) : (
                            'Select Hostel'
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Kaha Hostel Control Center</p>
          <p className="mt-1">Multi-hostel management system</p>
        </div>
      </div>
    </div>
  );
}