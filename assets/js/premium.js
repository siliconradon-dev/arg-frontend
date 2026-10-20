/* ==========================================================================
   A.R.G Distributors PVT LTD — Modern Premium Redesign (Vanilla JS)
   Interactive Features:
   1. Mobile Navigation & Backdrop Overlay (with ESC key & tap-outside to close)
   2. Scroll Reveal Observer (IntersectionObserver with reduced motion fallback)
   3. Lightbox (Modal gallery & awards with keyboard + touch swipe)
   4. Gallery Category Filtering
   5. Client-Side Contact & Newsletter Forms
   6. Image Fallback Handling
   7. Hero Photo Slideshow (with Ken Burns, pause-on-hover, swipe & keyboard)
   ========================================================================== */

(function () {
  'use strict';

  // ------------------------------------------------------------------------
  // 1. Mobile Navigation Drawer & Backdrop
  // ------------------------------------------------------------------------
  var nav = document.getElementById('nav');
  var burger = document.getElementById('burger');
  var backdrop = document.querySelector('.nav-backdrop');

  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);
  }

  function setMenu(open) {
    if (!nav || !burger) return;
    nav.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    backdrop.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (burger) {
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-controls', 'nav');
    burger.addEventListener('click', function () {
      var isOpen = nav.classList.contains('open');
      setMenu(!isOpen);
    });
  }

  backdrop.addEventListener('click', function () {
    setMenu(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav && nav.classList.contains('open')) {
      setMenu(false);
      if (burger) burger.focus();
    }
  });

  // Handle links inside navigation
  if (nav) {
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var parentLi = a.closest('.has-dd');
        // On mobile, tapping the top-level 'Product & Services' link toggles sub-links if not already expanded
        if (parentLi && a === parentLi.querySelector('a') && window.innerWidth <= 960) {
          if (!parentLi.classList.contains('expanded')) {
            e.preventDefault();
            parentLi.classList.add('expanded');
            return;
          }
        }
        setMenu(false);
      });
    });
  }

  // ------------------------------------------------------------------------
  // 2. Scroll Reveal Animations
  // ------------------------------------------------------------------------
  var reveals = document.querySelectorAll('.reveal');
  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    reveals.forEach(function (el) { observer.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // ------------------------------------------------------------------------
  // 3. Newsletter Form (Client-Side)
  // ------------------------------------------------------------------------
  var newsForm = document.getElementById('newsForm');
  if (newsForm) {
    newsForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = document.getElementById('newsNote');
      if (note) note.style.display = 'block';
      newsForm.reset();
    });
  }

  // ------------------------------------------------------------------------
  // 4. Image Fallback Handling (data-remote)
  // ------------------------------------------------------------------------
  document.addEventListener('error', function (e) {
    var target = e.target;
    if (target && target.tagName === 'IMG' && target.getAttribute('data-remote') && !target.getAttribute('data-tried')) {
      target.setAttribute('data-tried', '1');
      target.src = target.getAttribute('data-remote');
    }
  }, true);

  function rescueImages() {
    document.querySelectorAll('img[data-remote]').forEach(function (img) {
      if (img.complete && img.naturalWidth === 0 && !img.getAttribute('data-tried')) {
        img.setAttribute('data-tried', '1');
        img.src = img.getAttribute('data-remote');
      }
    });
  }
  rescueImages();
  window.addEventListener('load', rescueImages);

  // ------------------------------------------------------------------------
  // 5. Lightbox (Modal for Achievements & Gallery) with Keyboard & Swipe
  // ------------------------------------------------------------------------
  var triggers = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
  if (triggers.length) {
    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Photo enlargement modal');
    box.innerHTML = '<button class="x" type="button" aria-label="Close photo dialog">&times;</button>' +
      '<button class="lb-nav prev" type="button" aria-label="Previous photo"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>' +
      '<button class="lb-nav next" type="button" aria-label="Next photo"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>';
    document.body.appendChild(box);

    var bimg = box.querySelector('img');
    var bcap = box.querySelector('figcaption');
    var list = [];
    var idx = 0;

    function visibleList() {
      return triggers.filter(function (t) {
        return !t.closest('[hidden]');
      });
    }

    function load(i) {
      if (!list.length) return;
      idx = (i + list.length) % list.length;
      var current = list[idx];
      bimg.removeAttribute('data-tried');
      bimg.setAttribute('data-remote', current.getAttribute('data-remote') || '');
      bimg.src = current.getAttribute('data-lightbox');
      var caption = current.getAttribute('data-caption') || '';
      bimg.alt = caption;
      bcap.textContent = caption;
    }

    function open(t) {
      list = visibleList();
      box.classList.toggle('single', list.length < 2);
      load(list.indexOf(t));
      box.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      box.classList.remove('open');
      document.body.style.overflow = '';
    }

    triggers.forEach(function (t) {
      t.addEventListener('click', function () { open(t); });
    });

    box.addEventListener('click', function (e) {
      if (e.target.closest('.lb-nav.prev')) { load(idx - 1); return; }
      if (e.target.closest('.lb-nav.next')) { load(idx + 1); return; }
      if (e.target.tagName === 'IMG') return;
      close();
    });

    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') load(idx - 1);
      if (e.key === 'ArrowRight') load(idx + 1);
    });

    // Touch swipe support in lightbox
    var lbTouchX = null;
    box.addEventListener('touchstart', function (e) {
      lbTouchX = e.touches[0].clientX;
    }, { passive: true });

    box.addEventListener('touchend', function (e) {
      if (lbTouchX === null) return;
      var dx = e.changedTouches[0].clientX - lbTouchX;
      lbTouchX = null;
      if (Math.abs(dx) > 40) {
        if (dx < 0) load(idx + 1);
        else load(idx - 1);
      }
    });
  }

  // ------------------------------------------------------------------------
  // 6. Gallery Filters (gallery.html)
  // ------------------------------------------------------------------------
  var filters = document.querySelectorAll('.g-filters button');
  if (filters.length) {
    var gitems = document.querySelectorAll('.g-item');
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.getAttribute('data-filter');
        filters.forEach(function (b) { b.classList.toggle('on', b === btn); });
        gitems.forEach(function (item) {
          item.hidden = !(filter === 'all' || item.getAttribute('data-cat') === filter);
        });
      });
    });
  }

  // ------------------------------------------------------------------------
  // 7. Contact Form (contact.html)
  // ------------------------------------------------------------------------
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    var note = document.getElementById('formNote');
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = contactForm.elements;
      var valid = true;

      ['name', 'email', 'message'].forEach(function (k) {
        var field = fields[k];
        var isInvalid = !field.value.trim() || (k === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(field.value.trim()));
        field.classList.toggle('err', isInvalid);
        if (isInvalid) valid = false;
      });

      if (!valid) {
        note.className = 'form-note bad';
        note.textContent = 'Please fill in your name, a valid e-mail and a message.';
        return;
      }

      var bodyText = 'Name: ' + fields.name.value.trim() + '\nEmail: ' + fields.email.value.trim() +
        '\nPhone: ' + (fields.phone.value.trim() || '-') + '\n\n' + fields.message.value.trim();

      window.location.href = 'mailto:' + contactForm.getAttribute('data-recipient') +
        '?subject=' + encodeURIComponent('Website enquiry from ' + fields.name.value.trim()) +
        '&body=' + encodeURIComponent(bodyText);

      note.className = 'form-note ok';
      note.textContent = 'Thank you! Your email app should open with your message ready to send.';
    });
  }
})();

