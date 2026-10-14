const themeToggle = document.querySelector("[data-theme-toggle]");

const updateThemeToggle = () => {
  const isLight = document.documentElement.dataset.theme === "light";
  themeToggle.setAttribute("aria-pressed", String(isLight));
  themeToggle.setAttribute(
    "aria-label",
    window.portfolioText(
      isLight ? "theme.switchToDark" : "theme.switchToLight",
    ),
  );
};

themeToggle.addEventListener("click", () => {
  if (document.documentElement.dataset.theme === "light") {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = "light";
  }
  updateThemeToggle();
});

const projectCards = [...document.querySelectorAll(".project-card")];
const projectFilters = [...document.querySelectorAll("[data-project-filter]")];

projectFilters.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.projectFilter;

    projectFilters.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("is-active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });

    projectCards.forEach((card) => {
      card.hidden =
        filter !== "all" &&
        !card.dataset.projectTech.split(" ").includes(filter);
    });
  });
});

const navigationLinks = document.querySelectorAll(
  ".sidenav__link, .mobile-nav__link",
);
const updateActiveNavigation = () => {
  const activeHash = window.location.hash || "#home";
  navigationLinks.forEach((link) => {
    if (link.getAttribute("href") === activeHash) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

window.addEventListener("hashchange", updateActiveNavigation);
updateActiveNavigation();

const revealCards = document.querySelectorAll(".reveal");
if (
  "IntersectionObserver" in window &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  revealCards.forEach((card) => revealObserver.observe(card));
} else {
  revealCards.forEach((card) => card.classList.add("is-visible"));
}

const contactForm = document.querySelector(".contact-form");
const formStatus = document.querySelector("[data-form-status]");
const submitButton = contactForm.querySelector('button[type="submit"]');
const submitLabel = submitButton.querySelector("[data-i18n]");

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  formStatus.hidden = false;
  formStatus.dataset.state = "sending";
  formStatus.textContent = window.portfolioText("contact.sending");
  submitLabel.textContent = window.portfolioText("contact.sending");
  submitButton.disabled = true;
  contactForm.setAttribute("aria-busy", "true");

  try {
    const response = await fetch(contactForm.action, {
      method: "POST",
      body: new FormData(contactForm),
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Formspree returned HTTP ${response.status}`);
    }

    formStatus.dataset.state = "success";
    formStatus.textContent = window.portfolioText("contact.sent");
    contactForm.reset();
  } catch (error) {
    console.error("Contact form submission failed:", error);
    formStatus.dataset.state = "error";
    formStatus.textContent = window.portfolioText("contact.sendError");
  } finally {
    submitLabel.textContent = window.portfolioText("contact.send");
    submitButton.disabled = false;
    contactForm.removeAttribute("aria-busy");
  }
});
