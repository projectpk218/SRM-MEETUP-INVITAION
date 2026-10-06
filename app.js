(() => {
  'use strict';
  const event = window.ALUMNI_EVENT || {};
  const missing = value => !value || /^\[.*\]$/.test(value);
  const validUrl = value => { try { const u = new URL(value, location.href); return /^https?:$/.test(u.protocol) && value ? u.href : ''; } catch { return ''; } };
  const shell = document.getElementById('site-shell');
  const welcome = document.getElementById('welcome');
  const opener = document.getElementById('open-invitation');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');
  document.querySelectorAll('[data-event]').forEach(el => {const value = event[el.dataset.event]; if (typeof value === 'string' && value) el.textContent = value;});
  document.querySelectorAll('[data-agenda]').forEach(el => {const value = event.agenda?.[Number(el.dataset.agenda)]; if (value) {el.textContent = value;if (!missing(value)) el.nextElementSibling.hidden = true;}});
  if (!missing(event.brand)) document.title = `${event.brand} · Alumni invitation`;
  const guest = new URLSearchParams(location.search).get('guest');
  if (guest && guest.length <= 70) document.getElementById('guest-greeting').textContent = `Dear ${guest}, this invitation is for you.`;
  const logoUrl = validUrl(event.logoUrl);
  if (logoUrl) {const logo = document.getElementById('official-logo');logo.src = logoUrl;logo.alt = event.institution;logo.hidden = false;logo.onerror = () => logo.hidden = true;}
  const heroUrl = validUrl(event.heroImageUrl);
  if (heroUrl && !missing(event.heroImageAlt)) {const hero = document.getElementById('approved-hero');hero.src = heroUrl;hero.alt = event.heroImageAlt;hero.onload = () => {hero.hidden = false;hero.previousElementSibling.hidden = true;hero.parentElement.removeAttribute('role');hero.parentElement.removeAttribute('aria-label');};}
  function openInvitation() {if(welcome.hidden || welcome.classList.contains('opening'))return;welcome.classList.add('opening');shell.inert = false;document.body.style.overflow = '';setTimeout(() => {welcome.hidden = true;document.getElementById('invitation').focus({preventScroll:true});}, reduced ? 0 : 950);}
  if (!location.hash) {welcome.hidden = false;shell.inert = true;document.body.style.overflow = 'hidden';opener.focus({preventScroll:true});}
  opener.addEventListener('click', openInvitation);
  document.getElementById('skip-opening').addEventListener('click', openInvitation);
  welcome.addEventListener('keydown', e => {if(e.key === 'Escape')openInvitation();if(e.key === 'Tab'){const last=document.getElementById('skip-opening');if(e.shiftKey && document.activeElement===opener){e.preventDefault();last.focus();}else if(!e.shiftKey && document.activeElement===last){e.preventDefault();opener.focus();}}});
  document.querySelector('.skip-link').addEventListener('click', openInvitation);
  const toggle=document.getElementById('menu-toggle'),menu=document.getElementById('mobile-menu');
  toggle.addEventListener('click',()=>{const expanded=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!expanded));menu.hidden=expanded;});
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.hidden=true;toggle.setAttribute('aria-expanded','false');}));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){menu.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.focus();}});
  const liveRsvp=validUrl(event.rsvpUrl),rsvpLink=document.getElementById('rsvp-link');
  if(liveRsvp){rsvpLink.href=liveRsvp;rsvpLink.removeAttribute('aria-disabled');rsvpLink.firstChild.textContent='Reserve your place ';document.getElementById('rsvp-note').textContent='Continue to the official registration page to confirm your attendance.';}
  const map=validUrl(event.mapUrl),mapLink=document.getElementById('map-link');
  if(map){mapLink.href=map;mapLink.target='_blank';mapLink.rel='noopener noreferrer';mapLink.removeAttribute('aria-disabled');document.getElementById('map-note').hidden=true;}
  if(event.mode==='VIRTUAL'){document.getElementById('facts-venue').textContent='Join us online';document.getElementById('venue-name').textContent='A gathering, wherever you are';document.getElementById('venue-address').textContent='Joining details will be shared with confirmed attendees.';mapLink.hidden=true;document.getElementById('map-note').hidden=true;}
  if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(event.contactEmail || ''))document.getElementById('contact-email').href='mailto:'+event.contactEmail;
  if(/^[+\d\s()-]{7,22}$/.test(event.contactPhone || ''))document.getElementById('contact-phone').href='tel:'+event.contactPhone.replace(/[\s()-]/g,'');
  const start = typeof event.startISO === 'string' && /(?:Z|[+-]\d{2}:\d{2})$/.test(event.startISO) ? new Date(event.startISO) : null;
  const hasDate = start && Number.isFinite(start.getTime());
  if(hasDate){const tick=()=>{const diff=Math.max(0,start.getTime()-Date.now()),seconds=Math.floor(diff/1000);const counts={days:Math.floor(seconds/86400),hours:Math.floor(seconds/3600)%24,minutes:Math.floor(seconds/60)%60,seconds:seconds%60};for(const[k,v]of Object.entries(counts))document.querySelector(`[data-count="${k}"]`).textContent=String(v).padStart(2,'0');document.getElementById('countdown').setAttribute('aria-label',diff>0?`${counts.days} days and ${counts.hours} hours until the gathering`:'The event date has arrived');document.getElementById('countdown-caption').textContent=diff>0?'Looking forward to seeing you again.':'The event date has arrived. Check the programme for details.';};tick();setInterval(tick,1000);}
  const calendar=document.getElementById('calendar-button');
  if(hasDate&&!missing(event.brand)){calendar.disabled=false;calendar.addEventListener('click',()=>{const escape=s=>String(s).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');const stamp=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Alumni invitation//EN','BEGIN:VEVENT','UID:'+start.getTime()+'@alumni-invitation','DTSTAMP:'+stamp(new Date()),'DTSTART:'+stamp(start),'SUMMARY:'+escape(event.brand),'DESCRIPTION:'+escape('Alumni gathering at '+event.institution),'LOCATION:'+escape(event.mode==='VIRTUAL'?'Online':event.venue)];const end=new Date(event.endISO);if(event.endISO&&Number.isFinite(end.getTime())&&end>start)lines.push('DTEND:'+stamp(end));lines.push('END:VEVENT','END:VCALENDAR');const blob=new Blob([lines.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='alumni-gathering.ics';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);});}
  const status=document.getElementById('action-message');
  document.getElementById('share-button').addEventListener('click',async()=>{const url=new URL(location.href);url.search='';url.hash='';try{if(navigator.share){await navigator.share({title:missing(event.brand)?'Alumni invitation':event.brand,text:'An invitation to reconnect.',url:url.href});status.textContent='Sharing options opened.';}else{await navigator.clipboard.writeText(url.href);status.textContent='Invitation link copied. This review link follows the website’s access settings.';}}catch(e){if(e.name!=='AbortError')status.textContent='Copy the address from your browser to share this invitation.';}});
  if('IntersectionObserver'in window&&!reduced){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.remove('waiting');observer.unobserve(entry.target);}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>{el.classList.add('waiting');observer.observe(el);});}
})();
