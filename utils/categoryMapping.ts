// Display categories shown in the UI
export const displayCategories = [
  "Technology and IT",
  "Business and Administration",
  "Legal, Finance, and Accounting",
  "Sales and Marketing",
  "Care Services",
  "Hair and Beauty",
  "Health and Science",
  "Catering and Hospitality",
  "Construction",
  "Engineering and Manufacturing",
  "Creative and Design",
  "Public Safety and Emergency Services",
  "Transportation and Logistics",
  "Agriculture, Environment, and Animal Care"
] as const;

// Mapping between display categories and database categories
export const categoryMapping = {
  "Technology and IT": "Digital",
  "Business and Administration": "Business and administration",
  "Legal, Finance, and Accounting": "Legal, finance and accounting",
  "Sales and Marketing": "Sales, marketing and procurement",
  "Care Services": "Care services",
  "Hair and Beauty": "Hair and beauty",
  "Health and Science": "Health and science",
  "Catering and Hospitality": "Catering and hospitality",
  "Construction": "Construction and the built environment",
  "Engineering and Manufacturing": "Engineering and manufacturing",
  "Creative and Design": "Creative and design",
  "Public Safety and Emergency Services": "Protective services",
  "Transportation and Logistics": "Transport and logistics",
  "Agriculture, Environment, and Animal Care": "Agriculture, environmental and animal care"
} as const;

// Reverse mapping for converting database categories to display categories
export const dbToCategoryMapping: { [key: string]: string } = 
  Object.entries(categoryMapping).reduce((acc, [display, db]) => ({
    ...acc,
    [db]: display
  }), {});

// Convert display category to database category
export const getDbCategory = (displayCategory: string): string => {
  return categoryMapping[displayCategory as keyof typeof categoryMapping] || displayCategory;
};

// Convert database category to display category
export const getDisplayCategory = (dbCategory: string): string => {
  return dbToCategoryMapping[dbCategory] || dbCategory;
};
