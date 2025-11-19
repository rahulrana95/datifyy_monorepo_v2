/**
 * Datifyy App
 * Main application component with routing
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from './providers/ChakraProvider';
import { LandingPage } from './pages/LandingPage/LandingPage';
import { ThemePreview } from './pages/ThemePreview/ThemePreview';
import { ProfilePage } from './pages/ProfilePage';
import { PartnerPreferencesPage } from './pages/PartnerPreferencesPage';
import { AvailabilityPage } from './pages/AvailabilityPage';
import { AdminLogin } from './pages/Admin/Login/AdminLogin';
import { AdminAnalytics } from './pages/Admin/Analytics/AdminAnalytics';
import { AdminUsers } from './pages/Admin/Users/AdminUsers';
import { AdminProfile } from './pages/Admin/Profile/AdminProfile';
import { AdminManagement } from './pages/Admin/Admins/AdminManagement';
import { AdminGenie } from './pages/Admin/Genie/AdminGenie';
import { UserDetails } from './pages/Admin/UserDetails/UserDetails';

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/partner-preferences" element={<PartnerPreferencesPage />} />
          <Route path="/availability" element={<AvailabilityPage />} />
          <Route path="/theme-components" element={<ThemePreview />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminAnalytics />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/users/:userId" element={<UserDetails />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/admins" element={<AdminManagement />} />
          <Route path="/admin/genie" element={<AdminGenie />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
