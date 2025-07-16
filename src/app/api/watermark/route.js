import { NextResponse } from 'next/server';
import { PDFDocument, rgb } from 'pdf-lib';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import archiver from 'archiver';

// Helper to get Google Drive file/folder ID from URL
function extractDriveId(url) {
  const fileMatch = url.match(/\/d\/(.*?)(\/|$)/);
  const folderMatch = url.match(/folders\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return { type: 'file', id: fileMatch[1] };
  if (folderMatch) return { type: 'folder', id: folderMatch[1] };
  return null;
}

// Helper to fetch PDF file from Google Drive (publicly shared)
async function fetchPdfFromDrive(fileId) {
  const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch PDF from Google Drive');
  return Buffer.from(await res.arrayBuffer());
}

// Helper to apply watermark to a PDF buffer
async function watermarkPdf(pdfBuffer, watermarkBuffer) {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const watermarkImg = await pdfDoc.embedPng(watermarkBuffer);
  const { width, height } = watermarkImg;
  const pages = pdfDoc.getPages();
  for (const page of pages) {
    const { width: pw, height: ph } = page.getSize();
    page.drawImage(watermarkImg, {
      x: (pw - width) / 2,
      y: (ph - height) / 2,
      width,
      height,
      opacity: 0.3,
    });
  }
  return await pdfDoc.save();
}

// Helper to fetch all PDF file IDs in a Google Drive folder (publicly shared, using Google Drive API)
async function fetchFolderPdfIds(folderId) {
  // This requires an API key or OAuth, so for now, return empty (user must provide direct file links)
  // TODO: Implement Google Drive API integration if needed
  return [];
}

export async function POST(req) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'Missing Google Drive URL' }, { status: 400 });
    const driveInfo = extractDriveId(url);
    if (!driveInfo) return NextResponse.json({ error: 'Invalid Google Drive URL' }, { status: 400 });
    // Load watermark image
    const watermarkPath = path.join(process.cwd(), 'public', 'watermark.png');
    const watermarkBuffer = await fs.readFile(watermarkPath);
    if (driveInfo.type === 'file') {
      const pdfBuffer = await fetchPdfFromDrive(driveInfo.id);
      const watermarked = await watermarkPdf(pdfBuffer, watermarkBuffer);
      return new NextResponse(watermarked, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="watermarked.pdf"',
        },
      });
    } else if (driveInfo.type === 'folder') {
      // Not implemented: would require Google Drive API key
      // For now, return error
      return NextResponse.json({ error: 'Folder watermarking requires Google Drive API integration. Please provide direct file links.' }, { status: 501 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 