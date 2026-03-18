import { useAuth } from '@/lib/authContext';
import LoginPage from '@/components/LoginPage';
import UserDashboard from '@/components/UserDashboard';
import AdminDashboard from '@/components/AdminDashboard';

const Index = () => {
  const { user } = useAuth();

  if (!user) return <LoginPage />;
  if (user.role === 'admin' || user.role === 'staff') return <AdminDashboard />;
  return <UserDashboard />;
};

export default Index;
