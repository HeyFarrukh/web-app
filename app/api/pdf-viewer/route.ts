// app/api/pdf-viewer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const file = searchParams.get('file');
    
    if (!file) {
      return new NextResponse('File parameter is required', { status: 400 });
    }
    
    // Security: Prevent path traversal attacks
    const sanitizedFile = file.replace(/\.\./g, '');
    const pdfPath = path.join(process.cwd(), 'public', 'resources', 'pdfs', sanitizedFile);
    
    if (!fs.existsSync(pdfPath)) {
      return new NextResponse('PDF not found', { status: 404 });
    }
    
    // Read the PDF file
    const pdfBuffer = fs.readFileSync(pdfPath);
    
    // Return the PDF with appropriate headers
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${path.basename(sanitizedFile)}"`,
      },
    });
  } catch (error) {
    console.error('Error serving PDF:', error);
    return new NextResponse('Error serving PDF', { status: 500 });
  }
}