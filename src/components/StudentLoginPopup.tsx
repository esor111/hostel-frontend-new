import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserCircle, Lock, LogIn } from 'lucide-react';

interface StudentLoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
  hostelId?: string;
}

export function StudentLoginPopup({ isOpen, onClose, onSuccess, hostelId }: StudentLoginPopupProps) {
  const [contactNumber, setContactNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactNumber || !password) {
      setError('Please enter both contact number and password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call Kaha Main API login endpoint
      const response = await fetch('https://dev.kaha.com.np/main/api/v3/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactNumber,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Login failed. Please check your credentials.');
      }

      const data = await response.json();
      
      // Store student token
      localStorage.setItem('kaha_student_token', data.accessToken);
      
      // Store hostelId if provided
      if (hostelId) {
        localStorage.setItem('kaha_student_hostel_id', hostelId);
      }

      console.log('✅ Student login successful');
      
      // Call success callback
      onSuccess(data.accessToken);
      
      // Reset form
      setContactNumber('');
      setPassword('');
      setError(null);
      
      // Close popup
      onClose();
    } catch (err) {
      console.error('❌ Student login failed:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setContactNumber('');
      setPassword('');
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <UserCircle className="h-6 w-6 text-blue-600" />
            Student Login
          </DialogTitle>
          <DialogDescription className="text-center">
            Enter your credentials to access check-in/checkout
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Contact Number */}
          <div className="space-y-2">
            <Label htmlFor="contactNumber" className="flex items-center gap-2">
              <UserCircle className="h-4 w-4" />
              Contact Number
            </Label>
            <Input
              id="contactNumber"
              type="text"
              placeholder="Enter your contact number"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              disabled={isLoading}
              className="w-full"
              autoComplete="tel"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full"
              autoComplete="current-password"
            />
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !contactNumber || !password}
              className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Use the same credentials you use for the Kaha app</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
