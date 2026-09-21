import { readFile } from 'node:fs/promises';
// Fixed loopback address: this script cannot publish to a remote environment.
const api='http://localhost:8000/api';
const document=JSON.parse(await readFile(new URL('./case.json',import.meta.url),'utf8'));
let token;
async function request(path,method='GET',body){
 const response=await fetch(api+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});
 if(!response.ok)throw new Error(`${method} ${path}: HTTP ${response.status}`);
 return response.json();
}
token=(await request('/admin/auth/dev-login','POST')).access_token;
const matches=(await request('/admin/cases')).filter(c=>c.slug==='mymit');
if(matches.length>1)throw new Error('Ambiguous local MyMIT case');
const target=matches[0]||await request('/admin/cases','POST',{meta:document.meta});
const path=`/admin/cases/${target.id}`;
await request(path,'PUT',document);
await request(path+'/publish','POST');
const saved=await request(path);
if(saved.blocks.length!==document.blocks.length||saved.meta.slug!=='mymit')throw new Error('Local verification failed');
console.log('Local case saved: http://127.0.0.1:3100/cases/mymit');
console.log(`Local editor: http://127.0.0.1:3100/admin/cases/${target.id}`);
