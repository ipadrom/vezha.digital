import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ff = fileURLToPath(new URL('../gbu-crew-graph-remotion/node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe', import.meta.url));
const out = new URL('../../frontend/public/cases/gbu-process-automation/2026-09/', import.meta.url);
const work = new URL('./outputs/video-review/', import.meta.url);
await mkdir(work, {recursive:true});
const run = args => execFileSync(ff, ['-v','error','-y',...args], {windowsHide:true});
const encoding = ['-an','-r','30','-c:v','libx264','-preset','slow','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart'];
const examples = [
  {name:'orders-recorded', file:'Разбивка заказов.mp4', start:0.1, duration:3.1, poster:3.1, section:0, id:'3f1d741c-0ab2-5a56-add0-a84c8b23f40e', ru:'Перетаскивание фотографии, распознавание и готовые карточки заказов.', en:'Dropping an order photo, recognition and the resulting order cards.'},
  {name:'crews-recorded', file:'Разбивка бригад.mp4', start:0.65, duration:5.7, poster:6.25, section:1, id:'1cddfd62-8bdd-5d6e-a4c4-67e51a1aa760', ru:'Подбор бригад из списка 43 сотрудников и просмотр результата.', en:'Crew selection from a list of 43 employees and a review of the result.'},
];
for (const e of examples) {
  const source='C:/Users/artas/OneDrive/Рабочий стол/Видео гбу центр/'+e.file;
  const crop='crop=912:980:532:100';
  const poster=fileURLToPath(new URL(e.name+'.jpg',out));
  const clip=fileURLToPath(new URL(e.name+'-clip.mp4',work));
  const tail=fileURLToPath(new URL(e.name+'-tail.mp4',work));
  run(['-ss',String(e.poster),'-i',source,'-frames:v','1','-vf',crop,'-q:v','2',poster]);
  run(['-ss',String(e.start),'-i',source,'-t',String(e.duration),'-vf',crop,...encoding,clip]);
  run(['-loop','1','-framerate','30','-i',poster,'-t','2',...encoding,tail]);
  const list=new URL(e.name+'-concat.txt',work);
  await writeFile(list,`file '${e.name}-clip.mp4'\nfile '${e.name}-tail.mp4'\n`);
  run(['-f','concat','-safe','0','-i',fileURLToPath(list),'-c','copy','-movflags','+faststart',fileURLToPath(new URL(e.name+'.mp4',out))]);
  console.log(`${e.name}: cropped to application, ${e.duration+2}s, muted, final-frame poster.`);
}

const contentUrl=new URL('./content.json',import.meta.url);
const content=JSON.parse(await readFile(contentUrl,'utf8'));
for(const e of examples) for(const lang of ['ru','en']) {
  const item=content[lang].sections[e.section].items[0];
  item[2]=e[lang]; item[3]='video';
  item[4]=`/cases/gbu-process-automation/2026-09/${e.name}.jpg`;
  item[5]=''; item[6]=`/cases/gbu-process-automation/2026-09/${e.name}.mp4`;
}
await writeFile(contentUrl,JSON.stringify(content,null,2)+'\n');

// Change only the two media elements in the existing local admin document.
const api='http://localhost:8000/api';
let token;
async function request(path,method='GET',body) {
  const res=await fetch(api+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});
  if(!res.ok) throw new Error(`${method} ${path}: ${res.status}`);
  return res.json();
}
token=(await request('/admin/auth/dev-login','POST')).access_token;
const cases=(await request('/admin/cases')).filter(x=>x.slug==='gbu-process-automation');
if(cases.length!==1)throw new Error('Expected one local case');
const path='/admin/cases/'+cases[0].id;
const doc=await request(path);
for(const e of examples) {
  const block=doc.blocks.find(x=>x.id===e.id);
  if(!block)throw new Error('Missing section '+e.id);
  for(const lang of ['ru','en']) {
    Object.assign(block['content_'+lang].items[0],{
      media_type:'video',image_url:'',video_url:`/cases/gbu-process-automation/2026-09/${e.name}.mp4`,
      poster_url:`/cases/gbu-process-automation/2026-09/${e.name}.jpg`,media_note:e[lang],media_caption:'',media_size:'full'
    });
  }
}
await request(path,'PUT',{meta:doc.meta,blocks:doc.blocks});
await request(path+'/publish','POST');
const saved=await request(path);
for(const e of examples)for(const lang of ['ru','en']) {
  const item=saved.blocks.find(x=>x.id===e.id)['content_'+lang].items[0];
  if(!item.video_url.endsWith(e.name+'.mp4')||item.media_type!=='video')throw new Error('Media save verification failed');
}
console.log('Both videos saved and published to the local case through the admin API.');
