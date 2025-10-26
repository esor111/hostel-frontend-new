

import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Shield, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const HostelProfile = () => {
  const { state } = useAuth();


  return (
    <MainLayout activeTab="profile">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">🏢 Hostel Profile</h2>
            <p className="text-gray-600 mt-1">View your hostel information (read-only)</p>
          </div>
          <div className="flex gap-2">
            <Button 
              className="bg-gradient-to-r from-[#07A64F] to-[#1295D0] hover:from-[#06954A] hover:to-[#1185C0] text-white"
              onClick={() => window.open('https://kaha.com.np/app', '_blank')}
            >
              📱 Download Kaha App to Edit
            </Button>
          </div>
        </div>

        {/* Current Business Information */}
        {state.selectedBusiness && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Current Business</h3>
                  <p className="text-white/80 text-sm">Active business profile from Kaha platform</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                {/* Business Avatar */}
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0 border-4 border-white shadow-lg">
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
                  <Building2 className={`h-10 w-10 text-gray-400 ${state.selectedBusiness.avatar ? 'hidden' : ''}`} />
                </div>

                {/* Business Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{state.selectedBusiness.name}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="secondary" className="text-sm font-medium">
                        ID: {state.selectedBusiness.kahaId}
                      </Badge>
                      <Badge variant="outline" className="text-sm">
                        Kaha Platform
                      </Badge>
                    </div>
                  </div>

                  {/* Business Address */}
                  {state.selectedBusiness.address && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <MapPin className="h-5 w-5 text-blue-500" />
                      <span className="text-lg">{state.selectedBusiness.address}</span>
                    </div>
                  )}

                  {/* Status Indicators */}
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-600">Active Business</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-600">
                        {state.businessToken ? 'Business Token Active' : 'User Token Active'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}




      </div>
    </MainLayout>
  );
};

export default HostelProfile;
