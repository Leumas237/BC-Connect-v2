#!/usr/bin/env node
/**
 * Generate PWA icons from SVG source
 * Run: node scripts/generate-icons.js
 * Requires: sharp (npm install sharp)
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const SVG_SOURCE = path.join(__dirname, '..', 'public', 'icons', 'icon.svg');
const ICONS_DIR = path.join(__dirname, '..', 'public', 'icons');

function checkSharp() {
  try {
    require.resolve('sharp');
    return true;
  } catch {
    return false;
  }
}

function generateWithSharp() {
  const sharp = require('sharp');

  return Promise.all(
    ICON_SIZES.map(size => {
      const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);
      return sharp(SVG_SOURCE)
        .resize(size, size, { fit: 'cover' })
        .png()
        .toFile(outputPath)
        .then(() => console.log(`✓ Generated ${size}x${size}`))
        .catch(err => console.error(`✗ Failed ${size}x${size}:`, err.message));
    })
  );
}

function generateWithImageMagick() {
  return new Promise((resolve, reject) => {
    const commands = ICON_SIZES.map(size => {
      const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);
      return new Promise((res, rej) => {
        const magick = spawn('magick', [
          SVG_SOURCE,
          '-resize', `${size}x${size}`,
          '-background', 'none',
          outputPath
        ]);
        magick.on('close', code => {
          if (code === 0) {
            console.log(`✓ Generated ${size}x${size}`);
            res();
          } else {
            console.error(`✗ Failed ${size}x${size} (exit code ${code})`);
            rej(new Error(`ImageMagick failed for ${size}x${size}`));
          }
        });
        magick.on('error', err => {
          console.error(`✗ Failed ${size}x${size}:`, err.message);
          rej(err);
        });
      });
    });

    Promise.all(commands).then(resolve).catch(reject);
  });
}

function generateWithInkscape() {
  return new Promise((resolve, reject) => {
    const commands = ICON_SIZES.map(size => {
      const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);
      return new Promise((res, rej) => {
        const inkscape = spawn('inkscape', [
          SVG_SOURCE,
          '--export-type=png',
          `--export-width=${size}`,
          `--export-height=${size}`,
          `--export-filename=${outputPath}`
        ]);
        inkscape.on('close', code => {
          if (code === 0) {
            console.log(`✓ Generated ${size}x${size}`);
            res();
          } else {
            console.error(`✗ Failed ${size}x${size} (exit code ${code})`);
            rej(new Error(`Inkscape failed for ${size}x${size}`));
          }
        });
        inkscape.on('error', err => {
          console.error(`✗ Failed ${size}x${size}:`, err.message);
          rej(err);
        });
      });
    });

    Promise.all(commands).then(resolve).catch(reject);
  });
}

async function main() {
  console.log('🎨 Generating PWA icons...\n');

  // Check if SVG exists
  if (!fs.existsSync(SVG_SOURCE)) {
    console.error('❌ SVG source not found at:', SVG_SOURCE);
    process.exit(1);
  }

  // Ensure output directory exists
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  let success = false;

  // Try sharp first (fastest, pure JS)
  if (checkSharp()) {
    console.log('Using sharp (Node.js)...');
    try {
      await generateWithSharp();
      success = true;
    } catch (err) {
      console.warn('Sharp failed, trying alternatives...', err.message);
    }
  }

  // Try ImageMagick
  if (!success) {
    console.log('Trying ImageMagick...');
    try {
      await generateWithImageMagick();
      success = true;
    } catch (err) {
      console.warn('ImageMagick not available, trying Inkscape...');
    }
  }

  // Try Inkscape
  if (!success) {
    console.log('Trying Inkscape...');
    try {
      await generateWithInkscape();
      success = true;
    } catch (err) {
      console.error('Inkscape not available.');
    }
  }

  if (!success) {
    console.error('\n❌ No image generation tool available!');
    console.log('\nPlease install one of:');
    console.log('  npm install sharp        (recommended, pure JS)');
    console.log('  brew install imagemagick (macOS)');
    console.log('  sudo apt install imagemagick (Ubuntu)');
    console.log('  brew install inkscape    (macOS)');
    console.log('  sudo apt install inkscape (Ubuntu)');
    process.exit(1);
  }

  // Create placeholder screenshots
  console.log('\n📱 Creating placeholder screenshots...');
  const screenshotsDir = path.join(__dirname, '..', 'public', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Create simple SVG screenshots that can be converted later
  const screenshotTemplates = {
    'discover.png': `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920"><rect fill="#FAFAFA" width="1080" height="1920"/><text x="540" y="960" text-anchor="middle" font-family="system-ui" font-size="48" fill="#999">Discover Screen</text></svg>`,
    'matches.png': `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920"><rect fill="#FAFAFA" width="1080" height="1920"/><text x="540" y="960" text-anchor="middle" font-family="system-ui" font-size="48" fill="#999">Matches Screen</text></svg>`,
    'messages.png': `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920"><rect fill="#FAFAFA" width="1080" height="1920"/><text x="540" y="960" text-anchor="middle" font-family="system-ui" font-size="48" fill="#999">Messages Screen</text></svg>`,
  };

  for (const [filename, content] of Object.entries(screenshotTemplates)) {
    fs.writeFileSync(path.join(screenshotsDir, filename.replace('.png', '.svg')), content);
  }

  console.log('\n✅ All icons generated successfully!');
  console.log(`📁 Icons saved to: ${ICONS_DIR}`);
  console.log(`📁 Screenshots saved to: ${screenshotsDir}`);
  console.log('\n💡 Note: Screenshots are SVG placeholders. Convert to PNG for production.');
}

main().catch(console.error);