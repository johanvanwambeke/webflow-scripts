/**
 * Harmony Group — Main Webflow Script
 * Dependencies: GSAP, Swiper, Finsweet CMS Filter
 */
console.log("%cThis site was built by wambay!", "background:blue;color:#fff;padding: 8px;");

function applyGsapHoverEffect() {
  document.querySelectorAll('.story-card_component').forEach(card => {
    const image = card.querySelector('.story-card_image');

    if (!card.dataset.gsapApplied) {
      card.addEventListener('mouseenter', () => {
        gsap.to(image, { scale: 1.1, duration: 1, ease: "cubic.out" });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(image, { scale: 1, duration: 0.6, ease: "cubic.in" });
      });

      card.dataset.gsapApplied = "true";
    }
  });
}

applyGsapHoverEffect();

// MutationObserver to detect Finsweet CMS filter list changes
const observer = new MutationObserver(() => {
  applyGsapHoverEffect();
});

const targetNode = document.querySelector('[fs-cmsfilter-element="list"]');
if (targetNode) {
  observer.observe(targetNode, { childList: true, subtree: true });
}

// Swiper: video collection
new Swiper(".swiper.is-videocollection", {
  enabled: true,
  slidesPerView: 1,
  loop: true,
  createElements: true,
  spaceBetween: 15,
  centeredSlides: false,
  navigation: {
    nextEl: ".btn-next",
  },
  autoplay: {
    delay: 6000,
  },
  breakpoints: {
    755: { slidesPerView: 1.5, spaceBetween: 30 },
    1000: { slidesPerView: 2, spaceBetween: 30 },
    1400: { slidesPerView: 2.5, spaceBetween: 30 },
    1600: { slidesPerView: 3, spaceBetween: 30 },
    1980: { slidesPerView: 3.5, spaceBetween: 30 },
    2300: { slidesPerView: 4, spaceBetween: 30 },
  },
});

// Swiper: BNS
new Swiper(".swiper.is-bns", {
  slidesPerView: 1,
  spaceBetween: 15,
  centeredSlides: false,
  navigation: {
    nextEl: ".btn-next-bc.bns",
    prevEl: ".btn-prev-bc.bns",
    disabledClass: "btn-disabled",
  },
});

// Swiper: testimonials
new Swiper(".swiper.is-testimonials", {
  spaceBetween: 15,
  loop: true,
  navigation: {
    nextEl: ".btn-next-bc.testimonials",
    prevEl: ".btn-prev-bc.testimonials",
    disabledClass: "btn-disabled",
  },
  breakpoints: {
    755: { slidesPerView: 1.5, spaceBetween: 30 },
    1000: { slidesPerView: 2, spaceBetween: 30 },
    1400: { slidesPerView: 2.5, spaceBetween: 30 },
    1700: { slidesPerView: 3 },
    1920: { slidesPerView: 3.5, spaceBetween: 30 },
  },
});

// Swiper: DT
new Swiper(".swiper.is-dt", {
  slidesPerView: 1,
  spaceBetween: 15,
  navigation: {
    nextEl: ".btn-next-bc.color-yellow",
    prevEl: ".btn-prev-bc.color-yellow",
    disabledClass: "btn-disabled",
  },
});

// Swiper: BA-BA
new Swiper(".swiper.is-ba-ba", {
  slidesPerView: 1,
  spaceBetween: 15,
  navigation: {
    nextEl: ".btn-next-bc.color-red",
    prevEl: ".btn-prev-bc.color-red",
    disabledClass: "btn-disabled",
  },
});
