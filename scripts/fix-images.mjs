import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

const PHOTOS = 'photos';
const PUBLIC = 'public/images';

const ops = [
  { in: 'classic-before.png', out: 'before-after/before-classic.jpg' },
  { in: 'classic-after.png',  out: 'before-after/after-classic.jpg' },
  { in: 'hybrid-before.png',  out: 'before-after/before-hybrid.jpg' },
  { in: 'hybrid-after.png',   out: 'before-after/after-hybrid.jpg' },
  { in: 'volume-before.png',  out: 'before-after/before-volume.jpg' },
  { in: 'volume-after.png',   out: 'before-after/after-volume.jpg' },
  { in: 'jenny-gallery-1.webp', out: 'gallery/jenny-gallery-1.jpg' },
  { in: 'jenny-gallery-2.png',  out: 'gallery/jenny-gallery-2.jpg' },
  { in: 'imjenny.jpg', out: 'jenny.jpg' },
];

for (const op of ops) {
  const src = path.join(PHOTOS, op.in);
  const dest = path.join(PUBLIC, op.out);
  console.log('Optimizing ' + src + ' -> ' + dest);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await sharp(src)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toFile(dest);
  console.log('  Done: ' + dest);
}

console.log('All done!');
