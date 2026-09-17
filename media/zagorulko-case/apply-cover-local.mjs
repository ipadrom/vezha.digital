import {readFile,writeFile} from 'node:fs/promises';
const image='/cases/gbu-process-automation/2026-09/cover-work-center.svg';
const alts={ru:'Рабочий центр ГБУ: распознавание заказов на ноутбуке и подбор бригад на телефоне.',en:'GBU work center: order recognition on a laptop and crew selection on a phone.'};
const file=new URL('./content.json',import.meta.url);
const content=JSON.parse(await readFile(file,'utf8'));
for(const lang of ['ru','en'])Object.assign(content[lang],{coverImage:image,coverAlt:alts[lang],coverNote:''});
await writeFile(file,JSON.stringify(content,null,2)+'\n');
const api='http://localhost:8000/api';
let token;
async function request(path,method='GET',body){
  const r=await fetch(api+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});
  if(!r.ok)throw new Error(`${method} ${path}: ${r.status}`);
  return r.json();
}
token=(await request('/admin/auth/dev-login','POST')).access_token;
const cases=(await request('/admin/cases')).filter(c=>c.slug==='gbu-process-automation');
if(cases.length!==1)throw new Error('Expected one local case');
const path='/admin/cases/'+cases[0].id;
const doc=await request(path);
Object.assign(doc.meta,{image_url:image,cover_image_url:image});
const block=doc.blocks.find(b=>b.id==='d38a1d06-ff06-5ec9-a709-b59397d2af90');
if(!block)throw new Error('Missing media hero');
for(const lang of ['ru','en'])Object.assign(block['content_'+lang],{image_url:image,alt:alts[lang],video_url:'',poster_url:'',caption:''});
await request(path,'PUT',{meta:doc.meta,blocks:doc.blocks});
await request(path+'/publish','POST');
const saved=await request(path);
if(saved.meta.cover_image_url!==image||saved.blocks.find(b=>b.id===block.id).content_ru.image_url!==image)throw new Error('Cover verification failed');
console.log('Updated and verified the local case card and media hero. Other sections preserved.');
