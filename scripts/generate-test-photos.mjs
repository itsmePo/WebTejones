import fs from 'fs';
import path from 'path';

const dir = path.join('src', 'assets', 'fotos');
const contentDir = path.join('src', 'content', 'fotos');

fs.mkdirSync(dir, { recursive: true });
fs.mkdirSync(contentDir, { recursive: true });

const tinyJpg = Buffer.from(
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
  'base64'
);

for (let i = 1; i <= 8; i++) {
  fs.writeFileSync(path.join(dir, `foto-${i}.jpg`), tinyJpg);
  const yaml = `src: "../../assets/fotos/foto-${i}.jpg"\nalt: "Fotografía número ${i} de la banda en directo y ensayos"\n`;
  fs.writeFileSync(path.join(contentDir, `foto-${i}.yaml`), yaml);
}

console.log('Generated 8 test photos and yaml files.');
