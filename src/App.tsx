import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { WeGetIt } from './components/WeGetIt';
import { Roadmap } from './components/Roadmap';
import { Footer } from './components/Footer';
import { SignIn } from './pages/SignIn';
import { Listings } from './pages/Listings';
import { JoinUs } from './pages/JoinUs';

function App() {
  return (
    <Router>
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
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;