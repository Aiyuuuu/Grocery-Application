import { useSelector } from 'react-redux';
import { selectAuthUser } from '../store/selectors';
import UnauthorizedAdmin from '../pages/AdminDashboardPage/components/UnauthorizedAdmin';

export default function AdminAccessRoute({ children }) {
  const user = useSelector(selectAuthUser);

  if (!user || String(user.role || '').toLowerCase() !== 'admin') {
    return <UnauthorizedAdmin />;
  }

  return children;
}
