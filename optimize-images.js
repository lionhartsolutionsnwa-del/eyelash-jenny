const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const photosDir = './photos';
const beforeAfterDir = './public/images/before-after';
const galleryDir = './public/images/gallery';

const images = [
  { src: 'classic-before.png', dest: 'before-classic.jpg', folder: 'beforeAfter' },
  { src: 'classic-after.png', dest: 'after-classic.jpg', folder: 'gallery' },
  { src: 'hybrid-before.png', dest: 'before-hybrid.jpg', folder: 'beforeAfter' },
  { src: 'hybrid-after.png', dest: 'after-hybrid.jpg', folder: 'gallery' },
  { src: 'volume-before.png', dest: 'before-volume.jpg', folder: 'beforeAfter' },
  { src: 'volume-after.png', dest: 'after-volume.jpg', folder: 'gallery' },
];

async function optimizeImage(img) {
  const srcPath = path.join(photosDir, img.src);
  const destDir = img.folder === 'beforeAfter' ? beforeAfterDir : galleryDir;
  const destPath = path.join(destDir, img.dest);
  
  console.log(`Optimizing ${img.src}...`);
  
  try {
    const stats = fs.statSync(srcPath);
    console.log(`  Original size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    
    await sharp(srcPath)
      .resize(1200, null, { withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(destPath);
    
    const newStats = fs.statSync(destPath);
    console.log(`  New size: ${(newStats.size / 1024).toFixed(2)} KB`);
    console.log(`  Saved to: ${destPath}`);
  } catch (err) {
    console.error(`  Error processing ${img.src}:`, err.message);
  }
}

async function main() {
  for (const img of images) {
    await optimizeImage(img);
  }
  console.log('Done!');
}

main();
