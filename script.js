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
const sectionMenus = new Map(pageSections.map(section => [
  section.id,
  [...section.querySelectorAll('.resume-layout aside nav a')].map(link => ({
    link,
    target: document.getElementById(link.hash.slice(1))
  })).filter(item => item.target)
]));
let scheduled = false;
function updateSections() {
  let marker = (document.querySelector('.header')?.getBoundingClientRect().height || 88) + 24;
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
  if (matchMedia('(max-width:600px)').matches) {
    const submenu = current?.querySelector('.resume-layout aside');
    if (submenu) marker += submenu.getBoundingClientRect().height;
  }
  for (const [sectionId, items] of sectionMenus) {
    let selected;
    if (current?.id === sectionId) {
      selected = items[0];
      for (const item of items) {
        // Anchor navigation lands at the target's scroll margin, which varies by section.
        const anchorOffset = parseFloat(getComputedStyle(item.target).scrollMarginTop) || 0;
        if (item.target.getBoundingClientRect().top <= Math.max(marker, anchorOffset + 12)) {
          selected = item;
        }
      }
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        selected = items.at(-1);
      }
    }
    for (const item of items) {
      const active = item === selected;
      item.link.classList.toggle('active', active);
      if (active) item.link.setAttribute('aria-current', 'location');
      else item.link.removeAttribute('aria-current');
    }
  }
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

// Animate once on entry without hiding content or affecting anchor navigation.
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('preview-reveal');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.12 });
  document.querySelectorAll('.page-intro, .project-row, .publication-list article')
    .forEach(element => observer.observe(element));
}
