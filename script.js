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

// Contact form: sends each message to a Google Sheet.
// PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL BETWEEN THE QUOTES BELOW.
// It ends in /exec. Until it is filled in, the form opens the visitor's email app instead.
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyyQ2pJXmAo2zmRHT58D1niwv0MUc2VWR3zyjyok19-CSxiZ436DeX1VvwBJg8HtLk4/exec';
const CONTACT_EMAIL = 'info@mweni.ca';

const form = document.getElementById('contact-form');
const statusEl = document.getElementById('form-status');
if (form) form.addEventListener('submit', async e => {
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

  if (!SHEET_URL) {
    const body = 'Name: ' + v('name') + '\nOrganisation: ' + v('org') + '\nEmail: ' + v('email') + '\n\n' + v('message');
    window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent('Enquiry from ' + v('name')) + '&body=' + encodeURIComponent(body);
    statusEl.textContent = 'Thank you. Your email app should now open with your message ready to send.';
    return;
  }

  const button = form.querySelector('.form-submit');
  button.disabled = true;
  statusEl.textContent = 'Sending your message...';
  try {
    await fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: new URLSearchParams({
        name: v('name'), organisation: v('org'), email: v('email'),
        message: v('message'), website: v('website'), page: location.href
      })
    });
    form.reset();
    statusEl.textContent = 'Thank you. Your message has been sent. We will be in touch soon.';
  } catch (err) {
    statusEl.textContent = 'Sorry, your message could not be sent. Please email us at ' + CONTACT_EMAIL + '.';
  } finally {
    button.disabled = false;
  }
});
