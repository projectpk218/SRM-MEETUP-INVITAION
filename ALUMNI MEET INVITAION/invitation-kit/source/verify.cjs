const fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require('playwright');
(async()=>{
const root=path.resolve(__dirname,'..'),browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},acceptDownloads:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('file:///'+path.join(root,'invitation-editor.html').replaceAll('\\','/'));
assert((await page.locator('#preview').innerText()).includes('[EVENT_BRAND]'));
await page.locator('#tone').selectOption('modern-mba');assert((await page.locator('#preview').innerText()).includes('Confirm Attendance'));
await page.locator('#format').selectOption('story');assert.equal(await page.locator('#preview svg').getAttribute('height'),'1920');
await page.locator('[data-field="EVENT_BRAND"]').fill('QA & <example>');assert((await page.locator('#preview').innerText()).includes('QA & <example>'));assert.equal(await page.locator('#preview example').count(),0);
await page.locator('[data-field="EVENT_MODE"]').selectOption('VIRTUAL');assert((await page.locator('#preview').innerText()).includes('Virtual alumni gathering'));assert(!(await page.locator('#preview').innerText()).includes('[VENUE_NAME]'));
await page.reload();
const dl=page.waitForEvent('download');await page.locator('#png').click();const download=await dl;await download.saveAs(path.join(root,'qa/browser-download.png'));assert.equal(await download.failure(),null);
const urlAudit=await page.evaluate(()=>{const d={...Invitation.defaults,RSVP_URL:'https://example.org/rsvp',MAP_LINK:'https://example.org/map',CONTACT_EMAIL:'alumni@example.org',CONTACT_PHONE:'+91 1234567890',VIRTUAL_LINK:'https://private.example.org/secret'};const doc=new DOMParser().parseFromString(Invitation.email(d),'text/html');const urls=[...doc.querySelectorAll('a')].map(a=>a.getAttribute('href'));const bad=Invitation.email({...d,RSVP_URL:'javascript:alert(1)'});return {urls,leaks:doc.body.textContent.includes('private.example.org'),badLink:bad.includes('href="javascript:'),longOverflow:Invitation.poster({...d,AGENDA_HIGHLIGHT_1:'A long program description '.repeat(30)}).overflow};});
assert(urlAudit.urls.includes('https://example.org/rsvp'));assert(urlAudit.urls.includes('mailto:alumni@example.org'));assert(urlAudit.urls.includes('tel:+911234567890'));assert(!urlAudit.leaks);assert(!urlAudit.badLink);assert(urlAudit.longOverflow);
const mobile=[];for(const width of [320,390,768]){await page.setViewportSize({width,height:1000});const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert(!overflow,'Editor overflows at '+width);mobile.push({width,horizontalOverflow:overflow});}await page.screenshot({path:path.join(root,'qa/editor-mobile.png'),fullPage:false});
// Inspect generated email separately so the editor runtime stays isolated.
const mail=await browser.newPage({viewport:{width:320,height:1000}});for(const tone of ['premium-formal','warm-casual','modern-mba']){const file=fs.readdirSync(path.join(root,'exports')).find(x=>x.endsWith(`email_${tone}_v01.html`));await mail.goto('file:///'+path.join(root,'exports',file).replaceAll('\\','/'));assert(!await mail.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'Email overflow '+tone);assert.equal(await mail.locator('h1').count(),1);assert.equal(await mail.locator('img').count(),0);}
assert.deepEqual(errors,[]);fs.writeFileSync(path.join(root,'qa/verification.json'),JSON.stringify({passed:true,checks:['Tone selection','Story dimensions','Live edit and HTML escaping','Virtual venue handling','PNG download','URL and contact links','Private joining URL omission','Unsafe URL rejection','Long-copy overflow warning','Responsive editor and email'],mobile,errors},null,2));
await browser.close();console.log('Functional checks passed');
})().catch(e=>{console.error(e);process.exit(1)});
