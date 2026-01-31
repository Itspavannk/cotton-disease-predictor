document.addEventListener("DOMContentLoaded", () => {
  // Single shared observer for better performance
  const observerOptions = { 
    threshold: 0.3,
    rootMargin: '0px 0px -50px 0px'
  };

  // Create one shared IntersectionObserver for all elements
  const sharedObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target;
        
        // Add appropriate class based on element's data attribute
        const animationType = element.getAttribute('data-animation');
        if (animationType) {
          // Use requestAnimationFrame for smooth animation
          requestAnimationFrame(() => {
            element.classList.add(animationType);
          });
        }
        
        // Unobserve after animation is triggered (one-time animation)
        sharedObserver.unobserve(element);
      }
    });
  }, observerOptions);

  // Separate observer for staggered animations (service cards, steps)
  const staggeredObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const elements = entry.target.querySelectorAll('[data-stagger]');
        
        elements.forEach((el, index) => {
          const delay = parseInt(el.getAttribute('data-stagger-delay')) || 200;
          setTimeout(() => {
            const animationType = el.getAttribute('data-animation');
            if (animationType) {
              requestAnimationFrame(() => {
                el.classList.add(animationType);
              });
            }
          }, index * delay);
        });
        
        staggeredObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe simple animated elements
  const simpleAnimated = [
    { selector: '.about-image', animation: 'active-left' },
    { selector: '.about-content', animation: 'active-right' },
    { selector: '.predict-header', animation: 'active-top' },
    { selector: '.predict-grid', animation: 'active-top' },
    { selector: '.how-x-title', animation: 'active-top' },
    { selector: '.how-x-sub', animation: 'active-top' },
    { selector: '.contact-main-heading', animation: 'active-top' },
    { selector: '.contact-main-tagline', animation: 'active-top' },
    { selector: '.contact-container', animation: 'active-contact-left' },
    { selector: '.about-me-ultra', animation: 'active-contact-right' }
  ];

  simpleAnimated.forEach(({ selector, animation }) => {
    const element = document.querySelector(selector);
    if (element) {
      element.setAttribute('data-animation', animation);
      sharedObserver.observe(element);
    }
  });

  // Observe service cards with stagger
  const serviceCards = document.querySelectorAll('.services-x-card');
  if (serviceCards.length > 0) {
    serviceCards.forEach(card => {
      card.setAttribute('data-animation', 'active-fade');
      card.setAttribute('data-stagger', 'true');
      card.setAttribute('data-stagger-delay', '200');
    });
    
    const servicesSection = document.querySelector('.services-x-section');
    if (servicesSection) {
      staggeredObserver.observe(servicesSection);
    }
  }

  // Observe How It Works steps with stagger
  const howStepsLeft = document.querySelectorAll('.how-x-step.left');
  const howStepsRight = document.querySelectorAll('.how-x-step.right');
  
  if (howStepsLeft.length > 0) {
    howStepsLeft.forEach(step => {
      step.setAttribute('data-animation', 'active-step-left');
      step.setAttribute('data-stagger', 'true');
      step.setAttribute('data-stagger-delay', '300');
    });
  }
  
  if (howStepsRight.length > 0) {
    howStepsRight.forEach(step => {
      step.setAttribute('data-animation', 'active-step-right');
      step.setAttribute('data-stagger', 'true');
      step.setAttribute('data-stagger-delay', '300');
    });
  }

  const howSection = document.querySelector('.how-x-timeline');
  if (howSection) {
    staggeredObserver.observe(howSection);
  }
});
