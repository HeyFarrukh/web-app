const fs = require("fs");
const path = require("path");

// Determine environment
const isProduction = process.env.VERCEL_ENV === "production";
console.log(`🔍 Current environment: ${isProduction ? "production" : "preview/development"}`);

// Files that should only be available in preview/development
const previewOnlyFiles = [
  "content/articles/readme.md",
  "content/articles/cv-guide.md"
];

// Instead of modifying .vercelignore, we'll control file availability by
// renaming files in production or creating symlinks in preview
if (isProduction) {
  // In production: rename the files to make them unavailable
  previewOnlyFiles.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (fs.existsSync(fullPath)) {
      // Create a backup by renaming with .prod-hidden extension
      const hiddenPath = `${fullPath}.prod-hidden`;
      try {
        fs.renameSync(fullPath, hiddenPath);
        console.log(`✅ Hidden ${filePath} in production deployment`);
      } catch (error) {
        console.error(`❌ Error hiding ${filePath}: ${error.message}`);
      }
    } else {
      console.log(`⚠️ File ${filePath} not found, nothing to hide`);
    }
  });
} else {
  // In preview/development: ensure files are available by restoring from backups if needed
  previewOnlyFiles.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    const hiddenPath = `${fullPath}.prod-hidden`;
    
    // If the original file doesn't exist but the hidden version does, restore it
    if (!fs.existsSync(fullPath) && fs.existsSync(hiddenPath)) {
      try {
        fs.renameSync(hiddenPath, fullPath);
        console.log(`🚀 Restored ${filePath} for preview/development`);
      } catch (error) {
        console.error(`❌ Error restoring ${filePath}: ${error.message}`);
      }
    } else if (fs.existsSync(fullPath)) {
      console.log(`✅ File ${filePath} already available for preview/development`);
    } else {
      console.log(`⚠️ Neither ${filePath} nor its hidden version found`);
    }
  });
}

console.log("✨ File visibility management completed");
process.exit(0);
