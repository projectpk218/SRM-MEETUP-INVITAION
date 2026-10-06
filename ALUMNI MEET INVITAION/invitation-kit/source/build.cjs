const fs=require('fs'),path=require('path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--allow-file-access-from-files']});
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 await page.goto('file:///'+path.join(root,'invitation-editor.html').replaceAll('\\','/'));
 const model=await page.evaluate(()=>({defaults:Invitation.defaults,tones:Invitation.tones,keys:Invitation.keys}));
 fs.mkdirSync(path.join(root,'exports'),{recursive:true});fs.mkdirSync(path.join(root,'output/pdf'),{recursive:true});fs.mkdirSync(path.join(root,'qa'),{recursive:true});
 fs.writeFileSync(path.join(root,'event-details.json'),JSON.stringify({version:1,tone:'premium-formal',format:'portrait',details:model.defaults},null,2));
 const audits=[];
 for(const tone of Object.keys(model.tones)){
   const prefix=`[institution]_[event-brand]_[yyyy-mm-dd]`,stem=c=>`${prefix}_${c}_${tone}_v01`;
   for(const format of ['portrait','story']){
    const result=await page.evaluate(({tone,format})=>Invitation.poster(Invitation.defaults,tone,format),{tone,format});
    if(result.overflow)throw Error(`Overflow: ${tone} ${format}`);
    const svgPath=path.join(root,'exports',stem(format)+'.svg');fs.writeFileSync(svgPath,result.svg);
    const render=await browser.newPage({viewport:{width:1080,height:result.height},deviceScaleFactor:1});
    await render.setContent(`<html><body style="margin:0">${result.svg}</body></html>`);
    const img=await render.locator('svg').screenshot();
    const channels=format==='portrait'?['instagram-post','whatsapp-share']:['instagram-story','whatsapp-status'];
    channels.forEach(c=>fs.writeFileSync(path.join(root,'exports',stem(c)+'.png'),img));
    audits.push({tone,format,width:1080,height:result.height,overflow:result.overflow,contentBottom:result.contentBottom,ctaTop:result.ctaTop});await render.close();
   }
   const content=await page.evaluate(tone=>({html:Invitation.email(Invitation.defaults,tone),plain:Invitation.plain(Invitation.defaults,tone),contrast:[Invitation.contrast(Invitation.tones[tone].ink,Invitation.tones[tone].paper),Invitation.contrast(Invitation.tones[tone].body,Invitation.tones[tone].paper)]}),tone);
   fs.writeFileSync(path.join(root,'exports',stem('email')+'.html'),content.html);fs.writeFileSync(path.join(root,'exports',stem('email')+'.txt'),content.plain);
   audits.push({tone,contrast:{inkOnPaper:content.contrast[0],bodyOnPaper:content.contrast[1],paperOnInk:content.contrast[0]},normalTextAA:content.contrast.every(r=>r>=4.5),gold:'Decorative only'});
 }
 for(const proof of [false,true]){
   const html=await page.evaluate(proof=>Invitation.pdf(Invitation.defaults,'premium-formal',proof),proof);
   const p=await browser.newPage();await p.setContent(html);await p.emulateMedia({media:'print'});
   fs.writeFileSync(path.join(root,'qa',proof?'print-proof.html':'digital-a5.html'),html);
   await p.pdf({path:path.join(root,'output/pdf',`[institution]_[event-brand]_[yyyy-mm-dd]_invite-${proof?'print-proof':'digital'}_premium-formal_v01.pdf`),width:'148mm',height:'210mm',printBackground:true,preferCSSPageSize:true,tagged:true,outline:true});await p.close();
 }
 const missing=model.keys.map(k=>'['+k+']');
 fs.writeFileSync(path.join(root,'design-notes.md'),`# Design handoff\n\nPremium / Formal leads the kit. Alternative tones are selectable in the editor and provided as PNG/email exports. Compact portrait artwork prioritises event name, date, time, location, speaker, three agenda highlights, dress, RSVP and contact. Full host/contact details remain in email and A5 PDF. Story adds the full description and address; supplied hero photography replaces the description region in the Story. The portrait is deliberately typographic.\n\nNo institutional identity, dates, people or venue have been invented. No image-generation, video, GitHub repository, publishing or messaging was required. Official logo, event mark and hero-photo slots await approved assets. Abstract linework signifies connection and is not a campus depiction.\n\nVERIFY INSTITUTION BRAND GUIDELINES. Preserve official logo geometry, clear space and minimum size. The editor uses conservative space; final approval depends on the institution.\n\n## Colour palettes\n${Object.entries(model.tones).map(([k,t])=>`- ${t.name}: ink ${t.ink}; paper ${t.paper}; body ${t.body}; accent ${t.accent}.`).join('\n')}\n\n## Typography\nPremium / Formal and Warm-Casual: Georgia display with Arial body. Modern-MBA: Arial display and body. Native Windows fonts; no external font download. Respect font licensing when redistributing editable files. Approved font overrides require local installation.\n\n## Remaining placeholders\n${missing.map(v=>'- '+v).join('\n')}\n\nSOCIAL_URL and HERO_IMAGE_ALT are supplemental fields to support clickable social links and descriptive image alternatives. Optional fields can be removed from the source after event content is finalised. Public outputs never include VIRTUAL_LINK.\n\n## Production limitations\n- Missing RSVP/map/contact/social destinations cannot be link-tested. Labels are inactive until supplied.\n- Static social images require accessible accompanying captions and a separately clickable RSVP link.\n- Uploaded images in email use relative assets paths; host them through the sending platform. Do not assume base64 image support in email.\n- Email structure uses presentation tables and inline essential styles; actual Outlook/Gmail/device inbox testing remains.\n- Digital PDF is tagged and selectable, not certified PDF/UA. Manual screen-reader review remains.\n- Print output is an A5 RGB proof, no bleed, not PDF/X and not press-ready. Printer ICC profile, output intent, trim/bleed and preflight remain.\n- Long replacement values and custom fonts require a fresh layout review; the editor flags detected vertical overflow.\n- File slugs retain placeholders until real institution, event and date are supplied.\n`);
 let copy='# Copy sheet\n\nEvent name is always [EVENT_BRAND]. Copy intentionally avoids assuming an evening or an in-person event.\n';
 for(const t of Object.values(model.tones))copy+=`\n## ${t.name}\n\n- Headline: ${t.headline}\n- Hook: ${t.hook}\n- Description: ${t.description}\n- CTA: ${t.cta}\n- Reminder: ${t.reminder}\n- Tagline: ${t.tagline}\n- Official hashtag: [EVENT_HASHTAG]\n`;
 fs.writeFileSync(path.join(root,'copy-sheet.md'),copy);
 fs.writeFileSync(path.join(root,'alt-text-manifest.csv'),'asset name,purpose,recommended alt text,decorative\ninstitution-logo.png,Official institution identity,[INSTITUTION],no\nevent-mark.png,Optional mark beside live event title,,yes\nhero-photo.png,Approved authentic campus or alumni photograph,[HERO_IMAGE_ALT] - describe the actual supplied photograph,no\nconnection-motif,Abstract lines representing reconnection,,yes\nsocial-portrait.png,Complete invitation,"Invitation to [EVENT_BRAND] at [INSTITUTION] on [EVENT_DATE], [EVENT_TIME] [TIME_ZONE], [VENUE_NAME]. RSVP by [RSVP_DEADLINE]: [RSVP_URL]. Include program and contact details in accompanying text.",no\nsocial-story.png,Complete vertical invitation,Use the portrait alternative and include any additional program details in accompanying text,no\n');
 fs.writeFileSync(path.join(root,'accessibility-audit.json'),JSON.stringify({status:'Draft: placeholders unresolved',checks:audits,pdf:'Tagged/selectable. PDF/UA not certified.',email:'Live text, semantic headings, presentation tables, CTA target greater than 44 CSS px. Unresolved links inactive.',pending:['Authentic assets and alt text','Final data and URL checks','Institution brand compliance','Inbox testing','PDF screen-reader review','Printer specifications and preflight']},null,2));
 await page.screenshot({path:path.join(root,'qa/editor-desktop.png'),fullPage:false});
 await browser.close();console.log(JSON.stringify({exports:fs.readdirSync(path.join(root,'exports')).length,pdfs:2,layoutChecks:audits.filter(x=>x.format).length}));
})().catch(e=>{console.error(e);process.exit(1)});
