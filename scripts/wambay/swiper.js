/**
 * Wambay — Swiper Script
 * Testimonials slider
 * Dependencies: Swiper
 */
new Swiper(".swiper.is-testimonials", {
  enabled: true,
  slidesPerView: 1,
  autoHeight: true,
  loop: true,
  centeredSlides: false,
  spaceBetween: 24,
  speed: 600,
  pagination: {
    el: ".swiper-pagination",
    type: "bullets",
    clickable: true,
  },
  navigation: {
    nextEl: ".arrow-img-right",
    prevEl: ".arrow-img",
  },
  autoplay: {
    delay: 5000,
  },
  breakpoints: {
    650: { slidesPerView: 2, spaceBetween: 24 },
    830: { slidesPerView: 2, spaceBetween: 24 },
    1040: { slidesPerView: 2, spaceBetween: 24 },
    1200: { slidesPerView: 3, spaceBetween: 24 },
    1920: { slidesPerView: 4, spaceBetween: 24 },
  },
});
