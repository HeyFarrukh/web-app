const fs = require("fs");

const isProduction = process.env.VERCEL_ENV === "production";
const vercelIgnorePath = ".vercelignore";

// Define files to ignore in production but allow in preview 
const filesToIgnore = [
  "content/articles/readme.md",
  "content/articles/cv-guide.md"
];

// Create or read the .vercelignore file
let ignoreContent = "";
if (fs.existsSync(vercelIgnorePath)) {
  ignoreContent = fs.readFileSync(vercelIgnorePath, "utf8");
}

if (isProduction) {
  // Process each file to ignore
  let updatedContent = ignoreContent;
  let changesNeeded = false;
  
  filesToIgnore.forEach(file => {
    // Check if the file is already in the ignore list
    // We need to check for exact matches to avoid partial matching
    const lines = updatedContent.split("\n");
    const fileAlreadyIgnored = lines.some(line => line.trim() === file);
    
    if (!fileAlreadyIgnored) {
      // Add the file to ignore list
      if (updatedContent && !updatedContent.endsWith("\n")) {
        updatedContent += "\n";
      }
      updatedContent += `${file}\n`;
      changesNeeded = true;
      console.log(`✅ Added ${file} to .vercelignore for production.`);
    }
  });
  
  // Only write to the file if changes were needed
  if (changesNeeded) {
    fs.writeFileSync(vercelIgnorePath, updatedContent);
  }
} else {
  // Remove files from .vercelignore for preview deployments
  const updatedIgnoreContent = ignoreContent
    .split("\n")
    .filter(line => !filesToIgnore.includes(line.trim()))
    .join("\n");

  fs.writeFileSync(vercelIgnorePath, updatedIgnoreContent);
  console.log(`🚀 Removed files from .vercelignore for preview.`);
}

// Debug: Print the final content of .vercelignore
if (fs.existsSync(vercelIgnorePath)) {
  const finalContent = fs.readFileSync(vercelIgnorePath, "utf8");
  console.log("Current .vercelignore content:");
  console.log(finalContent);
}

process.exit(0);
