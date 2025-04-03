"use client";

import React from 'react';
import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import supabase from '@/config/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Briefcase, GraduationCap, MapPin, Navigation, Home, User } from 'lucide-react';

interface OnboardingStep {
  title: string;
  description: string;
  field: string;
  skippable?: boolean;
  required?: boolean;
  icon: React.ElementType;
}

interface UserPreferences {
  preferred_sectors: string[];
  preferred_course_levels: number[];
  preferred_locations: string[];
  willing_to_travel_distance_miles: number | null;
  postcode: string;
  age: number | null;
}

const steps: OnboardingStep[] = [
  {
    title: "What sectors interest you?",
    description: "Select all the industries you'd like to work in",
    field: "preferred_sectors",
    required: true,
    icon: Briefcase
  },
  {
    title: "What level of courses are you looking for?",
    description: "Choose the apprenticeship levels that match your goals",
    field: "preferred_course_levels",
    required: true,
    icon: GraduationCap
  },
  {
    title: "Where would you like to work?",
    description: "Select your preferred locations",
    field: "preferred_locations",
    required: true,
    icon: MapPin
  },
  {
    title: "How far can you travel?",
    description: "Select the maximum distance you're willing to commute",
    field: "willing_to_travel_distance_miles",
    skippable: true,
    icon: Navigation
  },
  {
    title: "What's your postcode?",
    description: "This helps us find opportunities near you",
    field: "postcode",
    skippable: true,
    icon: Home
  },
  {
    title: "What's your age?",
    description: "This helps us show relevant opportunities",
    field: "age",
    skippable: true,
    icon: User
  }
];

const sectorOptions = [
  "Technology", "Engineering", "Healthcare", "Business", 
  "Construction", "Creative", "Education", "Finance"
];

const courseLevelOptions = [
  { value: 2, label: "Intermediate - Level 2" },
  { value: 3, label: "Advanced - Level 3" },
  { value: 4, label: "Higher - Level 4" },
  { value: 5, label: "Higher - Level 5" },
  { value: 6, label: "Degree - Level 6" },
  { value: 7, label: "Masters - Level 7" }
];

const locationOptions = [
  "London", "Manchester", "Birmingham", "Leeds", 
  "Liverpool", "Newcastle", "Bristol", "Cardiff"
];

const ANYWHERE_DISTANCE = 9999;

const distanceOptions = [
  { value: 5, label: '5 miles' },
  { value: 10, label: '10 miles' },
  { value: 15, label: '15 miles' },
  { value: 20, label: '20 miles' },
  { value: 25, label: '25 miles' },
  { value: 30, label: '30 miles' },
  { value: 50, label: '50 miles' },
  { value: ANYWHERE_DISTANCE, label: 'Anywhere in the UK' }
];

