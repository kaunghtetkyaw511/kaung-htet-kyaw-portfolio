const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const themeToggle = document.querySelector("[data-theme-toggle]");

const refreshIcons = () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
};

const syncThemeIcon = () => {
  const icon = themeToggle?.querySelector("svg, [data-lucide]");
  if (icon) {
    icon.outerHTML = `<i data-lucide="${
      document.documentElement.dataset.theme === "dark" ? "moon" : "sun"
    }"></i>`;
  }
};

const setMenu = (open) => {
  menuToggle?.setAttribute("aria-expanded", String(open));
  siteNav?.classList.toggle("is-open", open);
  header?.classList.toggle("menu-active", open);
  document.body.classList.toggle("menu-open", open);

  const menuIcon = menuToggle?.querySelector("svg");
  if (menuIcon) {
    menuIcon.outerHTML = `<i data-lucide="${open ? "x" : "menu"}"></i>`;
    refreshIcons();
  }
};

menuToggle?.addEventListener("click", () => {
  setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
});

siteNav?.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenu(false);
});

const setHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 32);
};

window.addEventListener("scroll", setHeaderState, { passive: true });
setHeaderState();

themeToggle?.addEventListener("click", () => {
  const nextTheme =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = nextTheme;

  try {
    localStorage.setItem("north-form-theme", nextTheme);
  } catch {
    // Theme still applies when storage is unavailable.
  }

  syncThemeIcon();
  refreshIcons();
});

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

document.querySelector("[data-year]").textContent = new Date().getFullYear();
syncThemeIcon();
refreshIcons();
