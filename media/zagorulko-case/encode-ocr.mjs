import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const folder=new URL('./outputs/demo/ocr-upload-frames/',import.meta.url);
const times=JSON.parse(await fs.readFile(new URL('times.json',folder),'utf8'));
const filename=i=>'frame-'+String(i).padStart(4,'0')+'.jpg';
for(let i=0;i<times.length;i++)await fs.copyFile(new URL(filename(i).replace('.jpg','.png'),folder),new URL(filename(i),folder));
const list=times.map((t,i)=>`file '${filename(i)}'\nduration ${((times[i+1]??8.5)-t).toFixed(3)}`).join('\n')+`\nfile '${filename(times.length-1)}'\n`;
await fs.writeFile(new URL('frames.txt',folder),list);
const ffmpeg=fileURLToPath(new URL('../gbu-crew-graph-remotion/node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe',import.meta.url));
const video=new URL('./outputs/demo/ocr-upload.mp4',import.meta.url);
execFileSync(ffmpeg,['-v','error','-y','-f','concat','-safe','0','-i',fileURLToPath(new URL('frames.txt',folder)),'-vf','scale=1264:712','-r','30','-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart','-an',fileURLToPath(video)],{windowsHide:true});
const dest=new URL('../../frontend/public/cases/gbu-process-automation/2026-09/',import.meta.url);
for(const file of ['ocr-upload.mp4','app-orders.png','app-edit.png'])await fs.copyFile(new URL('./outputs/demo/'+file,import.meta.url),new URL(file,dest));
const file=new URL('./content.json',import.meta.url);const c=JSON.parse(await fs.readFile(file,'utf8'));
for(const locale of ['ru','en']){const item=c[locale].sections[0].items[0];item[3]='video';item[6]='/cases/gbu-process-automation/2026-09/ocr-upload.mp4';item[2]=locale==='ru'?'Загрузка фотографии, распознавание и карточки с фрагментами исходника.':'Photo upload, recognition and cards with source fragments.';}
await fs.writeFile(file,JSON.stringify(c,null,2)+'\n');
console.log('Encoded OCR demonstration and refreshed screenshots with row fragments.');

