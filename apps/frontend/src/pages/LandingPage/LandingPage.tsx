/**
 * Landing Page
 * Main landing page for Datifyy dating platform
 */

import { Box } from '@chakra-ui/react';
import { Header } from '../../shared/components/Header/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { ProfileCards } from './components/ProfileCards';
import { HowItWorks } from './components/HowItWorks';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';

export const LandingPage = () => {
  const handleLogin = () => {
    // TODO: Implement login modal
    console.log('Login clicked');
  };

  const handleSignup = () => {
    // TODO: Implement signup modal
    console.log('Signup clicked');
  };

  return (
    <Box minH="100vh" bg="bg">
      <Header onLogin={handleLogin} onSignup={handleSignup} />
      <Hero onGetStarted={handleSignup} />
      <Features />
      <ProfileCards />
      <HowItWorks />
      <CTASection onGetStarted={handleSignup} />
      <Footer />
    </Box>
  );
};
