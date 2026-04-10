/**
 * Lions Ronse — Main Webflow Script
 * Dependencies (externe scripts in Webflow):
 *   - jQuery
 *   - jQuery Waypoints: https://cdnjs.cloudflare.com/ajax/libs/waypoints/4.0.0/jquery.waypoints.min.js
 *   - jQuery counterUp: https://cdn.jsdelivr.net/npm/jquery.counterup@2.1.0/jquery.counterup.min.js
 *   - GSAP + ScrollTrigger
 *   - Swiper
 */
document.addEventListener("DOMContentLoaded", function () {

  // Counter animation
  $(".counter").counterUp({
    delay: 100,
    time: 2000,
  });

  // Page fade-in
  gsap.to(".page-wrapper", { opacity: 1, duration: 0.5 });

  // Wrap h2 text in span
  const headers = document.querySelectorAll("h2");
  headers.forEach(function (header) {
    var text = header.innerHTML;
    header.innerHTML = '<span class="text">' + text + "</span>";
  });

  // Scroll-triggered fade-in for headings
  gsap.utils.toArray("h1, h2, .page-hero_text").forEach(function (el) {
    gsap.fromTo(
      el,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "ease.in",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none none",
          once: true,
        },
      }
    );
  });

  // Goeie doelen cards stagger
  gsap.fromTo(
    ".goeie-doelen_card_wrapper",
    { y: 50, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      stagger: 0.4,
      duration: 1,
      ease: "ease.in",
      scrollTrigger: {
        trigger: ".goeie-doelen_section",
        start: "top 80%",
        toggleActions: "play none none none",
        once: true,
      },
    }
  );

  // Impact cards stagger
  gsap.fromTo(
    ".impact_card",
    { y: "100%", opacity: 0 },
    {
      y: "0%",
      opacity: 1,
      duration: 1,
      ease: "power2.out",
      stagger: 0.2,
      scrollTrigger: {
        trigger: ".impact_container",
        start: "top 80%",
        toggleActions: "play none none none",
        once: true,
      },
    }
  );

  // Swiper: mensen slider
  new Swiper(".mensen_wrapper.swiper", {
    direction: "horizontal",
    loop: true,
    speed: 400,
    autoplay: { delay: 3000 },
    grabCursor: true,
    slidesPerGroup: 1,
    keyboard: { enabled: false, onlyInViewport: false },
    pagination: { el: ".swiper-pagination" },
    navigation: { nextEl: ".pop-next", prevEl: ".pop-prev" },
    scrollbar: { el: ".swiper-scrollbar" },
    breakpoints: {
      320: { slidesPerView: 1, spaceBetween: 16 },
      480: { slidesPerView: 2, spaceBetween: 16 },
      640: { slidesPerView: 3, spaceBetween: 16 },
      1100: { slidesPerView: 4, spaceBetween: 16 },
      1480: { slidesPerView: 5, spaceBetween: 16 },
      1865: { slidesPerView: 6, spaceBetween: 16 },
    },
  });

  // Swiper: project detail slider
  new Swiper(".swiper.project-detail", {
    direction: "horizontal",
    loop: true,
    speed: 400,
    grabCursor: true,
    slidesPerGroup: 1,
    keyboard: { enabled: false, onlyInViewport: false },
    pagination: { el: ".swiper-pagination" },
    navigation: { nextEl: ".pop-next", prevEl: ".pop-prev" },
    scrollbar: { el: ".swiper-scrollbar" },
    breakpoints: {
      320: { slidesPerView: 1, spaceBetween: 16 },
      480: { slidesPerView: 2, spaceBetween: 16 },
      640: { slidesPerView: 2, spaceBetween: 16 },
      1100: { slidesPerView: 3, spaceBetween: 16 },
      1480: { slidesPerView: 3, spaceBetween: 16 },
      1865: { slidesPerView: 3, spaceBetween: 16 },
    },
  });

  // Swiper: hero slider
  new Swiper(".swiper.is-hero", {
    enabled: true,
    effect: "fade",
    slidesPerView: 1,
    loop: true,
    centeredSlides: false,
    spaceBetween: 0,
    speed: 700,
    navigation: {
      nextEl: ".slider_nav_button.left",
      prevEl: ".slider_nav_button.right",
    },
    autoplay: { delay: 5000 },
  });

});
