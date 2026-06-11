const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const siteHeader = document.querySelector(".site-header");
const body = document.body;

const setMenuOpen = (isOpen) => {
  navToggle?.setAttribute("aria-expanded", String(isOpen));
  siteNav?.classList.toggle("is-open", isOpen);
  siteHeader?.classList.toggle("menu-open", isOpen);
  body.classList.toggle("menu-open", isOpen);
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
  siteHeader?.classList.toggle("is-scrolled", window.scrollY > 36);
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

updateParallax();

const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxCaption = document.querySelector("[data-lightbox-caption]");
const lightboxClose = document.querySelector("[data-lightbox-close]");
let lastFocusedElement = null;

const openDialog = (dialog) => {
  if (!dialog) return;

  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }

  body.classList.add("modal-open");
};

const isDialogOpen = (dialog) =>
  Boolean(dialog?.open || dialog?.hasAttribute("open"));

const closeDialog = (dialog) => {
  if (typeof dialog?.close === "function") {
    dialog.close();
  } else {
    dialog?.removeAttribute("open");
  }

  if (![lightbox, reelModal, contentModal].some(isDialogOpen)) {
    body.classList.remove("modal-open");
  }

  lastFocusedElement?.focus();
};

document.querySelectorAll("[data-image]").forEach((button) => {
  button.addEventListener("click", () => {
    lastFocusedElement = button;
    lightboxImage.src = button.dataset.image;
    lightboxImage.alt = button.querySelector("img")?.alt ?? "";
    lightboxCaption.textContent = button.dataset.caption ?? "";
    openDialog(lightbox);
  });
});

lightboxClose?.addEventListener("click", () => closeDialog(lightbox));

lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeDialog(lightbox);
  }
});

const reelModal = document.querySelector("[data-reel-modal]");
const reelStage = document.querySelector(".reel-stage");
const reelImage = document.querySelector("[data-reel-image]");
const reelTitle = document.querySelector("[data-reel-title]");
const reelSummary = document.querySelector("[data-reel-summary]");
const reelClose = document.querySelector("[data-reel-close]");

document.querySelectorAll("[data-reel]").forEach((button) => {
  button.addEventListener("click", () => {
    lastFocusedElement = button;
    reelStage?.classList.remove("is-placeholder");
    reelImage.src = button.dataset.reel;
    reelImage.alt = button.querySelector("img")?.alt ?? "";
    reelTitle.textContent = button.dataset.title ?? "Motion reel";
    if (reelSummary) {
      reelSummary.textContent =
        button.dataset.reelSummary ??
        "This area is ready for a final MP4 file or video embed.";
    }
    openDialog(reelModal);
  });
});

document.querySelectorAll("[data-video-slot]").forEach((button) => {
  button.addEventListener("click", () => {
    lastFocusedElement = button;
    reelStage?.classList.add("is-placeholder");
    reelImage.removeAttribute("src");
    reelImage.alt = "";
    reelTitle.textContent =
      button.dataset.title ??
      button.querySelector("strong")?.textContent ??
      "Motion reel";
    if (reelSummary) {
      reelSummary.textContent =
        button.dataset.reelSummary ??
        "This video slot is ready for a final MP4 file, reel preview, or embedded video.";
    }
    openDialog(reelModal);
  });
});

reelClose?.addEventListener("click", () => closeDialog(reelModal));

reelModal?.addEventListener("click", (event) => {
  if (event.target === reelModal) {
    closeDialog(reelModal);
  }
});

const contentModal = document.querySelector("[data-content-modal]");
const contentCategory = document.querySelector("[data-content-category]");
const contentTitle = document.querySelector("[data-content-title]");
const contentSummary = document.querySelector("[data-content-summary]");
const contentMyanmar = document.querySelector("[data-content-mm]");
const contentEnglish = document.querySelector("[data-content-en]");
const contentDirection = document.querySelector("[data-content-direction]");
const contentClose = document.querySelector("[data-content-close]");

