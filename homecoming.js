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
  let opening = false, openTimer, gateTimer, revealFocusTimer, untieFrame;
  const ceremony = $('ceremonial-reveal'), threadButton = $('untie-invitation'), ceremonyContent = $('ceremony-content');
  const cords = Object.fromEntries([...threadButton.querySelectorAll('[data-cord]')].map(group => [group.dataset.cord, {group, path: $('cord-' + group.dataset.cord)}]));
  const mix = (a, b, t) => a + (b - a) * t;
  const phase = (t, start, end) => {
    const p = Math.max(0, Math.min(1, (t - start) / (end - start)));
    return p * p * (3 - 2 * p);
  };
  const point = (x, y) => `${x.toFixed(2)} ${y.toFixed(2)}`;
  let cordHalfWidth = 197;
  function measureCord() {
    const bowWidth = threadButton.querySelector('.thread-bow').getBoundingClientRect().width;
    if (bowWidth) cordHalfWidth = threadButton.querySelector('.thread-keepsake').offsetWidth * 130 / bowWidth;
    if (!ceremony.classList.contains('untying')) drawCord(0);
  }
  function strand(name, d, opacity = 1) {
    cords[name].path.setAttribute('d', d);
    cords[name].group.style.opacity = opacity;
  }
  // The loops retract into a shared knot anchor as their free ends lengthen.
  // Only after both bights clear the crossing do the two loose cords peel away.
  function drawCord(t) {
    const tension = phase(t, .02, .16), rightPull = phase(t, .17, .47), leftPull = phase(t, .43, .67);
    const release = phase(t, .68, 1), unwind = phase(t, .48, .69);
    const x = 130 + tension * 3 + rightPull * 4 - leftPull * 5, y = 82 + tension * 2;
    const leftX = x - release * 540, rightX = x + 4 + release * 540;
    const settle = Math.sin(release * Math.PI) * (1 - release);
    const leftY = y + settle * 100, rightY = y + settle * 76;
    const sway = Math.sin(release * Math.PI * 3) * (1 - release) * release * 16;
    strand('standing-left', `M${point(leftX - cordHalfWidth, 82 + settle * 25)} C${point(leftX - cordHalfWidth * .65, 82 + settle * 55)} ${point(leftX - 82, leftY - 7 + sway)} ${point(leftX, leftY)}`);
    strand('standing-right', `M${point(rightX + cordHalfWidth - 4, 82 + settle * 20)} C${point(rightX + cordHalfWidth * .65, 82 + settle * 40)} ${point(rightX + 85, rightY - 7 - sway)} ${point(rightX, rightY)}`);
    const leftSize = (1 + rightPull * .1) * (1 - leftPull), rightSize = 1 - rightPull;
    strand('loop-left', `M${point(leftX, leftY - 3)} C${point(leftX - 41 * leftSize, leftY - 39 * leftSize)} ${point(leftX - 70 * leftSize, leftY - 58 * leftSize)} ${point(leftX - 93 * leftSize, leftY - 35 * leftSize)} C${point(leftX - 118 * leftSize, leftY - 2 * leftSize)} ${point(leftX - 59 * leftSize, leftY + 21 * leftSize)} ${point(leftX, leftY + 4)}`, phase(leftSize, .015, .085));
    strand('loop-right', `M${point(rightX, rightY - 3)} C${point(rightX + 35 * rightSize, rightY - 44 * rightSize)} ${point(rightX + 73 * rightSize, rightY - 56 * rightSize)} ${point(rightX + 90 * rightSize, rightY - 36 * rightSize)} C${point(rightX + 117 * rightSize, rightY - 2 * rightSize)} ${point(rightX + 53 * rightSize, rightY + 21 * rightSize)} ${point(rightX, rightY + 4)}`, phase(rightSize, .015, .085));
    const leftEndX = leftX - 66 - leftPull * 122, rightEndX = rightX + 79 + rightPull * 124;
    strand('tail-left', `M${point(leftX - 1, leftY + 3)} C${point(leftX - 26 - leftPull * 28, leftY + mix(32, 16, leftPull) + sway)} ${point(leftEndX + mix(53, 48, leftPull), leftY + mix(63, 39, leftPull) + settle * 55)} ${point(leftEndX, leftY + 83 - leftPull * 24 + settle * 82)}`);
    strand('tail-right', `M${point(rightX, rightY + 3)} C${point(rightX + 31 + rightPull * 25, rightY + mix(30, 11, rightPull) - sway)} ${point(rightEndX - 37, rightY + mix(65, 29, rightPull) + settle * 40)} ${point(rightEndX, rightY + 84 - rightPull * 39 + settle * 65)}`);
    const knotOpacity = 1 - phase(t, .62, .70);
    strand('binding', `M${point(x - 6, y - 8)} C${point(x + 10 + unwind * 14, y - 18 + unwind * 22)} ${point(x + 14 + unwind * 30, y + 3 + unwind * 15)} ${point(x + 3 + unwind * 43, y + 9 + unwind * 15)} C${point(x - 5 + unwind * 55, y + 12)} ${point(x - 8 + unwind * 65, y + 4)} ${point(x - 5 + unwind * 74, y - 4)}`, knotOpacity);
    strand('crossing', `M${point(x - 7 - unwind * 12, y + 6)} C${point(x - 7, y + 1)} ${point(x + unwind * 16, y - 5)} ${point(x + 9 + unwind * 22, y - 7)}`, knotOpacity);
    ceremony.style.setProperty('--cord-release', release.toFixed(3));
    threadButton.style.setProperty('--cord-lift', `${(tension * (1 - unwind) * 2).toFixed(2)}px`);
  }
  function revealInvitation() {
    if (ceremony.classList.contains('unfolded')) return;
    ceremony.classList.add('unfolded');
    ceremonyContent.removeAttribute('aria-hidden');
    ceremonyContent.inert = false;
    threadButton.setAttribute('aria-expanded', 'true');
    revealFocusTimer = setTimeout(() => {
      threadButton.hidden = true;
      $('reminisce-title').focus({preventScroll:true});
    }, reduced.matches ? 0 : 1300);
  }
  function pullCord() {
    const start = performance.now();
    function frame(now) {
      const progress = reduced.matches ? 1 : Math.min(1, (now - start) / 4800);
      drawCord(progress);
      if (progress >= .92) revealInvitation();
      if (progress < 1) untieFrame = requestAnimationFrame(frame);
    }
    untieFrame = requestAnimationFrame(frame);
  }
  ceremony.classList.add('ready-to-unfold');
  measureCord();
  window.addEventListener('resize', measureCord);
  ceremonyContent.setAttribute('aria-hidden', 'true');
  ceremonyContent.inert = true;
  threadButton.addEventListener('click', () => {
    if (ceremony.classList.contains('untying') || ceremony.classList.contains('unfolded')) return;
    ceremony.classList.add('untying');
    threadButton.disabled = true;
    if (reduced.matches) revealInvitation(); else pullCord();
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
    clearTimeout(openTimer); clearTimeout(gateTimer); clearTimeout(revealFocusTimer); cancelAnimationFrame(untieFrame); drawCord(0); opening = false; seal.disabled = false;
    window.scrollTo({top:0,behavior:'instant'});
    gate.hidden = false; gate.classList.remove('opening','departed');
    document.body.classList.add('sealed'); main.inert = true;
    main.classList.remove('invitation-awake');
    if (chapterObserver) chapterObserver.disconnect();
    chapters.forEach(chapter => chapter.classList.remove('chapter-entered'));
    ceremony.classList.remove('untying', 'unfolded');
    ceremonyContent.setAttribute('aria-hidden', 'true');
    ceremonyContent.inert = true;
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
