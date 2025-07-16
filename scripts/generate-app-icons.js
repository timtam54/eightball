const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// iOS App Icon sizes required for App Store
const iosIconSizes = [
  { size: 20, scale: 2, name: 'Icon-20@2x.png' },
  { size: 20, scale: 3, name: 'Icon-20@3x.png' },
  { size: 29, scale: 2, name: 'Icon-29@2x.png' },
  { size: 29, scale: 3, name: 'Icon-29@3x.png' },
  { size: 40, scale: 2, name: 'Icon-40@2x.png' },
  { size: 40, scale: 3, name: 'Icon-40@3x.png' },
  { size: 60, scale: 2, name: 'Icon-60@2x.png' },
  { size: 60, scale: 3, name: 'Icon-60@3x.png' },
  { size: 1024, scale: 1, name: 'Icon-1024.png' }, // App Store
];

// Splash screen sizes for iOS
const iosSplashSizes = [
  { width: 2732, height: 2732, name: 'splash-2732x2732.png' },
  { width: 1668, height: 2388, name: 'splash-1668x2388.png' },
  { width: 1668, height: 2224, name: 'splash-1668x2224.png' },
  { width: 1536, height: 2048, name: 'splash-1536x2048.png' },
  { width: 1125, height: 2436, name: 'splash-1125x2436.png' },
  { width: 1242, height: 2208, name: 'splash-1242x2208.png' },
  { width: 750, height: 1334, name: 'splash-750x1334.png' },
  { width: 640, height: 1136, name: 'splash-640x1136.png' },
];

async function generateIcon() {
  // Create a programmatic icon with gradient background
  const size = 1024;
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#EC4899;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#F59E0B;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="ball" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1F2937;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#111827;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="${size}" height="${size}" fill="url(#bg)" rx="180"/>
      
      <!-- 8-Ball -->
      <circle cx="${size/2}" cy="${size/2}" r="320" fill="url(#ball)"/>
      
      <!-- White circle for number -->
      <circle cx="${size/2}" cy="${size/2}" r="140" fill="white"/>
      
      <!-- Number 8 -->
      <text x="${size/2}" y="${size/2 + 40}" font-family="Arial, sans-serif" font-size="180" font-weight="bold" text-anchor="middle" fill="#1F2937">8</text>
      
      <!-- Shine effect -->
      <ellipse cx="${size/2 - 100}" cy="${size/2 - 150}" rx="120" ry="80" fill="white" opacity="0.3"/>
    </svg>
  `;

  return sharp(Buffer.from(svg))
    .png()
    .toBuffer();
}

async function generateSplashScreen() {
  const width = 2732;
  const height = 2732;
  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg" cx="50%" cy="50%">
          <stop offset="0%" style="stop-color:#1F2937;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
        </radialGradient>
      </defs>
      
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      
      <!-- Logo -->
      <g transform="translate(${width/2}, ${height/2})">
        <!-- 8-Ball -->
        <circle cx="0" cy="-100" r="200" fill="#111827"/>
        <circle cx="0" cy="-100" r="80" fill="white"/>
        <text x="0" y="-75" font-family="Arial, sans-serif" font-size="100" font-weight="bold" text-anchor="middle" fill="#1F2937">8</text>
        <ellipse cx="-60" cy="-180" rx="70" ry="50" fill="white" opacity="0.3"/>
        
        <!-- Title -->
        <text x="0" y="150" font-family="Arial, sans-serif" font-size="120" font-weight="bold" text-anchor="middle" fill="white">Tetris</text>
        <text x="0" y="280" font-family="Arial, sans-serif" font-size="100" font-weight="300" text-anchor="middle" fill="#9CA3AF">Games</text>
      </g>
    </svg>
  `;

  return sharp(Buffer.from(svg))
    .png()
    .toBuffer();
}

async function main() {
  try {
    // Ensure directories exist
    const iconDir = path.join(__dirname, '../ios/App/App/Assets.xcassets/AppIcon.appiconset');
    const splashDir = path.join(__dirname, '../ios/App/App/Assets.xcassets/Splash.imageset');
    
    await fs.mkdir(iconDir, { recursive: true });
    await fs.mkdir(splashDir, { recursive: true });

    // Generate base icon
    console.log('Generating app icon...');
    const iconBuffer = await generateIcon();

    // Generate all icon sizes
    for (const icon of iosIconSizes) {
      const size = icon.size * icon.scale;
      await sharp(iconBuffer)
        .resize(size, size)
        .toFile(path.join(iconDir, icon.name));
      console.log(`Created ${icon.name} (${size}x${size})`);
    }

    // Generate splash screen
    console.log('\nGenerating splash screens...');
    const splashBuffer = await generateSplashScreen();

    // Generate all splash sizes
    for (const splash of iosSplashSizes) {
      await sharp(splashBuffer)
        .resize(splash.width, splash.height, {
          fit: 'cover',
          position: 'center'
        })
        .toFile(path.join(splashDir, splash.name));
      console.log(`Created ${splash.name} (${splash.width}x${splash.height})`);
    }

    // Create Contents.json for icons
    const iconContents = {
      images: iosIconSizes.map(icon => ({
        size: `${icon.size}x${icon.size}`,
        idiom: icon.size === 1024 ? 'ios-marketing' : 'iphone',
        filename: icon.name,
        scale: `${icon.scale}x`
      })),
      info: {
        version: 1,
        author: 'xcode'
      }
    };

    await fs.writeFile(
      path.join(iconDir, 'Contents.json'),
      JSON.stringify(iconContents, null, 2)
    );

    // Create Contents.json for splash
    const splashContents = {
      images: [{
        idiom: 'universal',
        filename: 'splash-2732x2732.png',
        scale: '1x'
      }, {
        idiom: 'universal',
        scale: '2x'
      }, {
        idiom: 'universal',
        scale: '3x'
      }],
      info: {
        version: 1,
        author: 'xcode'
      }
    };

    await fs.writeFile(
      path.join(splashDir, 'Contents.json'),
      JSON.stringify(splashContents, null, 2)
    );

    console.log('\n✅ App icons and splash screens generated successfully!');
    console.log('Note: You may need to run "npx cap sync ios" to apply changes.');

  } catch (error) {
    console.error('Error generating assets:', error);
    process.exit(1);
  }
}

// Check if sharp is installed
try {
  require.resolve('sharp');
  main();
} catch (e) {
  console.log('Installing sharp...');
  require('child_process').execSync('npm install sharp', { stdio: 'inherit' });
  console.log('Sharp installed. Please run this script again.');
}