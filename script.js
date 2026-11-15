// Mweni Consulting site script (shared by every page)

const nav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// Scroll reveal
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

reveals.forEach(el => observer.observe(el));

// Mobile menu (keyboard and screen-reader friendly)
const toggle = document.querySelector('.nav-toggle');
const menu = document.getElementById('nav-menu');
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  toggle.textContent = open ? 'Menu' : 'Close';
  menu.classList.toggle('open', !open);
});
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  toggle.setAttribute('aria-expanded', 'false');
  toggle.textContent = 'Menu';
  menu.classList.remove('open');
}));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && menu.classList.contains('open')) { toggle.click(); toggle.focus(); }
});

// Contact form: validate with announced errors, then open the visitor's email app
const form = document.getElementById('contact-form');
const statusEl = document.getElementById('form-status');
if (form) form.addEventListener('submit', e => {
  e.preventDefault();
  const fields = [...form.querySelectorAll('[required]')];
  fields.forEach(f => f.removeAttribute('aria-invalid'));
  const bad = fields.filter(f => !f.value.trim() || (f.type === 'email' && !f.checkValidity()));
  if (bad.length) {
    bad.forEach(f => f.setAttribute('aria-invalid', 'true'));
    const names = bad.map(f => form.querySelector('label[for="' + f.id + '"]').textContent.replace(' (required)', ''));
    statusEl.textContent = 'Please complete: ' + names.join(', ') + '.';
    bad[0].focus();
    return;
  }
  const v = id => document.getElementById(id).value.trim();
  const body = 'Name: ' + v('name') + '\nOrganisation: ' + v('org') + '\nEmail: ' + v('email') + '\n\n' + v('message');
  window.location.href = 'mailto:info@mweniconsulting.com?subject=' + encodeURIComponent('Enquiry from ' + v('name')) + '&body=' + encodeURIComponent(body);
  statusEl.textContent = 'Thank you. Your email app should now open with your message ready to send.';
});
