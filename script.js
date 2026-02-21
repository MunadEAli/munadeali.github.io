/* 1) Year auto-update */
(() => {
  document.querySelectorAll('#year').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
})();

/* 2) VanillaTilt for cards (if included) */
if (window.VanillaTilt) {
  VanillaTilt.init(document.querySelectorAll('.tilt'), {
    max: 10,
    speed: 500,
    glare: true,
    'max-glare': 0.25,
  });
}

/* 3) Smooth scroll for anchors */
document.querySelectorAll('a[href^="#"]').forEach(a =>
  a.addEventListener('click', e => {
    const tgt = document.getElementById(a.getAttribute('href').slice(1));
    if (tgt) {
      e.preventDefault();
      tgt.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  })
);

/* 4) Reveal-on-scroll */
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll('.reveal, .card').forEach(el => observer.observe(el));

/* 5) Home page: filter Featured Projects when AI is clicked (index.html only) */
(() => {
  // Run only on index page (root) and only if the featured projects grid exists
  const grid = document.querySelector(".grid-8");
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll("a.card"));

  // AI project order requested
  const aiOrder = [
    "templates/projects/project-1.html",
    "templates/projects/project-3.html",
    "templates/projects/project-7.html",
    "templates/projects/project-5.html",
    "templates/projects/project-2.html",
    "templates/projects/project-13.html"
  ];

  const showAll = () => {
    cards.forEach(c => (c.style.display = ""));
  };

  const showAI = () => {
    // Hide all first
    cards.forEach(c => (c.style.display = "none"));

    // Show + reorder the 6 AI cards
    aiOrder.forEach(path => {
      const card = cards.find(c => {
        // Match robustly (works even if you later change domain)
        const href = c.getAttribute("href") || "";
        return href.endsWith(path) || href.includes(path) || href.endsWith(path.split("/").pop());
      });

      if (card) {
        card.style.display = "";
        grid.appendChild(card); // move to end in correct order
      }
    });
  };

  // Attach to BOTH: AI button and navbar AI link
  const aiBtn = document.querySelector(".ai-btn");
  const navAi = document.querySelector('.nav__links a[href="#ai-projects"]');

  if (aiBtn) {
    aiBtn.addEventListener("click", () => {
      showAI();
      // let your smooth-scroll handler still run (no preventDefault here)
    });
  }

  if (navAi) {
    navAi.addEventListener("click", () => {
      showAI();
      // let your smooth-scroll handler still run (no preventDefault here)
    });
  }

  // Optional: if you ever want a URL like index.html#ai-projects to auto-filter on load:
  if (location.hash === "#ai-projects") showAI();

  // NOTE: We intentionally do NOT change Robotics/Others behavior yet.
  //       Everything else on your site remains untouched.
})();