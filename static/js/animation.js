document.addEventListener("DOMContentLoaded", () => {
  const target = document.querySelector(".reveal-left");
  if (!target) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.3 }
  );

  observer.observe(target);
});
