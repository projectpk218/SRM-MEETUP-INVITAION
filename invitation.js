(() => {
  'use strict';
  const event = window.ALUMNI_EVENT;
  const $ = id => document.getElementById(id);
  const scenes = [...document.querySelectorAll('.scene')];
  const labels = ['An invitation awaits', 'Welcome home', 'Your invitation', 'Honoured leadership', 'Your hosts', 'A day to reconnect', 'Until we meet again'];
  const book = $('invitation-book'), stage = $('page-stage'), dialog = $('programme-dialog');
  let current = 0, reading = false, animationTimer;
  function show(index, focus = true) {
    const previous = current;
    current = Math.max(0, Math.min(6, index));
    scenes.forEach((scene, i) => { scene.hidden = !reading && i !== current; });
    book.classList.toggle('cover-active', current === 0 && !reading);
    $('page-controls').hidden = reading || current === 0;
    $('page-label').textContent = `${labels[current]} · ${current + 1} of 7`;
    $('next-button').innerHTML = current === 6 ? 'Replay <span aria-hidden="true">↺</span>' : 'Continue <span aria-hidden="true">→</span>';
    [...$('journey-dots').children].forEach((dot, i) => dot.classList.toggle('active', i === current));
    book.classList.remove('turning', 'backward');
    clearTimeout(animationTimer);
    stage.scrollTop = 0;
    if (focus && !reading) {
      void book.offsetWidth;
      book.classList.toggle('backward', current < previous);
      book.classList.add('turning');
      scenes[current].querySelector('.scene-heading').focus({preventScroll:true});
      $('scene-announcement').textContent = `${labels[current]}. Page ${current + 1} of 7.`;
      animationTimer = setTimeout(() => book.classList.remove('turning', 'backward'), 650);
    }
  }
  const next = () => show(current === 6 ? 0 : current + 1);
  $('open-invitation').addEventListener('click', () => show(1));
  $('next-button').addEventListener('click', next);
  $('back-button').addEventListener('click', () => show(current - 1));
  $('replay-button').addEventListener('click', () => { if (reading) toggleReading(); show(0); });
  document.addEventListener('keydown', e => {
    if (reading || dialog.open || e.altKey || e.ctrlKey || e.metaKey || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); }
  });
  let touch;
  stage.addEventListener('pointerdown', e => { if (e.pointerType === 'touch' && !e.target.closest('button,a') && !reading) touch = {x:e.clientX,y:e.clientY}; });
  stage.addEventListener('pointerup', e => {
    if (!touch) return;
    const dx = e.clientX - touch.x, dy = e.clientY - touch.y;
    touch = null;
    if (Math.abs(dx) > 75 && Math.abs(dx) > Math.abs(dy) * 1.7 && current > 0) dx < 0 ? next() : show(current - 1);
  });
  stage.addEventListener('pointercancel', () => { touch = null; });
  $('programme-open').addEventListener('click', () => reading ? dialog.scrollIntoView({behavior:'instant'}) : dialog.showModal());
  $('programme-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { const r = dialog.getBoundingClientRect(); if (e.target === dialog && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) dialog.close(); });
  dialog.addEventListener('close', () => { if (!reading) $('programme-open').focus({preventScroll:true}); });
  function toggleReading() {
    if (dialog.open) dialog.close();
    reading = !reading;
    document.body.classList.toggle('reading-mode', reading);
    $('reading-view').textContent = reading ? 'Return to page view ↗' : 'Read invitation ↗';
    show(current, !reading);
  }
  $('reading-view').addEventListener('click', toggleReading);
  function updateCountdown() {
    const seconds = Math.max(0, Math.floor((new Date(event.startISO) - Date.now()) / 1000));
    const values = {days:Math.floor(seconds / 86400), hours:Math.floor(seconds / 3600) % 24, minutes:Math.floor(seconds / 60) % 60, seconds:seconds % 60};
    Object.entries(values).forEach(([key,value]) => document.querySelector(`[data-count="${key}"]`).textContent = String(value).padStart(2,'0'));
    $('countdown').setAttribute('aria-label', `${values.days} days, ${values.hours} hours, ${values.minutes} minutes until registration`);
    $('countdown-caption').textContent = seconds ? 'Until we meet again' : Date.now() < new Date(event.endISO) ? 'Welcome — the day has arrived' : 'Reminisce’26 · 17 October 2026';
  }
  const icsEscape = value => value.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
  const icsDate = value => new Date(value).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  const fold = line => { let result = '', chunk = ''; for (const char of line) { if (new TextEncoder().encode(chunk + char).length > 74) { result += chunk + '\r\n '; chunk = ''; } chunk += char; } return result + chunk; };
  $('calendar-button').addEventListener('click', () => {
    const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//SRM Alumni//Reminisce26//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:reminisce26-srmtrichy-20261017',`DTSTAMP:${icsDate(Date.now())}`,`DTSTART:${icsDate(event.startISO)}`,`DTEND:${icsDate(event.endISO)}`,`SUMMARY:${icsEscape(event.name + ' — Alumni Meet')}`,`LOCATION:${icsEscape(event.venue + ', ' + event.address)}`,`DESCRIPTION:${icsEscape(event.institution + '\n' + event.faculty + '\nRegistration from 9:00 AM. All times Asia/Kolkata.')}`,'END:VEVENT','END:VCALENDAR'];
    const url = URL.createObjectURL(new Blob([lines.map(fold).join('\r\n') + '\r\n'], {type:'text/calendar;charset=utf-8'}));
    const link = document.createElement('a'); link.href = url; link.download = 'reminisce26-srm-alumni-meet.ics'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    $('action-message').textContent = 'Calendar invitation downloaded: 17 October, 9:00 AM–4:00 PM IST.';
  });
  $('share-button').addEventListener('click', async () => {
    const url = location.origin + location.pathname;
    const data = {title:'Reminisce’26 — A Homecoming Invitation', text:'SRM Tiruchirappalli welcomes its alumni home. 17 October 2026 · Registration from 9:00 AM · SRM Auditorium.', url};
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(url); $('action-message').textContent = 'Invitation link copied. Share it with your fellow alumni.'; }
    } catch (error) { if (error.name !== 'AbortError') { $('action-message').textContent = 'Share this invitation: ' + url; } }
  });
  $('directions-link').href = event.mapUrl;
  show(0, false); updateCountdown(); setInterval(updateCountdown, 1000);
})();
