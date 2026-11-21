/* Shared page enhancements. */
document.querySelectorAll('#year').forEach(el => {
  el.textContent = new Date().getFullYear();
});

function initTilt(root = document) {
  if (window.VanillaTilt) {
    const cards = Array.from(root.querySelectorAll('.tilt')).filter(card => !card.vanillaTilt);
    VanillaTilt.init(cards, {
      max: 10, speed: 500, glare: true, 'max-glare': 0.25,
    });
  }
}

/* One controller owns category rendering, navigation and URL state. */
(() => {
  const grid = document.getElementById('projectGrid');
  if (!grid) return;

  const title = document.getElementById('ai-projects');
  const aiMarkup = grid.innerHTML;
  const categories = {
    '#ai-projects': { title: 'AI Projects', markup: aiMarkup },
    '#rmc-projects': {
      title: 'Robotics Projects',
      markup: document.getElementById('roboticsCards').innerHTML,
    },
    '#other-projects': {
      title: 'Other Projects',
      markup: document.getElementById('otherCards').innerHTML,
    },
  };
  const links = Array.from(document.querySelectorAll('a[href^="#"]'))
    .filter(link => Object.hasOwn(categories, link.getAttribute('href')));

  function renderCategory() {
    const hash = location.hash.toLowerCase();
    const category = categories[hash] || { title: 'Featured Projects', markup: aiMarkup };
    grid.querySelectorAll('.tilt').forEach(card => card.vanillaTilt?.destroy());
    grid.innerHTML = category.markup;
    title.textContent = category.title;
    links.forEach(link => {
      const selected = link.getAttribute('href') === hash;
      link.classList.toggle('active', selected);
      if (selected) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    const home = document.querySelector('.nav__links a[href="index.html"]');
    if (home) home.classList.toggle('active', !Object.hasOwn(categories, hash));
    initTilt(grid);
  }

  links.forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    const hash = link.getAttribute('href');
    if (location.hash !== hash) history.pushState(null, '', hash);
    renderCategory();
    title.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  window.addEventListener('hashchange', renderCategory);
  renderCategory();
  if (Object.hasOwn(categories, location.hash.toLowerCase())) {
    title.scrollIntoView({ block: 'start' });
  }
})();

initTilt();

/* Smooth scrolling for ordinary in-page links. */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    if (event.defaultPrevented) return;
    const target = document.getElementById(link.getAttribute('href').slice(1));
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* Reveal content, including a fallback for older browsers. */
const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealElements.forEach(el => observer.observe(el));
} else {
  revealElements.forEach(el => el.classList.add('in-view'));
}
