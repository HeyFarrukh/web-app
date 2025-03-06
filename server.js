const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const ASTRO_DIST = path.join(__dirname, 'astro-dist');

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;
    
    // Check if the request is for a resource under /resources
    if (pathname.startsWith('/resources')) {
      // For the root resources path, serve index.html
      let filePath;
      if (pathname === '/resources' || pathname === '/resources/') {
        filePath = path.join(ASTRO_DIST, 'index.html');
      } else {
        // Remove the leading /resources to get the relative path within the Astro dist
        const relativePath = pathname.substring('/resources'.length);
        filePath = path.join(ASTRO_DIST, relativePath);
        
        // If path doesn't have an extension, try to serve it as an HTML file
        if (!path.extname(filePath)) {
          // Check if there's an HTML file with this name
          const htmlFilePath = `${filePath}.html`;
          if (fs.existsSync(htmlFilePath)) {
            filePath = htmlFilePath;
          } else {
            // Check if there's a directory with an index.html
            const indexPath = path.join(filePath, 'index.html');
            if (fs.existsSync(indexPath)) {
              filePath = indexPath;
            }
          }
        }
      }
      
      // Check if the file exists
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        // Serve the file
        const fileContent = fs.readFileSync(filePath);
        
        // Set appropriate content type based on file extension
        const ext = path.extname(filePath).toLowerCase();
        let contentType = 'text/html';
        
        if (ext === '.js') contentType = 'application/javascript';
        else if (ext === '.css') contentType = 'text/css';
        else if (ext === '.json') contentType = 'application/json';
        else if (ext === '.png') contentType = 'image/png';
        else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.svg') contentType = 'image/svg+xml';
        
        res.setHeader('Content-Type', contentType);
        res.end(fileContent);
        return;
      }
    }
    
    // If not found in Astro dist, let Next.js handle it
    return handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
