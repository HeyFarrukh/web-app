"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { TypingPlaceholder } from "./TypingPlaceholder";

interface SearchBarProps {
  onSubmit: (e: React.FormEvent) => void;
  value?: string;
  onChange?: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSubmit,
  value = "",
  onChange,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <motion.div
        className="flex-1 relative"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="relative flex items-center">
          <Search className="absolute left-4 text-gray-600 dark:text-gray-400 z-10" />
          <input
            type="text"
            value={onChange ? value : inputValue}
            onChange={
              onChange ? (e) => onChange(e.target.value) : handleInputChange
            }
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full pl-12 pr-6 py-4 rounded-full bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border-2 border-white/20 dark:border-gray-700/30 focus:border-orange-500/50 dark:focus:border-orange-500/50 focus:outline-none text-gray-800 dark:text-white shadow-lg transition-all"
            aria-label="Search apprenticeships"
          />
          {!value && !inputValue && !isFocused && (
            <div className="absolute left-12 right-10 flex items-center h-full pointer-events-none text-gray-500 dark:text-gray-400">
              <TypingPlaceholder />
            </div>
          )}
        </div>
      </motion.div>
      <motion.button
        className="px-8 py-4 bg-orange-500/90 backdrop-blur-sm text-white rounded-full hover:bg-orange-600/90 transition-all transform hover:scale-105 whitespace-nowrap shadow-lg"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
      >
        Get Started
      </motion.button>
    </form>
  );
};
