import { NextResponse } from 'next/server'

export async function GET() {
  // In a production app, you would generate actual icon files here
  // For this demo, we'll return a simple SVG that can be used as an icon

  const svgIcon = `
    <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4169E1;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1e3c72;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="100" fill="url(#bgGradient)"/>
      <text x="256" y="256" font-family="Arial, sans-serif" font-size="280" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">8</text>
    </svg>
  `

  return new NextResponse(svgIcon, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000',
    },
  })
}