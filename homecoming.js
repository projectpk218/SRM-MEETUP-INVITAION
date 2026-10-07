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
  let opening = false, openTimer, gateTimer, untieTimer, revealFocusTimer, untieFrame;
  const ceremony = $('ceremonial-reveal'), threadButton = $('untie-invitation'), ceremonyContent = $('ceremony-content');
  const cordParts = [
    {selector: '.thread-loop-left', draw: v => `M${v[0]} ${v[1]} C${v[2]} ${v[3]} ${v[4]} ${v[5]} ${v[6]} ${v[7]} C${v[8]} ${v[9]} ${v[10]} ${v[11]} ${v[12]} ${v[13]}`, frames: [
      [130,72,104,27,46,19,37,59,29,96,82,113,130,72],
      [130,72,103,35,54,20,43,60,36,92,89,106,130,72],
      [130,72,98,20,24,20,23,61,18,108,89,112,130,72],
      [130,72,100,70,66,71,32,72,13,72,-4,72,-28,72]
    ]},
    {selector: '.thread-loop-right', draw: v => `M${v[0]} ${v[1]} C${v[2]} ${v[3]} ${v[4]} ${v[5]} ${v[6]} ${v[7]} C${v[8]} ${v[9]} ${v[10]} ${v[11]} ${v[12]} ${v[13]}`, frames: [
      [130,72,156,27,214,19,223,59,231,96,178,113,130,72],
      [130,72,160,20,229,13,238,61,241,99,171,111,130,72],
      [130,72,150,51,177,52,179,69,181,87,151,89,130,72],
      [130,72,168,70,207,71,240,72,261,72,282,72,303,72]
    ]},
    {selector: '.thread-tail-left', draw: v => `M${v[0]} ${v[1]} C${v[2]} ${v[3]} ${v[4]} ${v[5]} ${v[6]} ${v[7]}`, frames: [
      [127,77,97,87,65,110,27,124],
      [126,76,99,85,60,113,8,139],
      [129,74,91,80,46,96,-30,109],
      [130,72,78,73,16,74,-44,75]
    ]},
    {selector: '.thread-tail-right', draw: v => `M${v[0]} ${v[1]} C${v[2]} ${v[3]} ${v[4]} ${v[5]} ${v[6]} ${v[7]}`, frames: [
      [133,77,163,87,195,110,233,124],
      [136,78,174,92,220,120,268,141],
      [134,75,176,83,236,93,297,102],
      [130,72,182,73,244,74,312,75]
    ]}
  ].map(part => ({...part, element: threadButton.querySelector(part.selector)}));
  function drawCord(progress) {
    const marks = [0, .25, .62, 1];
    const segment = progress < marks[1] ? 0 : progress < marks[2] ? 1 : 2;
    const amount = (progress - marks[segment]) / (marks[segment + 1] - marks[segment]);
    const eased = amount * amount * (3 - 2 * amount);
    cordParts.forEach(part => {
      const from = part.frames[segment], to = part.frames[segment + 1];
      part.element.setAttribute('d', part.draw(from.map((value, i) => +(value + (to[i] - value) * eased).toFixed(1))));
    });
  }
  function pullCord() {
    const start = performance.now();
    function frame(now) {
      const progress = Math.min(1, (now - start) / 3000);
      drawCord(progress);
      if (progress < 1) untieFrame = requestAnimationFrame(frame);
    }
    untieFrame = requestAnimationFrame(frame);
  }
  ceremony.classList.add('ready-to-unfold');
  ceremonyContent.setAttribute('aria-hidden', 'true');
  threadButton.addEventListener('click', () => {
    if (ceremony.classList.contains('untying') || ceremony.classList.contains('unfolded')) return;
    ceremony.classList.add('untying');
    threadButton.disabled = true;
    if (!reduced.matches) pullCord();
    untieTimer = setTimeout(() => {
      ceremony.classList.add('unfolded');
      ceremonyContent.removeAttribute('aria-hidden');
      threadButton.setAttribute('aria-expanded', 'true');
      revealFocusTimer = setTimeout(() => {
        threadButton.hidden = true;
        $('reminisce-title').focus();
      }, reduced.matches ? 0 : 900);
    }, reduced.matches ? 0 : 3000);
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
    clearTimeout(openTimer); clearTimeout(gateTimer); clearTimeout(untieTimer); clearTimeout(revealFocusTimer); cancelAnimationFrame(untieFrame); drawCord(0); opening = false; seal.disabled = false;
    window.scrollTo({top:0,behavior:'instant'});
    gate.hidden = false; gate.classList.remove('opening','departed');
    document.body.classList.add('sealed'); main.inert = true;
    main.classList.remove('invitation-awake');
    if (chapterObserver) chapterObserver.disconnect();
    chapters.forEach(chapter => chapter.classList.remove('chapter-entered'));
    ceremony.classList.remove('untying', 'unfolded');
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
