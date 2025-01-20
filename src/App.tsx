import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { WeGetIt } from './components/WeGetIt';
import { Roadmap } from './components/Roadmap';
import { Footer } from './components/Footer';
import { SignIn } from './pages/SignIn';
import { Listings } from './pages/Listings';
import { JoinUs } from './pages/JoinUs';
import { Privacy } from './pages/Privacy';
import { TermsOfService } from './pages/TermsOfService';
import { ScrollToTop } from './components/navigation/ScrollToTop';

export const App = () => {
  return (
    <GoogleOAuthProvider clientId="972953081439-feffiadbd6v8laecusaq3jnh5m6nll94.apps.googleusercontent.com">
      <Router>
        <ScrollToTop />
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
            <Route path="/listings" element={<Listings />} />
            <Route path="/join" element={<JoinUs />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<TermsOfService />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;