/**
 * Login Page Component
 * Handles user authentication with kaha-main-v3 API
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Eye, EyeOff, Phone, Lock, ArrowLeft } from 'lucide-react';
import { KahaLogo } from '../components/common/KahaLogo';

export default function Login() {
  const { state, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    contactNumber: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Redirect to intended page after successful authentication
  useEffect(() => {
    if (state.authState === 'authenticated' || state.authState === 'business_selected') {
      const from = (location.state as any)?.from || '/admin';
      navigate(from, { replace: true });
    }
  }, [state.authState, navigate, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.contactNumber || !formData.password) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await login({
        contactNumber: formData.contactNumber,
        password: formData.password,
      });
      // Navigation is handled by useEffect above
    } catch (error) {
      // Error is handled by the auth context
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLanding = () => {
    navigate('/');
  };

  const isFormValid = formData.contactNumber.length > 0 && formData.password.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background Shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Back to Landing Button */}
      <button
        onClick={handleBackToLanding}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="font-medium">Back to Home</span>
      </button>

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo and Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="transform transition-all duration-500 hover:scale-110 cursor-pointer" onClick={handleBackToLanding}>
            <KahaLogo size="xl" animated className="justify-center" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-slide-up">
              Welcome Back
            </h1>
            <p className="text-gray-600 font-medium animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Sign in to your Kaha Hostel account
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95 transform transition-all duration-500 hover:shadow-3xl animate-scale-in">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center font-bold text-gray-900">Sign In</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Enter your credentials to access the hostel management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Alert */}
              {state.error && (
                <Alert variant="destructive">
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
              )}

              {/* Contact Number Field */}
              <div className="space-y-2 group">
                <label htmlFor="contactNumber" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Contact Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 transition-colors group-focus-within:text-blue-600" />
                  <Input
                    id="contactNumber"
                    name="contactNumber"
                    type="tel"
                    placeholder="Enter your contact number"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:scale-[1.01] hover:border-blue-300"
                    disabled={isSubmitting}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2 group">
                <label htmlFor="password" className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 transition-colors group-focus-within:text-blue-600" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:scale-[1.01] hover:border-blue-300"
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-all duration-200 hover:scale-110 active:scale-95"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] font-semibold text-base py-6"
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    <span>Signing In</span>
                    <span className="flex gap-1 ml-1">
                      <span className="w-1 h-1 bg-current rounded-full animate-bounce" />
                      <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>Sign In</span>
                    <span className="transform transition-transform group-hover:translate-x-1">→</span>
                  </span>
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 transform transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Demo Credentials
              </p>
              <div className="text-xs text-gray-600 space-y-2 mb-3">
                <p className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-blue-600" />
                  <strong>Contact:</strong> 9813870231
                </p>
                <p className="flex items-center gap-2">
                  <Lock className="h-3 w-3 text-blue-600" />
                  <strong>Password:</strong> ishwor19944
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-100 hover:border-blue-400 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => {
                  setFormData({
                    contactNumber: '9813870231',
                    password: 'ishwor19944',
                  });
                }}
                disabled={isSubmitting}
              >
                ✨ Use Demo Credentials
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 space-y-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="font-medium">Kaha Hostel Control Center</p>
          <p className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Secure hostel management system</span>
          </p>
          <p className="text-xs text-gray-400">© 2025 Kaha. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}