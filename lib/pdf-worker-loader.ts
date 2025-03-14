'use client';

import * as pdfjs from 'pdfjs-dist';

// Set the worker source to use a known working CDN version
const setPdfWorker = () => {
  if (typeof window !== 'undefined') {
    // Use a known working CDN URL for the worker
    // Instead of using the dynamic version, we'll use a specific version that exists
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.mjs`;
    
    // Alternatively, you can use unpkg with a specific version known to work
    // pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
    
    console.log("PDF worker source set to:", pdfjs.GlobalWorkerOptions.workerSrc);
  }
};

export default setPdfWorker;