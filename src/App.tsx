// File: App.tsx
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
import { OptimiseCV } from './pages/OptimiseCV';
import { Privacy } from './pages/Privacy';
import { TermsOfService } from './pages/TermsOfService';
import { Team } from './pages/Team';
import { NotFound } from './pages/NotFound';
import { ScrollToTop } from './components/navigation/ScrollToTop';
import { Analytics } from './services/analytics/analytics';
import { useAnalytics } from './hooks/useAnalytics';
import { AuthCallback } from './components/auth/AuthCallBack';
import { PrivateRoute } from './components/auth/PrivateRoute'; // Import PrivateRoute
import { CookiePolicy } from './pages/CookiePolicy';

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

        {/* Wrap OptimizeCV with PrivateRoute */}
        <Route
            path="/optimise-cv"
            element={
              <PrivateRoute>
                <OptimiseCV />
              </PrivateRoute>
            }
          />

        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/team" element={<Team />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={<NotFound />} />
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
      <GoogleOAuthProvider clientId="423840207023-6r1aqpq3852onbj0s8tgrd0ic8llud3c.apps.googleusercontent.com">
        <Router>
          <ScrollToTop />
          <AppRoutes />
        </Router>
      </GoogleOAuthProvider>
    </HelmetProvider>
  );
};

export default App;