// --------------------------------------------------------------------------
// 8. Hero Slideshow (#heroSlider on index.html)
// --------------------------------------------------------------------------
(function () {
  var root = document.getElementById('heroSlider');
  if (!root) return;

  var slides = root.querySelectorAll('.slide');
  var dots = root.querySelectorAll('.s-dots button');
  var DUR = 6500;
  var cur = 0;
  var timer = null;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.style.setProperty('--dur', DUR + 'ms');

  function show(n) {
    cur = (n + slides.length) % slides.length;
    slides.forEach(function (s, i) {
      var on = i === cur;
      s.classList.toggle('active', on);
      s.setAttribute('aria-hidden', on ? 'false' : 'true');
      var img = s.querySelector('img');
      if (on && img) img.loading = 'eager';
    });
    dots.forEach(function (d, i) {
      d.classList.toggle('on', i === cur);
    });

    // Restart the progress-bar animation
    root.classList.remove('playing');
    void root.offsetWidth; // Trigger reflow
    if (timer) root.classList.add('playing');
  }

  function next() {
    show(cur + 1);
  }

  function play() {
    if (reduce || timer) return;
    timer = setInterval(next, DUR);
    root.classList.add('playing');
    root.classList.remove('paused');
  }

  function stop() {
    clearInterval(timer);
    timer = null;
    root.classList.remove('playing');
  }

  function restart() {
    stop();
    play();
  }

  var nextBtn = root.querySelector('.next');
  var prevBtn = root.querySelector('.prev');
  if (nextBtn) nextBtn.addEventListener('click', function () { show(cur + 1); restart(); });
  if (prevBtn) prevBtn.addEventListener('click', function () { show(cur - 1); restart(); });

  dots.forEach(function (d, i) {
    d.addEventListener('click', function () {
      show(i);
      restart();
    });
  });

  // Pause on hover / focus, resume on leave
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', play);
  root.addEventListener('focusin', stop);
  root.addEventListener('focusout', play);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else play();
  });

  // Keyboard navigation
  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { show(cur + 1); restart(); }
    if (e.key === 'ArrowLeft') { show(cur - 1); restart(); }
  });

  // Touch swipe support for slideshow
  var x0 = null;
  root.addEventListener('touchstart', function (e) {
    x0 = e.touches[0].clientX;
  }, { passive: true });

  root.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 50) {
      show(cur + (dx < 0 ? 1 : -1));
      restart();
    }
  });

  show(0);
  play();
})();
