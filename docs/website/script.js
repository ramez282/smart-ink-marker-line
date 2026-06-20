const backToTopButton = document.getElementById("backToTop");

backToTopButton?.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const slides = Array.from(carousel.querySelectorAll(".carousel-slide"));
  const dots = Array.from(carousel.querySelectorAll(".carousel-dot"));
  const previousButton = carousel.querySelector(".carousel-prev");
  const nextButton = carousel.querySelector(".carousel-next");
  let activeIndex = 0;
  let isPaused = false;
  let slideTimer;

  const showSlide = (nextIndex) => {
    activeIndex = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      slide.classList.toggle("is-active", index === activeIndex);
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === activeIndex);
      dot.setAttribute("aria-current", index === activeIndex ? "true" : "false");
    });
  };

  const startTimer = () => {
    window.clearInterval(slideTimer);
    slideTimer = window.setInterval(() => {
      if (!isPaused) {
        showSlide(activeIndex + 1);
      }
    }, 3000);
  };

  const togglePause = () => {
    isPaused = !isPaused;
    carousel.classList.toggle("is-paused", isPaused);
    carousel.setAttribute("aria-live", isPaused ? "polite" : "off");
  };

  previousButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    showSlide(activeIndex - 1);
    startTimer();
  });

  nextButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    showSlide(activeIndex + 1);
    startTimer();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", (event) => {
      event.stopPropagation();
      showSlide(index);
      startTimer();
    });
  });

  carousel.addEventListener("click", togglePause);
  showSlide(activeIndex);
  startTimer();
});