const contentSamples = {
  "travel-package": {
    category: "01 / Travel Agency Content",
    title: "Thailand Travel Package",
    summary:
      "A bilingual travel package concept for Thailand trips, focusing on easy planning, booking support, sightseeing, and a confident CTA.",
    mm: [
      "ခရီးသွားချင်တယ်... ဒါပေမဲ့ အစအဆုံးစီစဉ်ရတာ မလွယ်ဘူးလား?",
      "Thailand ခရီးစဉ်ကို စိတ်အေးလက်အေးသွားချင်တဲ့သူတွေအတွက် hotel booking, transportation, airport pickup, city tour, sightseeing plan တွေကအစ သေချာစီစဉ်ပေးနိုင်တဲ့ travel service concept ဖြစ်ပါတယ်။",
      "Bangkok shopping, temple tour, night market, beach trip, family trip တွေအတွက် package ရွေးချယ်နိုင်ပြီး ခရီးကို ပိုအဆင်ပြေ၊ ပိုပျော်စေဖို့ message ကိုရေးထားပါတယ်။",
      "CTA: Thailand trip သွားဖို့စီစဉ်နေတယ်ဆိုရင် အခုပဲ ဆက်သွယ်လိုက်ပါ။",
    ],
    en: [
      "Planning a Thailand trip but do not want the stress of arranging everything yourself?",
      "This travel service copy presents hotel booking, transportation, airport pickup, city tours, and sightseeing support in a clear and friendly way.",
      "It works for Bangkok trips, temple tours, shopping plans, night markets, beach holidays, and family travel packages.",
      "CTA: Planning to visit Thailand? Contact us today and start your journey with confidence.",
    ],
    direction:
      "Use a warm travel visual, clean itinerary blocks, soft blue/green accents, and a clear contact button.",
  },
  "visa-flight-hotel": {
    category: "02 / Travel Agency Content",
    title: "Visa, Flight Ticket & Hotel Booking",
    summary:
      "Service promotion copy for travelers who need ticket booking, hotel reservation, visa support, insurance guidance, and planning help.",
    mm: [
      "ခရီးသွားဖို့ စီစဉ်နေပြီလား?",
      "Flight ticket, hotel booking, visa document, travel insurance တွေကို တစ်ခုချင်းစီလုပ်ရတာ အချိန်ကုန်ပြီး စိတ်ရှုပ်စရာဖြစ်တတ်ပါတယ်။",
      "Ticket booking, visa support, hotel reservation, travel plan တွေကို တစ်နေရာတည်းကနေ ကူညီပေးနိုင်တဲ့ service message အဖြစ်ရေးထားပါတယ်။",
      "CTA: Flight ticket, hotel booking, visa support လိုအပ်ရင် အခုပဲ ဆက်သွယ်နိုင်ပါတယ်။",
    ],
    en: [
      "Ready to plan your next trip?",
      "Booking flights, arranging hotels, preparing visa documents, and checking travel requirements can take time and effort.",
      "This content positions the service as one place for tickets, hotel reservation, visa support, insurance guidance, and travel planning.",
      "CTA: Need help with tickets, hotels, or visa support? Contact us today.",
    ],
    direction:
      "Use document, passport, ticket, and hotel icons with short benefit points and a trustworthy layout.",
  },
  "group-tour": {
    category: "03 / Travel Agency Content",
    title: "Group Tour Promotion",
    summary:
      "A group tour campaign for families, friends, company trips, school trips, and seat reservation promotion.",
    mm: [
      "သူငယ်ချင်းတွေ၊ မိသားစုတွေနဲ့ အတူတူခရီးထွက်ချင်လား?",
      "Group tour ဆိုတာ transportation, hotel, sightseeing places, daily schedule တွေစီစဉ်ထားပြီးသားဖြစ်လို့ အားလုံးအတူတူ ပိုအဆင်ပြေပြေ ခရီးသွားနိုင်တဲ့ concept ဖြစ်ပါတယ်။",
      "Family trip, friends trip, company trip, school trip တွေအတွက် memories ကောင်းကောင်းဖန်တီးနိုင်တဲ့ emotional message ကိုထည့်ထားပါတယ်။",
      "CTA: Group tour join ချင်တယ်ဆိုရင် seat မပြည့်ခင် reservation လုပ်ထားလိုက်ပါ။",
    ],
    en: [
      "Want to travel with your friends, family, or team?",
      "A group tour helps people enjoy a trip together without worrying about every planning detail.",
      "The copy highlights transportation, hotel arrangements, sightseeing places, daily schedules, and shared memories.",
      "CTA: Join our group tour and reserve your seat before it is full.",
    ],
    direction:
      "Use group travel imagery, seat availability badge, route line graphics, and a strong reservation CTA.",
  },
  "creative-learning": {
    category: "04 / Education Content",
    title: "Creative Learning Project",
    summary:
      "An education concept for schools, training centers, online classes, design courses, and learning programs.",
    mm: [
      "သင်ယူခြင်းဆိုတာ စာအုပ်ထဲက အသိပညာတစ်ခုတည်းမဟုတ်ပါဘူး။",
      "ကောင်းတဲ့ learning environment တစ်ခုက creativity, confidence, communication skill နဲ့ personal growth တွေကိုပါ တိုးတက်စေပါတယ်။",
      "School, training center, online class, design course, learning program တွေအတွက် clean layout, readable typography, friendly color tone နဲ့ structured information ကိုအဓိကထားရေးထားပါတယ်။",
      "CTA: Learn today. Create tomorrow.",
    ],
    en: [
      "Learning is not only about books.",
      "A good learning experience helps people grow in creativity, confidence, communication, and real-life skills.",
      "This concept presents education content in a clean, friendly, trustworthy, and modern way for schools and learning programs.",
      "CTA: Learn today. Create tomorrow.",
    ],
    direction:
      "Use friendly colors, readable type, organized modules, student imagery, and a calm professional tone.",
  },
  "restaurant-reel": {
    category: "05 / Reels Content",
    title: "Restaurant Reels Script",
    summary:
      "A food reel script with close-up shots, cooking process, final plating, customer mood, screen text, and caption.",
    mm: [
      "Reels Idea: Delicious Food in Every Bite",
      "Food reels တစ်ပုဒ်က ပထမ ၃ စက္ကန့်အတွင်းမှာ ကြည့်သူကို စိတ်ဝင်စားစေရမယ်။",
      "Scene flow: Fresh ingredients, cooking process, plating details, aesthetic food set, restaurant name and offer.",
      "Caption: အရသာကောင်းတဲ့ အစားအစာတွေက နေ့တစ်နေ့ကို ပိုပြီးပြည့်စုံစေပါတယ်။ Freshly prepared, beautifully served, and ready for you.",
    ],
    en: [
      "Reels Idea: Delicious Food in Every Bite",
      "A good food reel should catch attention within the first few seconds through close-up shots, cooking moments, final plating, and appetite appeal.",
      "Screen text flow: Fresh & Clean Ingredients, Cooked with Care, Rich Taste, Perfect Bite, Good Food, Good Mood, Order Now.",
      "Caption: Good food makes every moment better. Freshly prepared, beautifully served, and ready for you.",
    ],
    direction:
      "Use warm lighting, smooth transitions, close-up food shots, sauce details, and a final offer screen.",
  },
  "coffee-reel": {
    category: "06 / Reels Content",
    title: "Coffee Shop Reels Script",
    summary:
      "A cozy coffee shop reel script for premium beans, espresso pouring, latte art, cafe mood, and visit CTA.",
    mm: [
      "Reels Idea: Fresh Coffee, Fresh Mood",
      "Coffee shop reels တစ်ပုဒ်က cozy ဖြစ်ရမယ်၊ mood ကောင်းရမယ်၊ ကြည့်သူကို coffee သောက်ချင်စိတ်ဖြစ်စေရမယ်။",
      "Scene flow: Coffee beans close-up, espresso pouring, latte art, customer cafe mood, cafe name and location.",
      "Caption: တစ်နေ့တာကို coffee ကောင်းကောင်းလေးနဲ့ စလိုက်ပါ။ Fresh brew, warm mood, and a little moment for yourself.",
    ],
    en: [
      "Reels Idea: Fresh Coffee, Fresh Mood",
      "A coffee shop reel should feel cozy, warm, and inviting enough to make viewers want a cup right away.",
      "Screen text flow: Premium Coffee Beans, Freshly Brewed, Made with Passion, Your Daily Comfort, Visit Us Today.",
      "Caption: Start your day with a good cup of coffee. Fresh brew, warm mood, and a little moment for yourself.",
    ],
    direction:
      "Use brown and cream colors, soft music, slow camera movement, foam details, and warm cafe atmosphere.",
  },
  "food-coffee-promo": {
    category: "07 / Restaurant and Cafe Content",
    title: "Food & Coffee Special Deal",
    summary:
      "A special promotion post concept for food and coffee combo offers, discount badges, price highlight, and CTA.",
    mm: [
      "Food & Coffee Lover တွေအတွက် Special Deal လာပါပြီ။",
      "နေ့လယ်စာစားမလား၊ coffee date လုပ်မလား၊ သူငယ်ချင်းတွေနဲ့ chill မလား - ဒီ promotion က အားလုံးအတွက် သင့်တော်ပါတယ်။",
      "Food and drink combo, discount badge, price highlight, CTA button တွေကို ထင်ရှားအောင်ရေးထားတဲ့ promotion concept ဖြစ်ပါတယ်။",
      "CTA: ဒီ offer လေးမလွတ်ခင် အခုပဲ order လုပ်လိုက်ပါ။",
    ],
    en: [
      "Special Deal for Food & Coffee Lovers",
      "Whether for lunch, a coffee date, or a chill moment with friends, this promotion is made to feel simple and attractive.",
      "The copy focuses on delicious food, fresh drinks, a limited-time price, and an easy-to-understand offer.",
      "CTA: Grab this offer before it ends.",
    ],
    direction:
      "Use a food-and-drink hero image, bold discount badge, price card, and a high-contrast order button.",
  },
  "brand-awareness": {
    category: "08 / Social Media Content",
    title: "Brand Awareness Content",
    summary:
      "A social media content concept about brand consistency, visual trust, message clarity, and stronger online presence.",
    mm: [
      "Online မှာ Brand တစ်ခုကို လူတွေမှတ်မိစေချင်ရင် visual က အရမ်းအရေးကြီးပါတယ်။",
      "Brand color, typography, layout, content message, visual style တွေတစ်ခုနဲ့တစ်ခုကိုက်ညီဖို့လိုပါတယ်။",
      "ဒီ concept က business page, startup, online shop, service brand, agency, personal brand တွေအတွက် သင့်တော်တဲ့ brand awareness post ဖြစ်ပါတယ်။",
      "CTA: သင့် brand ကို online မှာ ပိုပြီး professional ဖြစ်အောင် တည်ဆောက်လိုက်ပါ။",
    ],
    en: [
      "If you want people to remember your brand online, visuals matter.",
      "Brand colors, typography, layout, message, and visual style need to work together to build trust and recognition.",
      "This concept is suitable for business pages, startups, online shops, service brands, agencies, and personal brands.",
      "CTA: Build your brand online with better visuals and clearer communication.",
    ],
    direction:
      "Use brand color blocks, sample post frames, short message points, and a premium business-page layout.",
  },
  "product-promo": {
    category: "09 / Social Media Content",
    title: "Product Promotion",
    summary:
      "A product promotion writing sample focused on product clarity, benefit, feature, offer, value, and purchase motivation.",
    mm: [
      "Product ကောင်းတစ်ခုရှိတယ်ဆိုရင် presentation ကောင်းကောင်းနဲ့ပြဖို့လိုပါတယ်။",
      "Customer တစ်ယောက်က product post တစ်ခုကိုမြင်တဲ့အခါ ဘာ product လဲ၊ ဘာအသုံးဝင်လဲ၊ ဘာကြောင့်ဝယ်သင့်လဲဆိုတာ ခဏအတွင်းနားလည်ရမယ်။",
      "Product ကို main focus ထားပြီး background clean, headline clear, price, offer, feature, CTA တွေကိုရှင်းရှင်းထည့်ဖို့ရေးထားပါတယ်။",
      "CTA: သင့် product ကို ပိုပြီးထင်ရှားအောင် professional design နဲ့ promote လုပ်လိုက်ပါ။",
    ],
    en: [
      "A good product needs good presentation.",
      "When customers see a product post, they should quickly understand what the product is, how it helps, and why they should buy it.",
      "This concept works for online shops, beauty products, fashion items, gadgets, food products, accessories, and lifestyle brands.",
      "CTA: Promote your product with visuals that make people stop and notice.",
    ],
    direction:
      "Use a clean product cutout, feature chips, price highlight, offer label, and focused product lighting.",
  },
  "service-promo": {
    category: "10 / Social Media Content",
    title: "Service Promotion",
    summary:
      "A service promotion concept for communicating trust, benefits, process, result, contact information, and CTA.",
    mm: [
      "Service တစ်ခုကို promote လုပ်တဲ့အခါ message ရှင်းဖို့ အရမ်းအရေးကြီးပါတယ်။",
      "Service promotion design မှာ trust, benefit, process, result တွေကို ရှင်းရှင်းလင်းလင်းပြနိုင်ဖို့လိုပါတယ်။",
      "Travel agency, design studio, marketing agency, beauty salon, education center, real estate, consulting service, online service တွေအတွက် အသုံးပြုနိုင်တဲ့ concept ဖြစ်ပါတယ်။",
      "CTA: သင့် service ကို customer တွေနားလည်လွယ်အောင် professional post design နဲ့ promote လုပ်လိုက်ပါ။",
    ],
    en: [
      "When promoting a service, a clear message is very important.",
      "Service content should communicate trust, benefits, process, and results in a simple way.",
      "This concept is suitable for agencies, salons, education centers, real estate businesses, consulting services, and online service brands.",
      "CTA: Promote your service with a clean, professional, and easy-to-understand design.",
    ],
    direction:
      "Use service icons, short benefit points, contact details, step cards, and a clear final call-to-action.",
  },
};

const renderParagraphs = (container, paragraphs) => {
  if (!container) return;
  container.replaceChildren();
  paragraphs.forEach((text) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    container.append(paragraph);
  });
};

document.querySelectorAll("[data-content-id]").forEach((button) => {
  button.addEventListener("click", () => {
    const sample = contentSamples[button.dataset.contentId];
    if (!sample) return;

    lastFocusedElement = button;
    contentCategory.textContent = sample.category;
    contentTitle.textContent = sample.title;
    contentSummary.textContent = sample.summary;
    renderParagraphs(contentMyanmar, sample.mm);
    renderParagraphs(contentEnglish, sample.en);
    renderParagraphs(contentDirection, [sample.direction]);
    openDialog(contentModal);
  });
});

contentClose?.addEventListener("click", () => closeDialog(contentModal));

contentModal?.addEventListener("click", (event) => {
  if (event.target === contentModal) {
    closeDialog(contentModal);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (isDialogOpen(lightbox)) closeDialog(lightbox);
    if (isDialogOpen(reelModal)) closeDialog(reelModal);
    if (isDialogOpen(contentModal)) closeDialog(contentModal);
    setMenuOpen(false);
  }
});

document.querySelector("[data-year]").textContent = new Date().getFullYear();
