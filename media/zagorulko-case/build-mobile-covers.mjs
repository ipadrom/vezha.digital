// Authoring helper: requires sharp in the local media tooling environment.
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';
for (const cover of ['gbu-process-automation/2026-09/cover-work-center', 'ssag/2026-09/cover-editorial']) {
  const base=new URL('../../frontend/public/cases/'+cover,import.meta.url);
  await sharp(fileURLToPath(new URL(base.href+'.svg')),{density:144})
    .webp({lossless:true,effort:6})
    .toFile(fileURLToPath(new URL(base.href+'-mobile.webp')));
}
