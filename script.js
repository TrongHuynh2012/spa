/* =========================================================
   QUEN SPA — SCRIPT.JS (vanilla JS, no dependencies)
   ========================================================= */
(function () {
  "use strict";

  /* ---------- 1. HEADER: shadow on scroll + active link ---------- */
  var header = document.getElementById("header");
  var sections = document.querySelectorAll("main section[id]");
  var navLinks = document.querySelectorAll(".nav__link");

  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
    toggleBackToTop();
    highlightActiveSection();
  }

  function highlightActiveSection() {
    var scrollPos = window.scrollY + 140;
    var current = null;
    sections.forEach(function (sec) {
      if (sec.offsetTop <= scrollPos) current = sec.id;
    });
    navLinks.forEach(function (link) {
      var match = link.getAttribute("href") === "#" + current;
      link.classList.toggle("is-active", !!match);
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- 2. MOBILE NAV TOGGLE ---------- */
  var navToggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");

  navToggle.addEventListener("click", function () {
    var isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Đóng menu" : "Mở menu");
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  // Close mobile nav when a link is clicked
  nav.querySelectorAll(".nav__link").forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });

  /* ---------- 3. SCROLL REVEAL ANIMATION ---------- */
  var revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    // Fallback: reveal everything immediately
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- 4. TESTIMONIAL CAROUSEL ---------- */
  var track = document.getElementById("testimonialTrack");
  var dotsWrap = document.getElementById("testimonialDots");

  if (track && dotsWrap) {
    var slides = Array.prototype.slice.call(track.children);
    var current = 0;
    var autoplayId = null;

    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.setAttribute("aria-label", "Xem đánh giá " + (i + 1));
      if (i === 0) dot.classList.add("is-active");
      dot.addEventListener("click", function () { goTo(i); resetAutoplay(); });
      dotsWrap.appendChild(dot);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      track.style.transform = "translateX(-" + current * 100 + "%)";
      dots.forEach(function (d, i) { d.classList.toggle("is-active", i === current); });
    }

    function autoplay() {
      autoplayId = setInterval(function () { goTo(current + 1); }, 6000);
    }
    function resetAutoplay() {
      clearInterval(autoplayId);
      autoplay();
    }

    autoplay();

    // Pause on hover/focus for accessibility & UX
    track.parentElement.addEventListener("mouseenter", function () { clearInterval(autoplayId); });
    track.parentElement.addEventListener("mouseleave", autoplay);

    // Basic swipe support on touch devices
    var touchStartX = 0;
    track.addEventListener("touchstart", function (e) { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener("touchend", function (e) {
      var delta = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 40) {
        goTo(current + (delta < 0 ? 1 : -1));
        resetAutoplay();
      }
    }, { passive: true });
  }

  /* ---------- 5. FAQ ACCORDION ---------- */
  var accordion = document.getElementById("accordion");
  if (accordion) {
    var triggers = accordion.querySelectorAll(".accordion__trigger");
    triggers.forEach(function (trigger) {
      var panel = trigger.nextElementSibling;
      trigger.addEventListener("click", function () {
        var isOpen = trigger.getAttribute("aria-expanded") === "true";

        // Close all others (single-open accordion)
        triggers.forEach(function (t) {
          t.setAttribute("aria-expanded", "false");
          t.nextElementSibling.style.maxHeight = null;
        });

        if (!isOpen) {
          trigger.setAttribute("aria-expanded", "true");
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      });
    });
  }

  /* ---------- 6. BOOKING FORM VALIDATION ---------- */
  var form = document.getElementById("bookingForm");
  if (form) {
    var successMsg = document.getElementById("formSuccess");

    var validators = {
      fullname: function (v) {
        if (!v.trim()) return "Vui lòng nhập họ tên.";
        if (v.trim().length < 2) return "Họ tên quá ngắn.";
        return "";
      },
      phone: function (v) {
        var re = /^(0|\+84)([0-9]{9,10})$/;
        if (!v.trim()) return "Vui lòng nhập số điện thoại.";
        if (!re.test(v.trim().replace(/[\s.-]/g, ""))) return "Số điện thoại không hợp lệ.";
        return "";
      },
      service: function (v) {
        return v ? "" : "Vui lòng chọn dịch vụ.";
      },
      date: function (v) {
        if (!v) return "Vui lòng chọn ngày.";
        var chosen = new Date(v + "T00:00:00");
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        if (chosen < today) return "Ngày đã chọn ở quá khứ.";
        return "";
      },
      time: function (v) {
        return v ? "" : "Vui lòng chọn giờ.";
      }
    };

    // Set min date to today
    var dateInput = document.getElementById("date");
    if (dateInput) {
      var todayISO = new Date().toISOString().split("T")[0];
      dateInput.setAttribute("min", todayISO);
    }

    function validateField(name) {
      var field = form.elements[name];
      var errorEl = document.getElementById("err-" + name);
      var message = validators[name] ? validators[name](field.value) : "";
      if (errorEl) errorEl.textContent = message;
      field.classList.toggle("is-invalid", !!message);
      return !message;
    }

    Object.keys(validators).forEach(function (name) {
      var field = form.elements[name];
      if (!field) return;
      field.addEventListener("blur", function () { validateField(name); });
      field.addEventListener("input", function () {
        if (field.classList.contains("is-invalid")) validateField(name);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var isValid = true;
      Object.keys(validators).forEach(function (name) {
        if (!validateField(name)) isValid = false;
      });

      if (!isValid) {
        var firstInvalid = form.querySelector(".is-invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Simulate successful submission (replace with real API call)
      successMsg.hidden = false;
      form.reset();
      successMsg.scrollIntoView({ behavior: "smooth", block: "nearest" });

      setTimeout(function () { successMsg.hidden = true; }, 6000);
    });
  }

  /* ---------- 7. BACK TO TOP ---------- */
  var backToTop = document.getElementById("backToTop");

  function toggleBackToTop() {
    if (!backToTop) return;
    backToTop.hidden = window.scrollY < 480;
  }

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- 8. INIT ---------- */
  onScroll();
})();