export function OnboardingFlow() {
  const { userData } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserPreferences>({
    preferred_sectors: [],
    preferred_course_levels: [],
    preferred_locations: [],
    willing_to_travel_distance_miles: null,
    postcode: "",
    age: null
  });

  useEffect(() => {
    const checkRequiredData = async () => {
      if (!userData?.id) return;

      try {
        const { data, error } = await supabase
          .from('users')
          .select('preferred_sectors, preferred_course_levels, preferred_locations')
          .eq('id', userData.id)
          .single();

        if (error) throw error;

        // Check if any required fields are missing or empty
        const missingRequiredData = !data ||
          !data.preferred_sectors?.length ||
          !data.preferred_course_levels?.length ||
          !data.preferred_locations?.length;

        if (missingRequiredData) {
          // If we have some data, pre-fill the form
          if (data) {
            setFormData(prevData => ({
              ...prevData,
              preferred_sectors: data.preferred_sectors || [],
              preferred_course_levels: data.preferred_course_levels || [],
              preferred_locations: data.preferred_locations || []
            }));
          }
          setIsOpen(true);
          // Find the first required step that's missing data
          const firstMissingStep = steps.findIndex(step => {
            if (!step.required) return false;
            const fieldData = data?.[step.field as keyof typeof data];
            return !fieldData || (Array.isArray(fieldData) && !fieldData.length);
          });
          setCurrentStep(firstMissingStep >= 0 ? firstMissingStep : 0);
        }
      } catch (error) {
        console.error('Error checking user data:', error);
      }
    };

    checkRequiredData();
  }, [userData?.id]);

  const validateCurrentStep = (): boolean => {
    const currentStepData = steps[currentStep];
    if (!currentStepData.required) return true;

    const fieldValue = formData[currentStepData.field as keyof UserPreferences];
    if (Array.isArray(fieldValue)) {
      if (fieldValue.length === 0) {
        setError(`Please select at least one ${currentStepData.field.replace('preferred_', '').replace('_', ' ')}`);
        return false;
      }
    } else if (fieldValue === null || fieldValue === "") {
      setError(`Please provide your ${currentStepData.field.replace('_', ' ')}`);
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save all data
      try {
        const { error: saveError } = await supabase
          .from('users')
          .update(formData)
          .eq('id', userData?.id);
        
        if (saveError) throw saveError;
        setIsOpen(false);
      } catch (error) {
        console.error('Error saving preferences:', error);
        setError('Failed to save your preferences. Please try again.');
      }
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.field) {
      case 'preferred_sectors':
        return (
          <div className="grid grid-cols-2 gap-3">
            {sectorOptions.map((sector) => (
              <button
                key={sector}
                onClick={() => {
                  const sectors = formData.preferred_sectors.includes(sector)
                    ? formData.preferred_sectors.filter(s => s !== sector)
                    : [...formData.preferred_sectors, sector];
                  setFormData({ ...formData, preferred_sectors: sectors });
                }}
                className={`p-3 rounded-lg border transition-all ${
                  formData.preferred_sectors.includes(sector)
                    ? 'bg-orange-500 text-white border-orange-600'
                    : 'border-gray-300 hover:border-orange-500'
                }`}
              >
                {sector}
              </button>
            ))}
          </div>
        );

      case 'preferred_course_levels':
        return (
          <div className="space-y-3">
            {courseLevelOptions.map((level) => (
              <button
                key={level.value}
                onClick={() => {
                  const levels = formData.preferred_course_levels.includes(level.value)
                    ? formData.preferred_course_levels.filter(l => l !== level.value)
                    : [...formData.preferred_course_levels, level.value];
                  setFormData({ ...formData, preferred_course_levels: levels });
                }}
                className={`w-full p-3 rounded-lg border transition-all ${
                  formData.preferred_course_levels.includes(level.value)
                    ? 'bg-orange-500 text-white border-orange-600'
                    : 'border-gray-300 hover:border-orange-500'
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        );

      case 'preferred_locations':
        return (
          <div className="grid grid-cols-2 gap-3">
            {locationOptions.map((location) => (
              <button
                key={location}
                onClick={() => {
                  const locations = formData.preferred_locations.includes(location)
                    ? formData.preferred_locations.filter(l => l !== location)
                    : [...formData.preferred_locations, location];
                  setFormData({ ...formData, preferred_locations: locations });
                }}
                className={`p-3 rounded-lg border transition-all ${
                  formData.preferred_locations.includes(location)
                    ? 'bg-orange-500 text-white border-orange-600'
                    : 'border-gray-300 hover:border-orange-500'
                }`}
              >
                {location}
              </button>
            ))}
          </div>
        );

      case 'willing_to_travel_distance_miles':
        return (
          <div className="space-y-3">
            {distanceOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFormData({ ...formData, willing_to_travel_distance_miles: option.value })}
                className={`w-full p-3 rounded-lg border transition-all ${
                  formData.willing_to_travel_distance_miles === option.value
                    ? 'bg-orange-500 text-white border-orange-600'
                    : option.value === ANYWHERE_DISTANCE 
                      ? 'bg-gradient-to-r from-orange-500/20 to-orange-400/20 border-orange-300 hover:from-orange-500/30 hover:to-orange-400/30'
                      : 'border-gray-300 hover:border-orange-500'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        );

      case 'postcode':
        return (
          <input
            type="text"
            value={formData.postcode}
            onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="Enter your postcode"
          />
        );

      case 'age':
        return (
          <input
            type="number"
            value={formData.age || ''}
            onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || null })}
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="Enter your age"
          />
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          open={isOpen}
          onClose={() => {}}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="min-h-screen px-4 text-center">
            {/* Backdrop with blur effect */}
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
            <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
            
            <Dialog.Panel as={motion.div}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="inline-block w-full max-w-md p-8 my-8 overflow-hidden text-left align-middle transition-all transform bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 shadow-xl rounded-2xl relative"
            >
              {/* Progress bar */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-200 dark:bg-gray-700">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500 rounded-r"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>

              {/* Step icon */}
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-orange-500 to-orange-400">
                {React.createElement(steps[currentStep].icon, {
                  className: "w-6 h-6 text-white"
                })}
              </div>

              <Dialog.Title className="text-2xl font-bold text-center leading-6 text-gray-900 dark:text-white mb-2">
                {steps[currentStep].title}
                {steps[currentStep].required && (
                  <span className="ml-1 text-sm text-orange-500"></span>
                )}
              </Dialog.Title>
              
              <p className="text-sm text-center text-gray-600 dark:text-gray-300 mb-8">
                {steps[currentStep].description}
                {steps[currentStep].required && (
                  <span className="block mt-1 text-orange-500 text-xs">
                    
                  </span>
                )}
              </p>

              <div className="mt-4">
                {renderStepContent()}
              </div>

              {/* Error message */}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-sm text-center text-red-500 dark:text-red-400"
                >
                  {error}
                </motion.p>
              )}

              <div className="mt-8 flex justify-between">
                {steps[currentStep].skippable && (
                  <button
                    onClick={() => {
                      setError(null);
                      if (currentStep < steps.length - 1) {
                        setCurrentStep(currentStep + 1);
                      } else {
                        setIsOpen(false);
                      }
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500"
                  >
                    Skip this step
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className={`inline-flex justify-center px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-400 rounded-lg shadow-sm hover:from-orange-600 hover:to-orange-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500 transition-all duration-200 ${steps[currentStep].skippable ? 'ml-3' : 'w-full'}`}
                >
                  {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
