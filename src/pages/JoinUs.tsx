import React from 'react';
import { motion } from 'framer-motion';
import { Award, Users, Briefcase, Cpu, ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const benefits = [
  {
    icon: Award,
    title: 'Earn a Certificate',
    description: 'Receive an official ApprenticeWatch Ambassador certificate to improve your LinkedIn Profile and CV!',
  },
  {
    icon: Cpu,
    title: 'Shape the Future',
    description: 'Share your ideas and help us make ApprenticeWatch even better for everyone!',
  },
  {
    icon: Users,
    title: 'Drive Community Change',
    description: 'Join meetings with fellow ambassadors and industry leaders to shape the future of apprenticeships.',
  },
  {
    icon: Briefcase,
    title: 'Boost Your CV',
    description: 'Gain valuable experience in community leadership, event organisation, and digital marketing.',
  },
];

export const JoinUs = () => {
  return (
    <>
      <Helmet>
        <title>Join ApprenticeWatch | Become an Ambassador</title>
        <meta name="description" content="Join ApprenticeWatch as a Brand Ambassador. Shape the future of apprenticeships, gain valuable experience, and boost your career prospects." />
        <meta name="keywords" content="ApprenticeWatch ambassador, apprenticeship ambassador, career development, student opportunities, UK apprenticeships" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Join ApprenticeWatch | Become an Ambassador" />
        <meta property="og:description" content="Join ApprenticeWatch as a Brand Ambassador. Shape the future of apprenticeships, gain valuable experience, and boost your career prospects." />
        <meta property="og:image" content="/media/join-us-og-image.png" />
        
        {/* Twitter */}
        <meta name="twitter:title" content="Join ApprenticeWatch | Become an Ambassador" />
        <meta name="twitter:description" content="Join ApprenticeWatch as a Brand Ambassador. Shape the future of apprenticeships, gain valuable experience, and boost your career prospects." />
        
        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Join ApprenticeWatch",
            "description": "Join ApprenticeWatch as a Brand Ambassador. Shape the future of apprenticeships, gain valuable experience, and boost your career prospects.",
            "offers": {
              "@type": "Offer",
              "name": "Brand Ambassador Program",
              "description": "Join our ambassador program to gain valuable experience and shape the future of apprenticeships",
              "category": "Career Development"
            },
            "mainEntity": {
              "@type": "EducationalOccupationalProgram",
              "name": "ApprenticeWatch Ambassador Program",
              "description": "A program designed to develop future leaders in the apprenticeship space",
              "occupationalCredentialAwarded": "ApprenticeWatch Ambassador Certificate"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Become an ApprenticeWatch{' '}
              <span className="text-orange-500">Ambassador</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            >
              Join our mission to revolutionise apprenticeship discovery while developing your career
            </motion.p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-orange-600/5 rounded-xl transform -rotate-1 group-hover:rotate-0 transition-transform duration-300" />
                <div className="relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group inline-flex items-center space-x-2 px-8 py-4 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors font-semibold shadow-lg hover:shadow-xl"
            >
              <span>Apply to Become an Ambassador</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Applications are reviewed on a rolling basis
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};