const fs = require("fs");

const isProduction = process.env.VERCEL_ENV === "production";
const vercelIgnorePath = ".vercelignore";

// Read existing .vercelignore content (if it exists)
let ignoreContent = fs.existsSync(vercelIgnorePath) ? fs.readFileSync(vercelIgnorePath, "utf8") : "";

// Define files to ignore in production but allow in preview
const filesToIgnore = [
  "content/articles/readme.md",
  "content/articles/cv-guide.md"
];

if (isProduction) {
  // Add files to .vercelignore if they are not already present
  filesToIgnore.forEach(file => {
    if (!ignoreContent.includes(file)) {
      fs.appendFileSync(vercelIgnorePath, `\n${file}\n`);
      console.log(`✅ Added ${file} to .vercelignore for production.`);
    }
  });
} else {
  // Remove files from .vercelignore for preview deployments
  const updatedIgnoreContent = ignoreContent
    .split("\n")
    .filter(line => !filesToIgnore.includes(line.trim()))
    .join("\n");

  fs.writeFileSync(vercelIgnorePath, updatedIgnoreContent);
  console.log(`🚀 Removed files from .vercelignore for preview.`);
}

process.exit(0);
