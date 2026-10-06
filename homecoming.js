(() => {
  'use strict';
  const event = window.ALUMNI_EVENT, $ = id => document.getElementById(id);
  const gate = $('arrival-screen'), main = $('homecoming'), seal = $('open-letter');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const music = $('reunion-music'), musicToggle = $('music-toggle');
  let musicWanted = true;
  music.volume = .42;
  function updateMusicControl() {
    const playing = !music.paused;
    musicToggle.setAttribute('aria-pressed', String(playing));
    musicToggle.setAttribute('aria-label', playing ? 'Mute reunion music' : 'Play reunion music');
    $('music-label').textContent = playing ? 'Music on' : 'Music off';
  }
  function playMusic() { if (musicWanted) music.play().catch(updateMusicControl); }
  music.addEventListener('play', updateMusicControl);
  music.addEventListener('pause', updateMusicControl);
  music.addEventListener('error', () => { $('music-label').textContent = 'Retry music'; });
  musicToggle.addEventListener('click', () => {
    musicWanted = music.paused;
    if (musicWanted) playMusic(); else music.pause();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) music.pause();
    else if (gate.hidden && musicWanted) playMusic();
  });
  let opening = false, openTimer, gateTimer, untieTimer;
  const ceremony = $('ceremonial-reveal'), threadButton = $('untie-invitation'), ceremonyContent = $('ceremony-content');
  ceremony.classList.add('ready-to-unfold');
  ceremonyContent.setAttribute('aria-hidden', 'true');
  threadButton.addEventListener('click', () => {
    if (ceremony.classList.contains('unfolded')) return;
    ceremony.classList.add('unfolded');
    ceremonyContent.removeAttribute('aria-hidden');
    threadButton.setAttribute('aria-expanded', 'true');
    threadButton.disabled = true;
    untieTimer = setTimeout(() => {
      threadButton.hidden = true;
      $('reminisce-title').focus();
    }, reduced.matches ? 0 : 1750);
  });
  const chapters = [...document.querySelectorAll('.memories, .quote-section, .the-letter, .come-home')];
  let chapterObserver;
  if ('IntersectionObserver' in window) {
    chapterObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      entry.target.classList.toggle('chapter-entered', entry.isIntersecting);
    }), {threshold: .08, rootMargin: '0px 0px -8% 0px'});
  }
  function finishOpening() {
    window.scrollTo({top:0,behavior:'instant'});
    gate.classList.add('departed'); main.inert = false;
    document.body.classList.remove('sealed');
    main.classList.add('invitation-awake');
    if (chapterObserver) chapters.forEach(chapter => chapterObserver.observe(chapter));
    musicToggle.hidden = false;
    $('welcome-home').focus({preventScroll:true});
    gateTimer = setTimeout(() => { gate.hidden = true; opening = false; }, reduced.matches ? 0 : 1150);
  }
  function openLetter() {
    if (opening) return;
    opening = true; seal.disabled = true;
    playMusic();
    gate.classList.add('opening');
    openTimer = setTimeout(finishOpening, reduced.matches ? 0 : 4250);
  }
  function resetLetter() {
    clearTimeout(openTimer); clearTimeout(gateTimer); clearTimeout(untieTimer); opening = false; seal.disabled = false;
    window.scrollTo({top:0,behavior:'instant'});
    gate.hidden = false; gate.classList.remove('opening','departed');
    document.body.classList.add('sealed'); main.inert = true;
    main.classList.remove('invitation-awake');
    if (chapterObserver) chapterObserver.disconnect();
    chapters.forEach(chapter => chapter.classList.remove('chapter-entered'));
    ceremony.classList.remove('unfolded');
    ceremonyContent.setAttribute('aria-hidden', 'true');
    threadButton.hidden = false; threadButton.disabled = false;
    threadButton.setAttribute('aria-expanded', 'false');
    musicToggle.hidden = true; music.pause();
    seal.focus({preventScroll:true});
  }
  seal.addEventListener('click',openLetter);
  $('reopen-letter').addEventListener('click',resetLetter);
  gate.hidden = false; document.body.classList.add('sealed'); main.inert = true;
  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('js-reveal');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), {threshold:0.12,rootMargin:'0px 0px -20px 0px'});
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }
  function countdown() {
    const seconds = Math.max(0,Math.floor((new Date(event.startISO)-Date.now())/1000));
    const values = {days:Math.floor(seconds/86400),hours:Math.floor(seconds/3600)%24,minutes:Math.floor(seconds/60)%60,seconds:seconds%60};
    Object.entries(values).forEach(([key,value])=>document.querySelector(`[data-count="${key}"]`).textContent=String(value).padStart(2,'0'));
    document.querySelector('.countdown').setAttribute('aria-label',`${values.days} days, ${values.hours} hours, ${values.minutes} minutes, ${values.seconds} seconds until registration`);
    if (!seconds) document.querySelector('.countdown-wrap>p').textContent = Date.now()<new Date(event.endISO)?'Today, we come together.':'Reminisce’26 · 17 October 2026';
  }
  const escape = value=>value.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
  const date = value=>new Date(value).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  function fold(line) { let result='',chunk=''; for(const char of line){if(new TextEncoder().encode(chunk+char).length>74){result+=chunk+'\r\n ';chunk='';}chunk+=char;}return result+chunk; }
  $('calendar-button').addEventListener('click',()=>{
    const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//SRM Alumni//Reminisce26//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:reminisce26-srmtrichy-20261017',`DTSTAMP:${date(Date.now())}`,`DTSTART:${date(event.startISO)}`,`DTEND:${date(event.endISO)}`,`SUMMARY:${escape(event.name+' — Alumni Homecoming')}`,`LOCATION:${escape(event.venue+', '+event.address)}`,`DESCRIPTION:${escape(event.institution+'\n'+event.faculty+'\nRegistration from 9:00 AM. Asia/Kolkata.')}`,'END:VEVENT','END:VCALENDAR'];
    const url=URL.createObjectURL(new Blob([lines.map(fold).join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'}));
    const link=document.createElement('a'); link.href=url;link.download='reminisce26-srm-alumni-meet.ics';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
    $('action-message').textContent='Date saved for your calendar: 17 October, 9 AM–4 PM IST.';
  });
  $('directions-link').href=event.mapUrl;
  $('share-button').addEventListener('click',async()=>{
    const url=location.origin+location.pathname;
    try { if(navigator.share) await navigator.share({title:'Reminisce’26 — You’ve been missed.',text:'We left with dreams. Let’s return with stories. SRM alumni homecoming · 17 October 2026.',url}); else {await navigator.clipboard.writeText(url);$('action-message').textContent='Invitation link copied. Send a little nostalgia to an old friend.';} }
    catch(error){if(error.name!=='AbortError')$('action-message').textContent='Share this invitation: '+url;}
  });
  countdown();setInterval(countdown,1000);
})();
