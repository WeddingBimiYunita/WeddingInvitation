/**
 * ============================================================================
 * UNDANGAN PERNIKAHAN DIGITAL MOBILE-FIRST - SCRIPT.JS
 * ============================================================================
 */

document.addEventListener("DOMContentLoaded", function () {
  /* ==========================================================================
     1. PARSING PARAMETER URL & NAMA TAMU DINAMIS (?to=NamaTamu)
     ========================================================================== */
  const guestNameElement = document.getElementById("guest-name");
  const urlParams = new URLSearchParams(window.location.search);
  const rawGuestName = urlParams.get("to");

  if (rawGuestName && rawGuestName.trim() !== "") {
    // Membersihkan karakter '+' atau kode enkripsi URL
    const formattedName = decodeURIComponent(rawGuestName.replace(/\+/g, " "));
    guestNameElement.textContent = formattedName;
  } else {
    guestNameElement.textContent = "Tamu Undangan";
  }

  /* ==========================================================================
     2. MEMBUKA UNDANGAN & AUDIO PLAYBACK (Cover Modal)
     ========================================================================== */
  const openBtn = document.getElementById("open-btn");
  const coverModal = document.getElementById("cover-modal");
  const bgMusic = document.getElementById("bg-music");
  const musicBtn = document.getElementById("music-btn");
  const bottomNav = document.getElementById("bottom-nav");

  let isMusicPlaying = false;

  // Memastikan audio terisi volume penuh
  if (bgMusic) {
    bgMusic.volume = 1.0;
  }

  openBtn.addEventListener("click", function () {
    // 1. Buka kunci scroll dan aktifkan status undangan terbuka pada body
    document.body.classList.remove("locked");
    document.body.classList.add("invitation-opened");

    // 2. Animasi keluar untuk cover modal
    coverModal.classList.add("opened");

    // 3. Tampilkan tombol audio melayang dan navigasi bawah
    musicBtn.classList.remove("hidden");
    bottomNav.classList.remove("hidden");

    // 4. Putar musik latar (Dipaksa load & play saat interaksi klik)
    if (bgMusic) {
      bgMusic.load(); // Mencegah freeze di browser mobile
      const playPromise = bgMusic.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            isMusicPlaying = true;
            musicBtn.classList.remove("paused");
          })
          .catch((error) => {
            console.warn("Mencoba memutar ulang musik...", error);
            // Retry playback langsung jika butuh delay sebentar
            setTimeout(() => {
              bgMusic.play().then(() => {
                isMusicPlaying = true;
                musicBtn.classList.remove("paused");
              }).catch((e) => console.error("Playback gagal:", e));
            }, 150);
          });
      }
    }

    // 5. Hapus cover dari DOM setelah animasi selesai agar ringan di memori
    setTimeout(() => {
      coverModal.style.display = "none";
    }, 1000);

    // 6. Picu pemeriksaan reveal perdana setelah cover terbuka
    triggerInitialReveal();
  });

  /* ==========================================================================
     3. FLOATING AUDIO CONTROLLER (Play/Pause)
     ========================================================================== */
  musicBtn.addEventListener("click", function () {
    if (!bgMusic) return;

    if (isMusicPlaying) {
      bgMusic.pause();
      musicBtn.classList.add("paused");
      isMusicPlaying = false;
    } else {
      bgMusic
        .play()
        .then(() => {
          musicBtn.classList.remove("paused");
          isMusicPlaying = true;
        })
        .catch((e) => console.error("Gagal memutar audio:", e));
    }
  });

  /* ==========================================================================
     4. COUNTDOWN TIMER MENUJU 22 AGUSTUS 2026, 08:00 WIB (UTC+7)
     ========================================================================== */
  const targetDate = new Date("2026-08-22T08:00:00+07:00").getTime();

  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
      if (daysEl) daysEl.textContent = "00";
      if (hoursEl) hoursEl.textContent = "00";
      if (minutesEl) minutesEl.textContent = "00";
      if (secondsEl) secondsEl.textContent = "00";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(days).padStart(2, "0");
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, "0");
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, "0");
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, "0");
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ==========================================================================
     5. GALERI 1 x 1 INFINITE VERTICAL SCROLL & LIGHTBOX MODAL
     ========================================================================== */
  const galleryViewport = document.getElementById("gallery-viewport");
  const indicatorDots = document.querySelectorAll(".indicator-dot");

  if (galleryViewport && indicatorDots.length > 0) {
    galleryViewport.addEventListener("scroll", function () {
      const slideHeight = galleryViewport.clientHeight;
      if (slideHeight <= 0) return;
      
      const scrollPosition = galleryViewport.scrollTop;
      const totalSlides = indicatorDots.length; // 5 foto asli (0, 1, 2, 3, 4)

      // Hitung indeks saat ini (bisa mencapai indeks 5 saat masuk ke slide kloning)
      const currentSlideIndex = Math.round(scrollPosition / slideHeight);

      // SEAMLESS INFINITE LOOP: Jika pengguna me-scroll sampai ke foto ke-5 (yang adalah kloningan Foto 1)
      // Begitu snap hampir sempurna (selisih kurang dari 15px), reset seketika ke Foto 1 asli tanpa animasi
      if (currentSlideIndex === totalSlides && Math.abs(scrollPosition - (totalSlides * slideHeight)) < 15) {
        galleryViewport.style.scrollBehavior = 'auto'; // Matikan transisi smooth sebentar
        galleryViewport.scrollTop = 0; // Kembalikan ke foto 1 asli
        // Aktifkan kembali transisi smooth setelah posisi di-reset
        setTimeout(() => {
          galleryViewport.style.scrollBehavior = 'smooth';
        }, 50);
      }

      // Pilih titik aktif (jika di slide kloning nomor 4, maka yang aktif adalah titik nomor 0)
      const activeIndex = (currentSlideIndex >= totalSlides) ? 0 : Math.min(Math.max(0, currentSlideIndex), totalSlides - 1);
      
      indicatorDots.forEach((dot, index) => {
        if (index === activeIndex) {
          dot.classList.add("active");
        } else {
          dot.classList.remove("active");
        }
      });
    });

    // Klik titik indikator untuk loncat langsung
    indicatorDots.forEach((dot) => {
      dot.addEventListener("click", function (e) {
        e.stopPropagation();
        const targetIndex = parseInt(this.getAttribute("data-target") || "0", 10);
        const slideHeight = galleryViewport.clientHeight;
        galleryViewport.style.scrollBehavior = 'smooth';
        galleryViewport.scrollTo({
          top: targetIndex * slideHeight,
          behavior: "smooth"
        });
      });
    });
  }

  const gallerySlides = document.querySelectorAll(".gallery-slide, .gallery-item");
  const lightboxModal = document.getElementById("lightbox-modal");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxClose = document.getElementById("lightbox-close");

  gallerySlides.forEach((slide) => {
    slide.addEventListener("click", function (e) {
      if (e.target.closest(".slide-badge")) return;
      const imgSrc = this.getAttribute("data-src") || (this.querySelector("img") ? this.querySelector("img").src : null);
      if (imgSrc && lightboxImg && lightboxModal) {
        lightboxImg.src = imgSrc;
        lightboxModal.classList.add("active");
        lightboxModal.setAttribute("aria-hidden", "false");
      }
    });
  });

  function closeLightbox() {
    if (lightboxModal && lightboxModal.classList.contains("active")) {
      lightboxModal.classList.remove("active");
      lightboxModal.setAttribute("aria-hidden", "true");
      setTimeout(() => {
        if (lightboxImg) lightboxImg.src = "";
      }, 350);
    }
  }

  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }

  if (lightboxModal) {
    lightboxModal.addEventListener("click", function (e) {
      if (e.target === lightboxModal) {
        closeLightbox();
      }
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightboxModal && lightboxModal.classList.contains("active")) {
      closeLightbox();
    }
  });

  /* ==========================================================================
     6. SCROLL REVEAL ANIMATIONS (Intersection Observer)
     ========================================================================== */
  const revealElements = document.querySelectorAll(".reveal");

  const revealObserverOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -40px 0px",
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target);
      }
    });
  }, revealObserverOptions);

  function triggerInitialReveal() {
    revealElements.forEach((el) => {
      revealObserver.observe(el);
    });
  }

  /* ==========================================================================
     7. BOTTOM NAVIGATION BAR - ACTIVE SECTION HIGHLIGHTING & SMOOTH SCROLL
     ========================================================================== */
  const navLinks = document.querySelectorAll(".bottom-nav .nav-item");
  const sections = [
    document.getElementById("mempelai"),
    document.getElementById("acara"),
    document.getElementById("lokasi"),
    document.getElementById("galeri"),
    document.getElementById("rsvp"),
  ].filter(Boolean);

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        const navHeight = bottomNav ? bottomNav.offsetHeight : 70;
        const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - (navHeight / 2);

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });

        navLinks.forEach((item) => item.classList.remove("active"));
        this.classList.add("active");
      }
    });
  });

  window.addEventListener("scroll", function () {
    let currentSectionId = "";
    const scrollPosition = window.pageYOffset + window.innerHeight / 3;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSectionId = "#" + section.getAttribute("id");
      }
    });

    if (currentSectionId) {
      navLinks.forEach((link) => {
        if (link.getAttribute("href") === currentSectionId) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      });
    }
  });

  /* ==========================================================================
     8. RSVP & UCAPAN FORM HANDLING (Local Storage & Reactive Feed)
     ========================================================================== */
  const rsvpForm = document.getElementById("rsvp-form");
  const wishList = document.getElementById("wish-list");

  // Muat ucapan dari localStorage jika ada
  function loadWishes() {
    if (!wishList) return;
    const savedWishes = JSON.parse(localStorage.getItem("wedding_wishes_bimi_yunita") || "[]");
    savedWishes.forEach((wish) => {
      addWishToDOM(wish.name, wish.message, wish.time, false);
    });
  }

  function addWishToDOM(name, message, timeStr, prepend = true) {
    if (!wishList) return;
    const item = document.createElement("div");
    item.className = "wish-item";
    
    const initial = name.trim().charAt(0).toUpperCase() || "T";
    
    item.innerHTML = `
      <div class="wish-avatar">${initial}</div>
      <div class="wish-text-wrap">
        <div class="wish-header">
          <span class="wish-author">${escapeHtml(name)}</span>
          <span class="wish-time">${escapeHtml(timeStr)}</span>
        </div>
        <p class="wish-body">${escapeHtml(message)}</p>
      </div>
    `;
    
    if (prepend && wishList.firstChild) {
      wishList.insertBefore(item, wishList.firstChild);
    } else {
      wishList.appendChild(item);
    }
  }

  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
  }

  if (rsvpForm) {
    loadWishes();

    rsvpForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const nameInput = document.getElementById("rsvp-name");
      const msgInput = document.getElementById("rsvp-message");
      const submitBtn = rsvpForm.querySelector(".btn-submit-rsvp");

      if (!nameInput || !msgInput) return;
      const name = nameInput.value.trim();
      const message = msgInput.value.trim();

      if (!name || !message) return;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = "<span>Mengirim...</span>";
      }

      setTimeout(() => {
        const timeStr = "Baru saja";

        // Tambahkan langsung ke layar agar terasa reaktif dan modern
        addWishToDOM(name, message, timeStr, true);

        // Simpan ke localStorage
        const savedWishes = JSON.parse(localStorage.getItem("wedding_wishes_bimi_yunita") || "[]");
        savedWishes.unshift({ name, message, time: "Hari ini" });
        localStorage.setItem("wedding_wishes_bimi_yunita", JSON.stringify(savedWishes));

        // Reset form
        nameInput.value = "";
        msgInput.value = "";
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
            <span>Kirim Ucapan</span>
          `;
        }

        alert("Terima kasih! Ucapan dan doa restu Anda telah berhasil disimpan.");
      }, 600);
    });
  }
});
