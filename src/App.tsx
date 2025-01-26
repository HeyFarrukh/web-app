import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { HelmetProvider } from 'react-helmet-async';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { WeGetIt } from './components/WeGetIt';
import { Roadmap } from './components/Roadmap';
import { Footer } from './components/Footer';
import { SignIn } from './pages/SignIn';
import { Listings } from './pages/Listings';
import { ApprenticeshipDetail } from './pages/ApprenticeshipDetail';
import { JoinUs } from './pages/JoinUs';
import { Privacy } from './pages/Privacy';
import { TermsOfService } from './pages/TermsOfService';
import { Team } from './pages/Team';
import { ScrollToTop } from './components/navigation/ScrollToTop';
import { Analytics } from './services/analytics/analytics';
import { useAnalytics } from './hooks/useAnalytics';

const AppRoutes = () => {
  useAnalytics();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <Routes>
        <Route path="/" element={
          <>
            <Hero />
            <WeGetIt />
            <Roadmap />
          </>
        } />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/apprenticeships" element={<Listings />} />
        <Route path="/apprenticeships/:id" element={<ApprenticeshipDetail />} />
        <Route path="/listings" element={<Navigate to="/apprenticeships" replace />} />
        <Route path="/join" element={<JoinUs />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/team" element={<Team />} />
      </Routes>
      <Footer />
    </div>
  );
};

export const App = () => {
  useEffect(() => {
    Analytics.initialize();
  }, []);

  return (
    <HelmetProvider>
      <GoogleOAuthProvider clientId="972953081439-feffiadbd6v8laecusaq3jnh5m6nll94.apps.googleusercontent.com">
        <Router>
          <ScrollToTop />
          <AppRoutes />
        </Router>
      </GoogleOAuthProvider>
    </HelmetProvider>
  );
};

export default App;