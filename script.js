const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const body = document.body;

const setMenuOpen = (isOpen) => {
  navToggle?.setAttribute("aria-expanded", String(isOpen));
  siteNav?.classList.toggle("is-open", isOpen);
  body.classList.toggle("modal-open", isOpen);
};

navToggle?.addEventListener("click", () => {
  setMenuOpen(navToggle.getAttribute("aria-expanded") !== "true");
});

siteNav?.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    setMenuOpen(false);
  }
});

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

let parallaxQueued = false;

const updateParallax = () => {
  const shift = Math.min(window.scrollY * 0.09, 70);
  document.documentElement.style.setProperty("--hero-shift", `${shift}px`);
  parallaxQueued = false;
};

window.addEventListener(
  "scroll",
  () => {
    if (!parallaxQueued) {
      window.requestAnimationFrame(updateParallax);
      parallaxQueued = true;
    }
  },
  { passive: true },
);

const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxCaption = document.querySelector("[data-lightbox-caption]");
const lightboxClose = document.querySelector("[data-lightbox-close]");
let lastFocusedElement = null;

const closeDialog = (dialog) => {
  dialog?.close();
  body.classList.remove("modal-open");
  lastFocusedElement?.focus();
};

document.querySelectorAll("[data-image]").forEach((button) => {
  button.addEventListener("click", () => {
    lastFocusedElement = button;
    lightboxImage.src = button.dataset.image;
    lightboxImage.alt = button.querySelector("img")?.alt ?? "";
    lightboxCaption.textContent = button.dataset.caption ?? "";
    lightbox.showModal();
    body.classList.add("modal-open");
  });
});

lightboxClose?.addEventListener("click", () => closeDialog(lightbox));

lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeDialog(lightbox);
  }
});

const reelModal = document.querySelector("[data-reel-modal]");
const reelImage = document.querySelector("[data-reel-image]");
const reelTitle = document.querySelector("[data-reel-title]");
const reelClose = document.querySelector("[data-reel-close]");

document.querySelectorAll("[data-reel]").forEach((button) => {
  button.addEventListener("click", () => {
    lastFocusedElement = button;
    reelImage.src = button.dataset.reel;
    reelImage.alt = button.querySelector("img")?.alt ?? "";
    reelTitle.textContent = button.dataset.title ?? "Motion reel";
    reelModal.showModal();
    body.classList.add("modal-open");
  });
});

reelClose?.addEventListener("click", () => closeDialog(reelModal));

reelModal?.addEventListener("click", (event) => {
  if (event.target === reelModal) {
    closeDialog(reelModal);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (lightbox?.open) closeDialog(lightbox);
    if (reelModal?.open) closeDialog(reelModal);
    setMenuOpen(false);
  }
});

document.querySelector("[data-year]").textContent = new Date().getFullYear();
