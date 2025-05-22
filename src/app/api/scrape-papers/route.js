import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year');
  const session = searchParams.get('session');

  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Navigate to the Pearson website
    const url = `https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html?Qualification-Family=International-Advanced-Level&Qualification-Subject=Physics&Status=Pearson-UK:Status%2FLive&Specification-Code=Pearson-UK:Specification-Code%2Fial18-physics&Exam-Series=${session}-${year}`;
    
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Wait for the content to load
    await page.waitForSelector('.document-list', { timeout: 5000 });

    // Extract all PDF links
    const links = await page.evaluate(() => {
      const elements = document.querySelectorAll('.document-list a');
      return Array.from(elements).map(el => ({
        title: el.textContent.trim(),
        href: el.href
      }));
    });

    await browser.close();

    // Filter links based on unit codes
    const filteredLinks = links.filter(link => {
      const title = link.title.toLowerCase();
      return (
        title.includes('wph11') ||
        title.includes('wph12') ||
        title.includes('wph13') ||
        title.includes('wph14') ||
        title.includes('wph15') ||
        title.includes('wph16')
      );
    });

    return NextResponse.json({ links: filteredLinks });
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ error: 'Failed to scrape papers' }, { status: 500 });
  }
} 