import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const output = new URL('../../frontend/public/cases/mymit/2026-09/', import.meta.url);
await mkdir(output, {recursive:true});
const browser = await chromium.launch({headless:true});
try {
 const context = await browser.newContext({viewport:{width:520,height:1100},deviceScaleFactor:2,locale:'ru-RU',reducedMotion:'reduce'});
 const p = await context.newPage();
 p.setDefaultTimeout(15000);
 async function login(phone) {
   const post=async(path,body)=>{const r=await fetch('http://localhost:3080/api/auth'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw new Error(`Sandbox login HTTP ${r.status}`);return r.json()};
   await post('/login',{phone,channel:'sms'});
   const auth=await post('/login/verify',{phone,code:'1111'});
   // Replace storage for this origin only; credentials are never written to disk or logs.
   await p.goto('http://localhost:3080');
   await p.evaluate(({access_token,user})=>localStorage.setItem('mymit-storage',JSON.stringify({state:{authToken:access_token,currentUser:user,isAuthenticated:true},version:0})),auth);
 }
 const shot=async(name,locator)=>{await locator.screenshot({animations:"disabled",path:fileURLToPath(new URL(name+'.png',output))});console.log('Captured '+name)};
 async function crop(name,first,last,pad=14){
   await first.scrollIntoViewIfNeeded();
   const a=await first.boundingBox(),b=await last.boundingBox(),scroll=await p.evaluate(()=>({x:scrollX,y:scrollY}));
   const x=Math.max(0,Math.min(a.x,b.x)-pad),y=Math.max(0,Math.min(a.y,b.y)-pad);
   await p.screenshot({animations:"disabled",path:fileURLToPath(new URL(name+'.png',output)),clip:{x:x+scroll.x,y:y+scroll.y,width:Math.max(a.x+a.width,b.x+b.width)+pad-x,height:Math.max(a.y+a.height,b.y+b.height)+pad-y}});
 }
 await login('79990000120');
 await p.goto('http://localhost:3080/app/main');
 await p.getByRole('button',{name:/Избранное/}).click();
 const boothTitle=()=>p.getByText('МИТ · У парка',{exact:true}).last().locator('..');
 await crop('favorites',p.getByRole('button',{name:/Избранное/}).locator('..'),boothTitle());
 await p.getByRole('button',{name:'Все МИТы',exact:true}).click();
 await p.getByRole('textbox').fill('Парк культуры');
 await crop('search',p.getByRole('textbox').locator('..'),boothTitle());
 await p.getByRole('button',{name:'Профиль',exact:true}).click();
 await p.getByText('4242',{exact:false}).waitFor();
 await shot('payment-methods',p.getByRole('region',{name:'Способы оплаты'}));
 await p.goto('http://localhost:3080/app/bookings');
 await p.getByRole('button',{name:'Предстоящие',exact:true}).click();
 await p.getByRole('button',{name:'Продлить',exact:true}).click();
 await p.getByRole('button',{name:/^30 минут/}).click();
 await crop('extension',p.getByText('Продление на',{exact:true}).locator('../../..'),p.getByRole('button',{name:'Продлить за 375 ₽',exact:true}).locator('..'),12);
 const balance=p.getByText('Минуты с баланса',{exact:true}).locator('../../..');
 await balance.getByRole('button').last().click();
 await shot('minute-balance',balance);
 await p.getByRole('button',{name:'Отмена',exact:true}).click();
 await p.getByRole('button',{name:'Перенести',exact:true}).click();
 const targetDate=new Date();targetDate.setDate(targetDate.getDate()+3);
 await p.locator('div.fixed').getByRole('button',{name:String(targetDate.getDate()),exact:true}).click();
 await p.getByRole('button',{name:'15:00',exact:true}).click();
 await p.setViewportSize({width:520,height:800});
 await crop('reschedule',p.getByRole('button',{name:'15:00',exact:true}),p.getByRole('button',{name:/Перенести на/}),20);
 await p.setViewportSize({width:390,height:844});
 await p.goto('http://localhost:3080/app/main');
 await p.getByRole('button',{name:/Избранное/}).click();
 await p.getByRole('button',{name:'Забронировать',exact:true}).click();
 await p.getByRole('heading',{name:'Бронирование',exact:true}).waitFor();
 await p.waitForTimeout(1100); // Let the application's entrance transition finish.
 await p.screenshot({animations:"disabled",path:fileURLToPath(new URL('booking.png',output))});
 await p.goto('http://localhost:3080/app/bookings');
 await p.getByRole('button',{name:'Предстоящие',exact:true}).click();
 await p.getByRole('button',{name:'Перенести',exact:true}).waitFor();
 await p.waitForTimeout(1100);
 await p.screenshot({animations:"disabled",path:fileURLToPath(new URL('bookings.png',output))});
 // Do not submit a payment, reschedule a booking, create a device or change MQTT access.
 await login('79990000001');
 await p.setViewportSize({width:1100,height:950});
 await p.goto('http://localhost:3080/admin/analytics');
 const filter=p.getByRole('combobox').last();
 await filter.locator('option',{hasText:'МИТ · У парка'}).waitFor({state:'attached'});
 await filter.selectOption({label:'МИТ · У парка'});
 await p.getByText('Обновление аналитики',{exact:true}).waitFor({state:'hidden'});
 await shot('analytics-detail',p.getByText('1 · Выручка',{exact:true}).locator('../..'));
 await p.setViewportSize({width:1680,height:1000});
 await p.goto('http://localhost:3080/admin/bookings');
 await p.getByRole('combobox').first().selectOption({label:'МИТ · У парка'});
 await p.getByText('Загрузка...',{exact:true}).waitFor({state:'hidden'});
 const f=await p.getByRole('combobox').first().locator('..').boundingBox(),t=await p.locator('tbody tr').nth(2).boundingBox();
 await p.screenshot({animations:"disabled",path:fileURLToPath(new URL('admin-bookings.png',output)),clip:{x:280,y:f.y,width:1360,height:t.y+t.height-f.y+12}});
 await p.goto('http://localhost:3080/admin/devices');
 await p.getByRole('button',{name:'Добавить устройство',exact:true}).click();
 await shot('device-provider',p.getByText('Подключение устройства',{exact:true}).locator('..'));
 console.log('Captured 9 feature fragments from the isolated MyMIT sandbox.');
} finally {await browser.close()}
