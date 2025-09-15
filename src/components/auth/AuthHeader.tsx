/**
 * Authentication Header Component
 * Shows current business and provides logout/switch options
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Building2, ChevronDown, LogOut, RefreshCw, User } from 'lucide-react';

export default function AuthHeader() {
  const { state, logout, clearBusinessSelection } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    logout();
  };

  const handleSwitchBusiness = () => {
    clearBusinessSelection();
  };

  if (!state.selectedBusiness) {
    return null;
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Current Business Info */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {state.selectedBusiness.avatar ? (
              <img
                src={state.selectedBusiness.avatar}
                alt={state.selectedBusiness.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <Building2 className={`h-4 w-4 text-gray-400 ${state.selectedBusiness.avatar ? 'hidden' : ''}`} />
          </div>
          
          <div>
            <h2 className="font-semibold text-gray-900">{state.selectedBusiness.name}</h2>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {state.selectedBusiness.kahaId}
              </Badge>
              <span className="text-xs text-gray-500">
                {state.selectedBusiness.address}
              </span>
            </div>
          </div>
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Account</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">Authenticated</p>
              <p className="text-xs text-gray-500">
                {state.businessToken ? 'Business Token Active' : 'User Token Active'}
              </p>
            </div>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={handleSwitchBusiness}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Switch Hostel
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}