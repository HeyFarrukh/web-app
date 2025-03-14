'use client';

import * as pdfjsLib from 'pdfjs-dist';
import setPdfWorker from '../../lib/pdf-worker-loader'; // Import the worker loader

// Initialize the worker
setPdfWorker();

class PDFService {
  /**
   * Extract text from a PDF file using PDF.js
   */
  async smartExtractTextFromPDF(file: File): Promise<string> {
    try {
      console.log("Starting PDF text extraction...");
      
      // Check if file is actually a PDF
      if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
        throw new Error('File is not a PDF');
      }
      
      // Verify worker initialization
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        console.log("Worker source not set, setting it now");
        setPdfWorker(); // Use the worker loader function
      }
      
      console.log("Using PDF.js worker:", pdfjsLib.GlobalWorkerOptions.workerSrc);
      
      // Log file details for debugging
      console.log(`Processing PDF file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
      
      // Convert file to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      console.log(`File converted to ArrayBuffer, size: ${arrayBuffer.byteLength} bytes`);
      
      // Load the PDF document with compatible options
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        // Use the same version as the worker
        cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
        cMapPacked: true,
        standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/standard_fonts/'
      });
      
      console.log("PDF loading task created, waiting for promise...");
      const pdf = await loadingTask.promise;
      console.log(`PDF loaded successfully. Number of pages: ${pdf.numPages}`);
      
      // Extract text from each page
      let fullText = '';
      
      // Process all pages (limit to first 10 pages for very large documents)
      const numPages = Math.min(pdf.numPages, 10);
      
      for (let i = 1; i <= numPages; i++) {
        try {
          console.log(`Processing page ${i} of ${numPages}`);
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          // Extract text from the page
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          
          fullText += pageText + '\n\n';
          console.log(`Page ${i} processed, extracted ${pageText.length} characters`);
        } catch (pageError) {
          console.error(`Error processing page ${i}:`, pageError);
          // Continue with next page instead of failing completely
        }
      }
      
      // Clean up the extracted text
      fullText = fullText.trim()
        // Remove excessive whitespace
        .replace(/\s+/g, ' ')
        // Restore paragraph breaks
        .replace(/\. /g, '.\n\n')
        // Clean up any PDF artifacts
        .replace(/[^\x20-\x7E\n]/g, '');
      
      console.log(`Extracted ${fullText.length} characters of text`);
      
      if (fullText.length < 50) {
        throw new Error('Could not extract sufficient text from the PDF. Please try a different file or paste your CV text manually.');
      }
      
      return fullText;
    } catch (error) {
      console.error('Error in PDF extraction:', error);
      throw new Error(`Failed to process PDF. Please try again or paste your CV text manually.`);
    }
  }
}

export const pdfService = new PDFService();