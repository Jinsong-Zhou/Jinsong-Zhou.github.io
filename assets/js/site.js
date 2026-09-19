(function () {
  'use strict';

  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('nav-menu');

  // Mobile menu
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('nav--open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('no-scroll', open);
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' && nav.classList.contains('nav--open')) {
        toggle.click();
      }
    });
  }

  // Nav background gets stronger after scrolling past the hero top
  var onScroll = function () {
    nav.classList.toggle('nav--scrolled', window.scrollY > 8);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Highlight the section currently in view
  // Section id a nav link refers to: "/#about" -> "about", "/publications/" -> "publications"
  var hashOf = function (a) {
    var href = a.getAttribute('href');
    var i = href.indexOf('#');
    if (i !== -1) return href.slice(i + 1);
    return href.replace(/\/+$/, '').split('/').pop();
  };
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav__menu a'));
  var sections = links
    .map(function (a) { return document.getElementById(hashOf(a)); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var current = null;
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) current = entry.target.id;
      });
      links.forEach(function (a) {
        a.classList.toggle('is-active', hashOf(a) === current);
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  // Scroll-in reveal
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var targets = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(targets, function (el) { el.classList.add('is-visible'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
})();
