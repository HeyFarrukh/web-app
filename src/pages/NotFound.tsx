import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, RefreshCw } from "lucide-react";

export const NotFound = () => {
  const navigate = useNavigate();
  const [konami, setKonami] = useState<string[]>([]);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const konamiCode = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ];

  useEffect(() => {
    // Add noindex meta tag
    const metaTag = document.createElement("meta");
    metaTag.name = "robots";
    metaTag.content = "noindex, nofollow";
    document.head.appendChild(metaTag);

    return () => {
      document.head.removeChild(metaTag);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const newKonami = [...konami, event.key];
      if (newKonami.length > konamiCode.length) {
        newKonami.shift();
      }
      setKonami(newKonami);

      if (newKonami.join(",") === konamiCode.join(",")) {
        setShowEasterEgg(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [konami]);

  const handleTryAgain = () => {
    setAttempts((prev) => prev + 1);
    if (attempts >= 2) {
      setShowEasterEgg(true);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <AnimatePresence mode="wait">
        {!showEasterEgg ? (
          <motion.div
            key="normal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <motion.h1
              className="text-9xl font-bold text-orange-500 mb-4"
              animate={{
                rotate: [0, -5, 5, -5, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 0.5,
                times: [0, 0.2, 0.4, 0.6, 0.8],
              }}
            >
              404
            </motion.h1>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
              Looks like this page took a gap year! Maybe try the Konami code?
              (↑↑↓↓←→←→ba)
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
              >
                <Home className="w-5 h-5" />
                <span>Go Home</span>
              </button>
              <button
                onClick={handleTryAgain}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Try Again</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="easter-egg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="text-center"
          >
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.2, 1],
              }}
              transition={{
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity, ease: "easeInOut" },
              }}
              className="text-9xl mb-8"
            >
              🎮
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Achievement Unlocked: Easter Egg Found!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
              Congrats! You've discovered our secret gaming mode.
              Unfortunately, it's still in development... just like your career
              without an apprenticeship! 😉
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors inline-flex items-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>Back to Reality</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
