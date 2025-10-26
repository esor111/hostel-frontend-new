import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Building2,
  LogOut,
  RefreshCw,
  User,
  MapPin,
  Clock,
  Shield,
  Settings as SettingsIcon
} from 'lucide-react';
import { toast } from 'sonner';

export const Settings = () => {
  const { state, logout, clearBusinessSelection } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
      setIsLoggingOut(false);
    }
  };

  const handleSwitchBusiness = () => {
    clearBusinessSelection();
    toast.info('Switching to business selection...');
  };

  if (!state.selectedBusiness) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No business selected</p>
        </div>
      </div>
    );
  }

  const business = state.selectedBusiness;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <SettingsIcon className="h-6 w-6" />
            Settings
          </h2>
          <p className="text-gray-600 mt-1">Manage your account and business settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Information Card */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Current Business
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              {/* Business Avatar */}
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
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

              {/* Business Details */}
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{business.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {business.kahaId}
                    </Badge>
                  </div>
                </div>

                {/* Business Info */}
                <div className="text-sm">
                  {business.address && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{business.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>
                  {state.businessToken ? 'Business Token Active' : 'User Token Active'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Last login: {new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <Button
                onClick={handleSwitchBusiness}
                variant="outline"
                className="w-full justify-start"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Switch Hostel
              </Button>
              
              <Button
                onClick={handleLogout}
                disabled={isLoggingOut}
                variant="destructive"
                className="w-full justify-start"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Platform:</span>
                <span className="font-medium">Kaha Control Center</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Version:</span>
                <span className="font-medium">v2.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-green-600">Online</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};