/**
 * Landing Page
 * Main landing page for Datifyy dating platform
 */

import { Box } from '@chakra-ui/react';
import { useState } from 'react';
import { Header } from '../../shared/components/Header/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { ProfileCards } from './components/ProfileCards';
import { HowItWorks } from './components/HowItWorks';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';
import { LoginModal } from '../../components/auth/LoginModal';
import { SignupModal } from '../../components/auth/SignupModal';
import { ForgotPasswordModal } from '../../components/auth/ForgotPasswordModal';

type ModalType = 'login' | 'signup' | 'forgotPassword' | null;

export const LandingPage = () => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const handleAuthSuccess = () => {
    setActiveModal(null);
    // TODO: Redirect to dashboard (tokens are managed by Zustand store)
    console.log('Authentication successful');
  };

  const handleGetStarted = () => {
    setActiveModal('signup');
  };

  return (
    <Box minH="100vh" bg="bg">
      <Header
        onOpenLogin={() => setActiveModal('login')}
        onOpenSignup={() => setActiveModal('signup')}
      />
      <Hero onGetStarted={handleGetStarted} />
      <Features />
      <ProfileCards />
      <HowItWorks />
      <CTASection onGetStarted={handleGetStarted} />
      <Footer />

      {/* Authentication Modals */}
      <LoginModal
        open={activeModal === 'login'}
        onClose={() => setActiveModal(null)}
        onForgotPassword={() => setActiveModal('forgotPassword')}
        onSignup={() => setActiveModal('signup')}
        onSuccess={handleAuthSuccess}
      />

      <SignupModal
        open={activeModal === 'signup'}
        onClose={() => setActiveModal(null)}
        onLogin={() => setActiveModal('login')}
        onSuccess={handleAuthSuccess}
      />

      <ForgotPasswordModal
        open={activeModal === 'forgotPassword'}
        onClose={() => setActiveModal(null)}
        onLogin={() => setActiveModal('login')}
      />
    </Box>
  );
};
