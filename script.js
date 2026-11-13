// Standard anchor links work without JavaScript; scrolling stays browser-native.
const navLinks = [...document.querySelectorAll('.header nav a')];
const navTargets = new Set(navLinks.map(link => link.hash));
const pageSections = [...document.querySelectorAll('.page-section')]
  .filter(section => navTargets.has('#' + section.id));
const mainNav = document.querySelector('.header nav');
const indicator = document.createElement('span');
indicator.className = 'nav-indicator';
indicator.setAttribute('aria-hidden', 'true');
mainNav?.append(indicator);
function moveIndicator() {
  const active = navLinks.find(link => link.hasAttribute('aria-current'));
  if (!active || !mainNav) return;
  const linkRect = active.getBoundingClientRect();
  const navRect = mainNav.getBoundingClientRect();
  const style = getComputedStyle(active);
  const left = parseFloat(style.paddingLeft);
  const right = parseFloat(style.paddingRight);
  indicator.style.setProperty('--indicator-x', `${linkRect.left - navRect.left + left}px`);
  indicator.style.setProperty('--indicator-width', `${linkRect.width - left - right}px`);
  mainNav.classList.add('indicator-ready');
}
const resumeSections = [...document.querySelectorAll('.resume-content section[id]')];
let scheduled = false;
function updateSections() {
  const marker = (document.querySelector('.header')?.getBoundingClientRect().height || 88) + 24;
  let current = pageSections[0];
  for (const section of pageSections) {
    if (section.getBoundingClientRect().top <= marker) current = section;
  }
  if (current) {
    navLinks.forEach(link => {
      if (link.hash === '#' + current.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  let resumeCurrent = resumeSections[0];
  for (const section of resumeSections) {
    if (section.getBoundingClientRect().top <= marker) resumeCurrent = section;
  }
  document.querySelectorAll('aside nav a').forEach(link => {
    const active = current?.id === 'resume' && link.hash === '#' + resumeCurrent?.id;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  moveIndicator();
  scheduled = false;
}
function scheduleUpdate() {
  if (!scheduled) { scheduled = true; requestAnimationFrame(updateSections); }
}
addEventListener('scroll', scheduleUpdate, { passive: true });
addEventListener('resize', scheduleUpdate);
addEventListener('hashchange', scheduleUpdate);
updateSections();
