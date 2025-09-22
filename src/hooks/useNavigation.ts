
import { useNavigate } from 'react-router-dom';

export function useNavigation() {
  const navigate = useNavigate();

  const goToStudentLedger = (studentId: string) => {
    navigate(`/ledger?section=ledger&student=${studentId}`);
  };

  const goToStudentProfile = (studentId: string) => {
    navigate(`/ledger?section=students&student=${studentId}`);
  };

  const goToInvoices = (studentId?: string) => {
    const params = studentId ? `&student=${studentId}` : '';
    navigate(`/ledger?section=invoices${params}`);
  };

  const goToPayments = (studentId?: string) => {
    const params = studentId ? `&student=${studentId}` : '';
    navigate(`/ledger?section=payments${params}`);
  };

  const goToBookings = () => {
    navigate('/bookings');
  };

  const goToLedger = (section: string = 'dashboard') => {
    navigate(`/ledger?section=${section}`);
  };

  const navigateTo = (path: string) => {
    navigate(path);
  };

  return {
    goToStudentLedger,
    goToStudentProfile,
    goToInvoices,
    goToPayments,
    goToBookings,
    goToLedger,
    navigateTo
  };
}
