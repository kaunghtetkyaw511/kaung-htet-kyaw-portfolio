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
const reelVideo = document.querySelector("[data-reel-video]");
const reelTitle = document.querySelector("[data-reel-title]");
const reelSummary = reelModal?.querySelector("[data-reel-summary]");
const reelSource = reelModal?.querySelector("[data-reel-source]");
const reelClose = document.querySelector("[data-reel-close]");

document.querySelectorAll("[data-reel]").forEach((button) => {
  button.addEventListener("click", () => {
    lastFocusedElement = button;
    reelStage?.classList.remove("is-placeholder");
    reelStage?.classList.remove("has-video");
    reelVideo?.pause();
    if (reelVideo) {
      reelVideo.hidden = true;
      reelVideo.removeAttribute("src");
      reelVideo.removeAttribute("poster");
      reelVideo.load();
    }
    reelImage.hidden = false;
    reelImage.src = button.dataset.reel;
    reelImage.alt = button.querySelector("img")?.alt ?? "";
    reelTitle.textContent = button.dataset.title ?? "Motion reel";
    if (reelSummary) {
      reelSummary.textContent =
        button.dataset.reelSummary ??
        "This area is ready for a final MP4 file or video embed.";
    }
    if (reelSource) {
      reelSource.hidden = true;
      reelSource.removeAttribute("href");
    }
    openDialog(reelModal);
  });
});

document.querySelectorAll("[data-video-src]").forEach((button) => {
  button.addEventListener("click", () => {
    lastFocusedElement = button;
    reelStage?.classList.remove("is-placeholder");
    reelStage?.classList.add("has-video");
    reelImage.hidden = true;
    reelImage.removeAttribute("src");
    reelImage.alt = "";
    if (reelVideo) {
      reelVideo.src = button.dataset.videoSrc;
      reelVideo.poster = button.dataset.videoPoster ?? "";
      reelVideo.hidden = false;
      reelVideo.currentTime = 0;
    }
    reelTitle.textContent = button.dataset.title ?? "Story reel";
    if (reelSummary) {
      reelSummary.textContent =
        button.dataset.reelSummary ??
        "A short vertical story reel edited for social media.";
    }
    if (reelSource) {
      const sourceUrl = button.dataset.sourceUrl;
      reelSource.hidden = !sourceUrl;
      if (sourceUrl) {
        reelSource.href = sourceUrl;
        reelSource.textContent =
          button.dataset.sourceLabel ?? "View footage source";
      } else {
        reelSource.removeAttribute("href");
        reelSource.textContent = "";
      }
    }
    openDialog(reelModal);
    reelVideo?.play().catch(() => {});
  });
});

document.querySelectorAll("[data-video-slot]").forEach((button) => {
  button.addEventListener("click", () => {
    lastFocusedElement = button;
    reelStage?.classList.add("is-placeholder");
    reelStage?.classList.remove("has-video");
    reelVideo?.pause();
    if (reelVideo) {
      reelVideo.hidden = true;
      reelVideo.removeAttribute("src");
      reelVideo.removeAttribute("poster");
      reelVideo.load();
    }
    reelImage.hidden = false;
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
    if (reelSource) {
      reelSource.hidden = true;
      reelSource.removeAttribute("href");
    }
    openDialog(reelModal);
  });
});

const closeReel = () => {
  reelVideo?.pause();
  if (reelVideo) reelVideo.currentTime = 0;
  closeDialog(reelModal);
};

reelClose?.addEventListener("click", closeReel);

reelModal?.addEventListener("click", (event) => {
  if (event.target === reelModal) {
    closeReel();
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
      "Bilingual campaign copy for a comfortable, organized, and stress-free Thailand travel service.",
    mm: [
      "Thailand ခရီးသွားဖို့ စီစဉ်နေပါသလား? ✈️🇹🇭",
      "ခရီးသွားချင်ပေမဲ့ Hotel ရွေးရတာ၊ လေယာဉ်ကွင်းကနေ Pickup စီစဉ်ရတာ၊ သွားလည်မယ့်နေရာတွေ ရွေးရတာ၊ Transportation စီစဉ်ရတာတွေကြောင့် စိတ်ရှုပ်နေပြီလား?",
      "Thailand ကို စိတ်အေးလက်အေးနဲ့ အဆင်ပြေပြေ သွားချင်သူတွေအတွက် ကျွန်ုပ်တို့ရဲ့ Thailand Travel Service က ခရီးစဉ်အစအဆုံးကို သေချာစီစဉ်ကူညီပေးနိုင်ပါတယ်။",
      "ကျွန်ုပ်တို့ စီစဉ်ပေးနိုင်သော ဝန်ဆောင်မှုများမှာ—",
      "✅ Hotel Booking",
      "✅ Airport Pickup & Transfer",
      "✅ Private Car / Transportation Arrangement",
      "✅ Bangkok City Tour",
      "✅ Temple Tour & Cultural Sightseeing",
      "✅ Shopping Trip Arrangement",
      "✅ Night Market Visit",
      "✅ Beach Trip & Island Getaway Package",
      "✅ Family Trip / Group Trip Planning",
      "✅ Budget နှင့် Travel Date အလိုက် Customized Package",
      "Bangkok Shopping Trip သွားချင်တာလား?",
      "Thailand ရဲ့ နာမည်ကြီး Temple တွေ လည်ချင်တာလား?",
      "Night Market တွေသွားပြီး Local Food တွေ စမ်းစားချင်တာလား?",
      "Beach Trip သို့မဟုတ် Family Trip သွားချင်တာလား?",
      "သင်သွားချင်တဲ့ ခရီးစဉ်ပုံစံ၊ သွားမယ့်ရက်၊ လူဦးရေ၊ Budget နဲ့ စိတ်ဝင်စားတဲ့နေရာတွေကို ပြောပြပေးရုံနဲ့ သင့်အတွက် အဆင်ပြေဆုံး Travel Plan ကို စီစဉ်ကူညီပေးနိုင်ပါတယ်။",
      "ခရီးစဉ်တစ်လျှောက် အဆင်ပြေ၊ သက်သာ၊ စိတ်ချရပြီး ပျော်ရွှင်စရာကောင်းတဲ့ Thailand Trip ဖြစ်စေဖို့ ကျွန်ုပ်တို့က သေချာစွာ ကူညီပေးပါမယ်။",
      "📩 Thailand ခရီးစဉ်သွားဖို့ စီစဉ်နေတယ်ဆိုရင် Package အသေးစိတ်နဲ့ Travel Assistance အတွက် အခုပဲ Message ပို့ပြီး ဆက်သွယ်နိုင်ပါတယ်။",
    ],
    en: [
      "Planning a Trip to Thailand? Let Us Make It Easy for You! ✈️🇹🇭",
      "Traveling to Thailand is exciting, but planning everything by yourself can take a lot of time. From choosing the right hotel to arranging airport pickup, transportation, city tours, and sightseeing plans, every detail is important for a smooth and enjoyable trip.",
      "Our Thailand Travel Service is designed for travelers who want a comfortable, well-organized, and stress-free travel experience. Whether you are visiting Thailand for the first time or planning another holiday, we can help you arrange your trip from start to finish.",
      "Our travel services include:",
      "✅ Hotel Booking",
      "✅ Airport Pickup & Transfer Service",
      "✅ Private Car / Transportation Arrangement",
      "✅ Bangkok City Tour Planning",
      "✅ Temple Tour & Cultural Sightseeing",
      "✅ Shopping Trip Arrangement",
      "✅ Night Market Visit Planning",
      "✅ Beach Trip & Island Getaway Packages",
      "✅ Family Trip / Group Travel Planning",
      "✅ Customized Travel Packages based on your budget and schedule",
      "Whether you want to enjoy a Bangkok shopping trip, explore famous temples, visit night markets, try local food, relax on a beach holiday, or plan a family vacation, we can help you prepare a travel plan that matches your needs.",
      "Simply tell us your travel dates, number of travelers, preferred destinations, and budget. We will help you create a suitable travel package to make your Thailand trip easier, safer, and more enjoyable.",
      "Make your Thailand trip more convenient, comfortable, and memorable with a well-prepared travel plan.",
      "📩 Planning to visit Thailand soon? Send us a message today for package details and travel assistance.",
    ],
    direction:
      "Use a warm travel visual, clean itinerary blocks, soft blue/green accents, and a clear contact button.",
  },
  "visa-flight-hotel": {
    category: "02 / Travel Agency Content",
    title: "Visa, Flight Ticket & Hotel Booking",
    summary:
      "Bilingual one-stop travel assistance copy covering flights, hotels, visa documents, insurance, and trip planning.",
    mm: [
      "ခရီးသွားဖို့ စီစဉ်နေပြီလား? ✈️🌍",
      "နိုင်ငံခြားခရီးသွားဖို့ စီစဉ်တဲ့အခါ Flight Ticket ဝယ်ရတာ၊ Hotel Booking လုပ်ရတာ၊ Visa Document ပြင်ဆင်ရတာ၊ Travel Insurance စစ်ဆေးရတာ၊ Travel Requirement တွေကြည့်ရတာတွေက အချိန်ကုန်ပြီး စိတ်ရှုပ်စရာ ဖြစ်တတ်ပါတယ်။",
      "ခရီးစဉ်တစ်ခု အဆင်ပြေချောမွေ့ဖို့ဆိုရင် Ticket, Hotel, Visa, Insurance, Transportation နဲ့ Travel Plan တွေကို သေချာစီစဉ်ထားဖို့ လိုအပ်ပါတယ်။",
      "ကျွန်ုပ်တို့ရဲ့ Travel Service က သင့်ခရီးစဉ်အတွက် လိုအပ်တဲ့ ဝန်ဆောင်မှုတွေကို တစ်နေရာတည်းကနေ ကူညီစီစဉ်ပေးနိုင်ပါတယ်။",
      "ကျွန်ုပ်တို့ ကူညီပေးနိုင်သော ဝန်ဆောင်မှုများမှာ—",
      "✅ Flight Ticket Booking",
      "✅ Hotel Reservation",
      "✅ Visa Document Support",
      "✅ Travel Insurance Guidance",
      "✅ Travel Requirement Information",
      "✅ Travel Plan Arrangement",
      "✅ Airport Transfer / Transportation Assistance",
      "✅ Package Tour Consultation",
      "✅ Budget နှင့် Travel Date အလိုက် ခရီးစဉ် အကြံပြုခြင်း",
      "Business Trip သွားမလား?",
      "Family Trip စီစဉ်နေလား?",
      "Holiday Vacation သွားချင်တာလား?",
      "Visa လိုအပ်တဲ့နိုင်ငံကို သွားဖို့ ပြင်ဆင်နေတာလား?",
      "သင်သွားမယ့်နိုင်ငံ၊ ခရီးသွားမယ့်ရက်၊ လူဦးရေ၊ Budget နဲ့ လိုအပ်တဲ့ Service တွေကို ပြောပြပေးရုံနဲ့ သင့်အတွက် အဆင်ပြေဆုံး ခရီးစဉ်ကို စီစဉ်ကူညီပေးနိုင်ပါတယ်။",
      "ခရီးသွားဖို့ စိတ်ကူးရှိပေမဲ့ ဘယ်ကနေစရမလဲ မသိသေးဘူးဆိုရင်လည်း ကျွန်ုပ်တို့ကို Message ပို့ပြီး အကြံပြုချက်ရယူနိုင်ပါတယ်။",
      "ခရီးစဉ်အစအဆုံးကို ပိုအဆင်ပြေ၊ ပိုစိတ်ချရပြီး ပိုသေချာစေဖို့ Travel Service တစ်ခုတည်းကနေ ကူညီပေးပါမယ်။",
      "📩 Flight Ticket, Hotel Booking, Visa Support, Travel Insurance နဲ့ Travel Plan လိုအပ်နေတယ်ဆိုရင် အခုပဲ Message ပို့ပြီး ဆက်သွယ်နိုင်ပါတယ်။",
    ],
    en: [
      "Ready to Plan Your Next Trip? ✈️🌍",
      "Planning an international trip can be exciting, but it can also take a lot of time and effort. From booking flight tickets and reserving hotels to preparing visa documents, checking travel requirements, and arranging travel insurance, every detail needs to be handled carefully.",
      "A smooth trip starts with proper planning. That’s why our travel service is here to help you organize the important parts of your journey in one place.",
      "Our travel services include:",
      "✅ Flight Ticket Booking",
      "✅ Hotel Reservation",
      "✅ Visa Document Support",
      "✅ Travel Insurance Guidance",
      "✅ Travel Requirement Information",
      "✅ Travel Plan Arrangement",
      "✅ Airport Transfer / Transportation Assistance",
      "✅ Package Tour Consultation",
      "✅ Travel Suggestions based on your budget and schedule",
      "Whether you are planning a business trip, family vacation, holiday getaway, or a trip to a country that requires a visa, we can help you prepare the travel arrangements you need.",
      "Simply tell us your destination, travel dates, number of travelers, budget, and required services. We will assist you with suitable options and help make your travel planning easier and more convenient.",
      "If you want to travel but are not sure where to start, you can contact us for travel consultation and planning support.",
      "Make your next trip easier, more organized, and more worry-free with our one-stop travel assistance service.",
      "📩 Need help with flight tickets, hotel booking, visa support, travel insurance, or travel planning? Send us a message today for more details.",
    ],
    direction:
      "Use document, passport, ticket, and hotel icons with short benefit points and a trustworthy layout.",
  },
  "group-tour": {
    category: "03 / Travel Agency Content",
    title: "Group Tour Promotion",
    summary:
      "Bilingual group-tour campaign copy for families, friends, companies, schools, and shared travel memories.",
    mm: [
      "သူငယ်ချင်းတွေ၊ မိသားစုတွေ၊ အဖွဲ့အစည်းတွေနဲ့ အတူတူ ခရီးထွက်ချင်ပါသလား? 🚌✨",
      "ခရီးဆိုတာ နေရာအသစ်တွေကို သွားလည်ရုံတင်မကပါဘူး။ ကိုယ်ချစ်တဲ့သူတွေ၊ မိသားစုတွေ၊ သူငယ်ချင်းတွေ၊ အလုပ်အဖွဲ့တွေ၊ ကျောင်းအဖွဲ့တွေနဲ့အတူ ပျော်ရွှင်စရာအချိန်တွေ ဖန်တီးနိုင်တဲ့ အမှတ်တရတစ်ခုလည်း ဖြစ်ပါတယ်။",
      "Group Tour ဆိုတာ ခရီးစဉ်တစ်ခုလုံးကို အစအဆုံး စီစဉ်ထားပြီးသားဖြစ်လို့ ကိုယ်တိုင် transportation, hotel, sightseeing places, daily schedule တွေကို တစ်ခုချင်းစီ စိတ်ပူစရာမလိုဘဲ အားလုံးအတူတူ အဆင်ပြေပြေ ခရီးသွားနိုင်တဲ့ package tour ဖြစ်ပါတယ်။",
      "ကျွန်ုပ်တို့ရဲ့ Group Tour Service မှာ—",
      "✅ Transportation စီစဉ်ပေးခြင်း",
      "✅ Hotel Arrangement",
      "✅ Sightseeing Places စီစဉ်ပေးခြင်း",
      "✅ Daily Schedule ပြင်ဆင်ပေးခြင်း",
      "✅ Tour Guide / Travel Assistance",
      "✅ Group Photo Stop Places",
      "✅ Family Trip အတွက် အဆင်ပြေသော ခရီးစဉ်",
      "✅ Friends Trip အတွက် ပျော်စရာကောင်းသော ခရီးစဉ်",
      "✅ Company Trip / Team Building Trip",
      "✅ School Trip / Group Activity Trip",
      "မိသားစုနဲ့ အေးအေးဆေးဆေး ခရီးသွားချင်တာလား?",
      "သူငယ်ချင်းတွေနဲ့ ပျော်ပျော်ပါးပါး Trip ထွက်ချင်တာလား?",
      "Company Team နဲ့ အမှတ်တရကောင်းတွေ ဖန်တီးချင်တာလား?",
      "ကျောင်းအဖွဲ့နဲ့ လေ့လာရေးခရီးသွားချင်တာလား?",
      "Group Tour မှာ အားလုံးအတူတူ သွားလာနိုင်ပြီး ခရီးစဉ်တစ်လျှောက် အစီအစဉ်တွေ ပြင်ဆင်ပြီးသားဖြစ်လို့ ပိုအဆင်ပြေ၊ ပိုပျော်စရာကောင်းပြီး အမှတ်တရတွေ ပိုများစေပါတယ်။",
      "တစ်ယောက်တည်း စီစဉ်ရတာ မဟုတ်တော့လို့ အချိန်ကုန်သက်သာပြီး ခရီးကို ပိုပြီး စိတ်အေးလက်အေး ခံစားနိုင်ပါတယ်။",
      "အတူတူသွားတဲ့လူတွေ၊ အတူတူရယ်မောခဲ့တဲ့အချိန်တွေ၊ အတူတူရိုက်ခဲ့တဲ့ဓာတ်ပုံတွေက နောက်တစ်ချိန်မှာ ပြန်တွေးတိုင်း ပျော်စရာကောင်းတဲ့ memories တွေ ဖြစ်နေမှာပါ။",
      "📩 Group Tour Join ချင်တယ်ဆိုရင် Seat မပြည့်ခင် အခုပဲ Reservation လုပ်ထားလိုက်ပါ။",
    ],
    en: [
      "Want to Travel with Your Friends, Family, or Team? 🚌✨",
      "A trip is not only about visiting new places. It is also about creating beautiful memories with the people you love — your family, friends, classmates, colleagues, or team members.",
      "Our Group Tour service is designed for travelers who want to enjoy a well-organized trip together without worrying about every planning detail. From transportation and hotel arrangements to sightseeing places and daily schedules, everything is prepared to make the journey smoother and more enjoyable.",
      "Our Group Tour service includes:",
      "✅ Transportation Arrangement",
      "✅ Hotel Arrangement",
      "✅ Sightseeing Place Planning",
      "✅ Daily Travel Schedule",
      "✅ Tour Guide / Travel Assistance",
      "✅ Group Photo Stop Locations",
      "✅ Family Trip Planning",
      "✅ Friends Trip Planning",
      "✅ Company Trip / Team Building Trip",
      "✅ School Trip / Group Activity Trip",
      "Whether you are planning a relaxing family trip, a fun friends’ getaway, a company team trip, or a school group tour, our service helps make the experience easier, more organized, and more memorable.",
      "With a group tour, you don’t have to spend time planning every detail by yourself. The travel route, schedule, accommodation, and main activities are arranged in advance, so everyone can enjoy the trip together with less stress.",
      "Traveling together brings people closer. The laughter, shared experiences, group photos, and unforgettable moments will become memories you can look back on for a long time.",
      "Make your next group trip more convenient, enjoyable, and meaningful with a well-prepared travel plan.",
      "📩 Want to join our group tour? Reserve your seat now before it is full.",
    ],
    direction:
      "Use group travel imagery, seat availability badge, route line graphics, and a strong reservation CTA.",
  },
  "creative-learning": {
    category: "04 / Education Content",
    title: "Creative Learning Project",
    summary:
      "Bilingual education copy focused on creativity, confidence, communication, practical skills, and personal growth.",
    mm: [
      "သင်ယူခြင်းဆိုတာ စာအုပ်ထဲက အသိပညာတစ်ခုတည်း မဟုတ်ပါဘူး။ 📚✨",
      "ကောင်းမွန်တဲ့ Learning Environment တစ်ခုက ကျောင်းသား၊ သင်တန်းသားတွေအတွက် အသိပညာတင်မကဘဲ creativity, confidence, communication skill နဲ့ real-life skills တွေကိုပါ တဖြည်းဖြည်း တိုးတက်လာစေပါတယ်။",
      "ယနေ့ခေတ်မှာ သင်ယူခြင်းဆိုတာ စာဖတ်တာ၊ မှတ်တာ၊ စာမေးပွဲဖြေတာလောက်နဲ့ မပြီးဆုံးတော့ပါဘူး။ ကိုယ်တိုင်စဉ်းစားနိုင်ခြင်း၊ ကိုယ့်အမြင်ကို ယုံကြည်မှုရှိရှိ ပြောပြနိုင်ခြင်း၊ အဖွဲ့လိုက်လုပ်ဆောင်နိုင်ခြင်း၊ ပြဿနာတွေကို ဖြေရှင်းနိုင်ခြင်းတွေကလည်း အရေးကြီးတဲ့ learning experience တွေ ဖြစ်လာပါတယ်။",
      "ကျွန်ုပ်တို့ရဲ့ Learning Program / Class / Course က သင်ယူသူတိုင်းအတွက် နားလည်လွယ်ပြီး လက်တွေ့အသုံးချနိုင်တဲ့ learning experience တစ်ခုကို ဖန်တီးပေးဖို့ ရည်ရွယ်ထားပါတယ်။",
      "သင်တန်း/သင်ကြားမှုအတွင်း အဓိကထားပေးမည့်အရာများမှာ—",
      "✅ နားလည်လွယ်သော သင်ကြားမှုပုံစံ",
      "✅ Friendly & Supportive Learning Environment",
      "✅ Creativity တိုးတက်စေသော Activities",
      "✅ Confidence မြှင့်တင်ပေးသော Practice",
      "✅ Communication Skill တိုးတက်စေခြင်း",
      "✅ Real-life Skills နှင့် Practical Knowledge",
      "✅ Personal Growth အတွက် လမ်းညွှန်ပေးခြင်း",
      "✅ ကျောင်းသား/သင်တန်းသားတစ်ဦးချင်းစီအလိုက် အားသာချက် ဖော်ထုတ်ပေးခြင်း",
      "School, Training Center, Online Class, Design Course သို့မဟုတ် Learning Program မျိုးစုံအတွက် သင်ယူသူတွေကို ပိုမိုယုံကြည်မှုရှိစေပြီး အနာဂတ်အတွက် အသုံးဝင်တဲ့ အရည်အချင်းတွေ တည်ဆောက်ပေးနိုင်ဖို့ အဓိကထားပါတယ်။",
      "သင်ယူခြင်းက ဒီနေ့မှာ စတင်ပေမဲ့ အဲဒီသင်ယူမှုက မနက်ဖြန်မှာ ကိုယ်ဖန်တီးချင်တဲ့ အိပ်မက်တွေ၊ ရည်မှန်းချက်တွေ၊ အနာဂတ်အခွင့်အလမ်းတွေကို တည်ဆောက်ပေးနိုင်ပါတယ်။",
      "သင့်ရဲ့ learning journey ကို ယနေ့စတင်ပြီး မနက်ဖြန်အတွက် ပိုကောင်းတဲ့အရာတွေကို ဖန်တီးလိုက်ပါ။",
      "📩 Learn today. Create tomorrow.",
    ],
    en: [
      "Learning is Not Only About Books. 📚✨",
      "A good learning experience is more than reading, memorizing, and passing exams. It helps learners grow in creativity, confidence, communication, problem-solving, and real-life skills.",
      "In today’s world, education should not only focus on knowledge from textbooks. It should also help students think independently, express their ideas confidently, work with others, and apply what they learn in real situations.",
      "Our Learning Program / Class / Course is designed to create a friendly, supportive, and meaningful learning experience for every learner. We focus on helping students build both knowledge and personal growth in a modern and practical way.",
      "Our learning approach focuses on:",
      "✅ Easy-to-understand lessons",
      "✅ Friendly and supportive learning environment",
      "✅ Activities that improve creativity",
      "✅ Practice that builds confidence",
      "✅ Communication skill development",
      "✅ Real-life skills and practical knowledge",
      "✅ Personal growth and self-improvement",
      "✅ Guidance based on each learner’s strengths",
      "Whether it is for a school, training center, online class, design course, or learning program, this learning concept is created to help learners feel confident, motivated, and ready for the future.",
      "Learning starts today, but what you learn can help you create better opportunities, stronger skills, and a brighter tomorrow.",
      "Start your learning journey today and create something meaningful for your future.",
      "📩 Learn today. Create tomorrow.",
    ],
    direction:
      "Use friendly colors, readable type, organized modules, student imagery, and a calm professional tone.",
  },
  "restaurant-reel": {
    category: "05 / Reels Content",
    title: "Restaurant Reels Script",
    summary:
      "Bilingual food-reel concept with an attention hook, scene flow, on-screen copy, caption, and direct CTA.",
    mm: [
      "Reels Idea: Delicious Food in Every Bite 🍽️✨",
      "Food Reel တစ်ပုဒ်က ပထမ ၃ စက္ကန့်အတွင်းမှာပဲ ကြည့်သူကို “စားချင်စိတ်” ဖြစ်လာစေဖို့ အရေးကြီးပါတယ်။",
      "အစားအစာရဲ့ အရောင်အသွေး၊ texture, cooking moment, plating detail နဲ့ final dish look တွေကို သေချာပြသနိုင်ရင် reel တစ်ပုဒ်က ပိုပြီး စိတ်ဝင်စားစရာကောင်းလာပါတယ်။",
      "ဒီ Food Reel Concept က restaurant, café, food shop, delivery service တွေအတွက် အသုံးပြုလို့ကောင်းပြီး အစားအစာရဲ့ freshness, taste, quality နဲ့ appetite appeal ကို အဓိကပြသဖို့ ရည်ရွယ်ထားပါတယ်။",
      "🎬 Suggested Scene Flow",
      "1. Fresh Ingredients — လတ်ဆတ်သန့်ရှင်းတဲ့ ingredients တွေကို close-up shot နဲ့ စတင်ပြပါ။",
      "2. Cooking Process — ချက်ပြုတ်နေတဲ့ moment, sauce ထည့်တာ၊ steam ထွက်တာ၊ grill / fry / mix လုပ်နေတဲ့ scene တွေကို dynamic shot နဲ့ ပြပါ။",
      "3. Plating Details — အစားအစာကို plate ပေါ်မှာ သပ်သပ်ရပ်ရပ် ပြင်ဆင်နေတဲ့ detail shot ထည့်ပါ။",
      "4. Aesthetic Food Set — Final dish ကို lighting ကောင်းကောင်းနဲ့ appetizing ဖြစ်အောင် ပြသပါ။",
      "5. Restaurant Name & Offer — အဆုံးမှာ restaurant name, promotion, discount, special menu, order info တွေကို clean text နဲ့ ထည့်ပါ။",
      "📌 Screen Text Flow",
      "Fresh & Clean Ingredients",
      "Cooked with Care",
      "Rich Taste",
      "Perfect Bite",
      "Good Food, Good Mood",
      "Order Now",
      "📍 Caption",
      "အရသာကောင်းတဲ့ အစားအစာတွေက နေ့တစ်နေ့ကို ပိုပြီး ပြည့်စုံစေပါတယ်။",
      "Freshly prepared, beautifully served, and ready for you. အရသာရှိရှိ စားသုံးချင်တယ်ဆိုရင် ဒီနေ့ပဲ order လုပ်လိုက်ပါ။",
      "📩 Order Now / Visit Us Today",
    ],
    en: [
      "Reels Idea: Delicious Food in Every Bite 🍽️✨",
      "A good food reel should catch attention within the first few seconds. The goal is to make viewers feel hungry, interested, and excited to try the food.",
      "This reel concept is perfect for restaurants, cafés, food shops, and delivery services that want to showcase freshness, taste, quality, and visual appetite appeal.",
      "By using close-up shots, cooking moments, plating details, and beautiful final food presentation, the reel can create a strong first impression and encourage customers to order or visit.",
      "🎬 Suggested Scene Flow",
      "1. Fresh Ingredients — Start with close-up shots of fresh and clean ingredients to show quality and freshness.",
      "2. Cooking Process — Show the food being cooked with care: mixing, grilling, frying, pouring sauce, steam shots, or chef preparation moments.",
      "3. Plating Details — Capture the final plating process with detailed shots to make the dish look premium and appetizing.",
      "4. Aesthetic Food Set — Show the completed dish with good lighting, a clean background, and attractive food styling.",
      "5. Restaurant Name & Offer — End the reel with the restaurant name, promotion, special menu, discount, or order information.",
      "📌 Screen Text Flow",
      "Fresh & Clean Ingredients",
      "Cooked with Care",
      "Rich Taste",
      "Perfect Bite",
      "Good Food, Good Mood",
      "Order Now",
      "📍 Caption",
      "Good food makes every moment better.",
      "Freshly prepared, beautifully served, and ready for you. Enjoy delicious food made with care and full of flavor.",
      "📩 Order Now / Visit Us Today",
    ],
    direction:
      "Use warm lighting, smooth transitions, close-up food shots, sauce details, and a final offer screen.",
  },
  "coffee-reel": {
    category: "06 / Reels Content",
    title: "Coffee Shop Reels Script",
    summary:
      "Bilingual coffee-shop reel concept focused on quality, barista craft, warm atmosphere, and customer experience.",
    mm: [
      "Reels Idea: Fresh Coffee, Fresh Mood ☕✨",
      "Coffee တစ်ခွက်က တစ်နေ့တာရဲ့ mood ကို ပြောင်းလဲပေးနိုင်ပါတယ်။",
      "Coffee Shop Reel တစ်ပုဒ်က cozy ဖြစ်ရမယ်၊ warm mood ပေးနိုင်ရမယ်၊ ကြည့်သူကို “ဒီ coffee shop ကို သွားချင်တယ်” “coffee တစ်ခွက် သောက်ချင်တယ်” ဆိုတဲ့ ခံစားချက်ဖြစ်စေရပါမယ်။",
      "ဒီ Reel Concept က coffee shop, café, bakery café, lifestyle café, takeaway coffee brand တွေအတွက် အသုံးပြုလို့ကောင်းပြီး coffee quality, cozy atmosphere, barista craft နဲ့ customer experience ကို အဓိကပြသနိုင်ပါတယ်။",
      "🎬 Suggested Scene Flow",
      "1. Coffee Beans Close-up — Premium coffee beans တွေကို close-up shot နဲ့ စတင်ပြပြီး freshness နဲ့ quality ကို ပြသပါ။",
      "2. Espresso Pouring — Espresso စီးကျနေတဲ့ moment ကို slow motion သို့မဟုတ် close-up shot နဲ့ ပြသပြီး rich coffee feeling ဖြစ်အောင် ဖန်တီးပါ။",
      "3. Latte Art — Barista က latte art ပြုလုပ်နေတဲ့ scene ကို ထည့်ပြီး skill, care နဲ့ passion ကို ပြသပါ။",
      "4. Customer Café Mood — Customer တွေ coffee သောက်နေတဲ့ cozy moment, laptop နဲ့ အလုပ်လုပ်နေတဲ့ scene, သူငယ်ချင်းတွေနဲ့ စကားပြောနေတဲ့ scene, relaxing café corner shot တွေကို ထည့်ပါ။",
      "5. Café Name & Location — အဆုံးမှာ café name, location, opening hours, special menu, promotion သို့မဟုတ် contact information တွေကို clean text နဲ့ ထည့်ပါ။",
      "📌 Screen Text Flow",
      "Premium Coffee Beans",
      "Freshly Brewed",
      "Made with Passion",
      "Your Daily Comfort",
      "Visit Us Today",
      "📍 Caption",
      "တစ်နေ့တာကို coffee ကောင်းကောင်းလေးနဲ့ စလိုက်ပါ။",
      "Fresh brew, warm mood, and a little moment for yourself. Cozy mood လေးနဲ့ အရသာရှိတဲ့ coffee တစ်ခွက်ကို ဒီနေ့ပဲ လာရောက်ခံစားလိုက်ပါ။",
      "📩 Visit Us Today / Order Your Coffee Now",
    ],
    en: [
      "Reels Idea: Fresh Coffee, Fresh Mood ☕✨",
      "A good cup of coffee can change the mood of your whole day.",
      "A coffee shop reel should feel cozy, warm, and inviting enough to make viewers want a cup right away. The goal is to show not only the coffee, but also the feeling, atmosphere, and little moments that make the café experience special.",
      "This reel concept is perfect for coffee shops, cafés, bakery cafés, lifestyle cafés, and takeaway coffee brands that want to highlight coffee quality, cozy atmosphere, barista craft, and customer experience.",
      "🎬 Suggested Scene Flow",
      "1. Coffee Beans Close-up — Start with close-up shots of premium coffee beans to show freshness, quality, and attention to detail.",
      "2. Espresso Pouring — Show espresso pouring into the cup with smooth slow-motion or close-up shots to create a rich and satisfying coffee feeling.",
      "3. Latte Art — Capture the barista creating latte art to highlight skill, care, and passion in every cup.",
      "4. Customer Café Mood — Show customers enjoying coffee, working on a laptop, chatting with friends, or relaxing in a cozy café corner.",
      "5. Café Name & Location — End the reel with the café name, location, opening hours, special menu, promotion, or contact information.",
      "📌 Screen Text Flow",
      "Premium Coffee Beans",
      "Freshly Brewed",
      "Made with Passion",
      "Your Daily Comfort",
      "Visit Us Today",
      "📍 Caption",
      "Start your day with a good cup of coffee.",
      "Fresh brew, warm mood, and a little moment for yourself. Enjoy a cozy café experience with coffee made fresh and served with care.",
      "📩 Visit Us Today / Order Your Coffee Now.",
    ],
    direction:
      "Use brown and cream colors, soft music, slow camera movement, foam details, and warm cafe atmosphere.",
  },
  "food-coffee-promo": {
    category: "07 / Restaurant and Cafe Content",
    title: "Food & Coffee Special Deal",
    summary:
      "Bilingual limited-time food-and-drink promotion copy for lunch breaks, coffee dates, and casual meetups.",
    mm: [
      "Food & Coffee Lover တွေအတွက် Special Deal လာပါပြီ! 🍽️☕",
      "နေ့လယ်စာစားဖို့နေရာရှာနေလား?",
      "Coffee Date လုပ်ဖို့ cozy ဖြစ်တဲ့နေရာလိုချင်လား?",
      "သူငယ်ချင်းတွေနဲ့ chill လုပ်ရင်း အစားအသောက်ကောင်းကောင်းလေး စားချင်လား?",
      "ဒီ Special Deal က food lover တွေ၊ coffee lover တွေ၊ lunch break မှာ အရသာရှိရှိစားချင်သူတွေ၊ သူငယ်ချင်းတွေနဲ့ အေးအေးဆေးဆေးထိုင်ချင်သူတွေအတွက် သင့်တော်တဲ့ promotion လေးဖြစ်ပါတယ်။",
      "အရသာရှိတဲ့ Food Menu နဲ့ fresh drink တစ်ခွက်ကို combo အနေနဲ့ ရရှိနိုင်ပြီး သက်သာတဲ့ price နဲ့ အချိန်တိုအတွင်းသာ ရနိုင်တဲ့ offer လေးဖြစ်ပါတယ်။",
      "ဒီ Promotion Concept မှာ အဓိကဖော်ပြသင့်တဲ့အချက်တွေက—",
      "✅ Food & Drink Combo",
      "✅ Special Discount Badge",
      "✅ Limited-Time Offer",
      "✅ Price Highlight",
      "✅ Best for Lunch, Coffee Date & Chill Time",
      "✅ Clear CTA Button",
      "✅ Easy Order Message",
      "အစားအသောက်ကောင်းကောင်း၊ coffee / drink လတ်လတ်ဆတ်ဆတ်နဲ့ mood ကောင်းကောင်းလေးကို တစ်နေရာတည်းမှာ ခံစားနိုင်မယ့် deal လေးပါ။",
      "နေ့လယ်စာစားချင်တာပဲဖြစ်ဖြစ်၊ coffee တစ်ခွက်နဲ့ အနားယူချင်တာပဲဖြစ်ဖြစ်၊ သူငယ်ချင်းတွေနဲ့ chill ချင်တာပဲဖြစ်ဖြစ် ဒီ offer လေးက သင့်အတွက် အဆင်ပြေပါတယ်။",
      "အချိန်ကန့်သတ်ထားတဲ့ promotion ဖြစ်လို့ မလွတ်သွားခင် အခုပဲ order လုပ်လိုက်ပါ။",
      "📩 ဒီ offer လေးမလွတ်ခင် အခုပဲ Order လုပ်လိုက်ပါ။",
    ],
    en: [
      "Special Deal for Food & Coffee Lovers! 🍽️☕",
      "Looking for a tasty lunch?",
      "Planning a cozy coffee date?",
      "Want to chill with your friends over good food and fresh drinks?",
      "This special deal is made for food lovers, coffee lovers, lunch breaks, casual meetups, and anyone who wants to enjoy a simple but satisfying meal experience.",
      "Enjoy a delicious food and drink combo at a special price for a limited time. It is easy to understand, attractive, and perfect for customers who want good taste, good value, and a good mood in one place.",
      "This promotion concept focuses on:",
      "✅ Food & Drink Combo",
      "✅ Special Discount Badge",
      "✅ Limited-Time Offer",
      "✅ Price Highlight",
      "✅ Perfect for Lunch, Coffee Dates & Chill Moments",
      "✅ Clear CTA Button",
      "✅ Easy Order Message",
      "Whether you are stopping by for lunch, taking a coffee break, or spending time with friends, this offer gives you a tasty and convenient choice.",
      "Fresh food, refreshing drinks, and a cozy moment — all in one special deal.",
      "This is a limited-time promotion, so don’t miss the chance to enjoy it before it ends.",
      "📩 Grab this offer before it ends. Order now or visit us today!",
    ],
    direction:
      "Use a food-and-drink hero image, bold discount badge, price card, and a high-contrast order button.",
  },
  "brand-awareness": {
    category: "08 / Social Media Content",
    title: "Brand Awareness Content",
    summary:
      "Bilingual brand-awareness copy about visual identity, consistency, recognition, professionalism, and trust.",
    mm: [
      "Online မှာ Brand တစ်ခုကို လူတွေမှတ်မိစေချင်ရင် Visual က အရမ်းအရေးကြီးပါတယ်။ ✨",
      "ယနေ့ခေတ်မှာ customer တွေက brand တစ်ခုကို ပထမဆုံးမြင်တွေ့တဲ့နေရာက Facebook Page, Instagram, Website, Online Shop, Ads Design, Profile Photo, Cover Photo, Social Media Post တွေပေါ်မှာ ဖြစ်တတ်ပါတယ်။",
      "ဒါကြောင့် Brand တစ်ခုက online ပေါ်မှာ professional ဖြစ်နေဖို့၊ မှတ်မိလွယ်ဖို့၊ ယုံကြည်မှုရှိစေဖို့ visual identity က အရေးကြီးတဲ့အခန်းကဏ္ဍတစ်ခု ဖြစ်ပါတယ်။",
      "Brand Visual တစ်ခုကောင်းဖို့ဆိုရင်—",
      "✅ Brand Color",
      "✅ Typography",
      "✅ Layout Design",
      "✅ Content Message",
      "✅ Visual Style",
      "✅ Logo Usage",
      "✅ Image Style",
      "✅ Social Media Design Consistency",
      "ဒီအချက်တွေ တစ်ခုနဲ့တစ်ခု ကိုက်ညီနေဖို့ လိုအပ်ပါတယ်။",
      "Design တစ်ခုချင်းစီက လှနေဖို့ပဲ မဟုတ်ဘဲ brand ရဲ့ personality, message, service quality နဲ့ customer trust ကိုပါ ပြသနိုင်ရပါမယ်။",
      "ဒီ Brand Awareness Concept က business page, startup, online shop, service brand, agency, personal brand, creator page တွေအတွက် သင့်တော်ပါတယ်။",
      "သင့် brand ရဲ့ visual style ကို သေချာတည်ဆောက်ထားနိုင်ရင် customer တွေက သင့် brand ကို ပိုမှတ်မိလာမယ်၊ ပိုယုံကြည်လာမယ်၊ online ပေါ်မှာလည်း ပို professional ဖြစ်လာပါမယ်။",
      "Brand တစ်ခုကို တည်ဆောက်တယ်ဆိုတာ logo တစ်ခုရှိရုံနဲ့ မပြီးပါဘူး။ Color, font, layout, message, design style တွေကို တစ်ပုံစံတည်း ထိန်းသိမ်းပြီး customer တွေရဲ့ စိတ်ထဲမှာ မှတ်မိလွယ်တဲ့ brand image တစ်ခု ဖန်တီးပေးဖို့ လိုပါတယ်။",
      "📩 သင့် brand ကို online မှာ ပိုပြီး professional ဖြစ်အောင် ဒီနေ့ပဲ တည်ဆောက်လိုက်ပါ။",
    ],
    en: [
      "If You Want People to Remember Your Brand Online, Visuals Matter. ✨",
      "In today’s digital world, customers often see your brand for the first time through your Facebook page, Instagram profile, website, online shop, advertising design, profile photo, cover photo, or social media posts.",
      "That is why a strong visual identity is important for making your brand look professional, memorable, and trustworthy online.",
      "A good brand visual system should include:",
      "✅ Brand Colors",
      "✅ Typography",
      "✅ Layout Design",
      "✅ Content Message",
      "✅ Visual Style",
      "✅ Logo Usage",
      "✅ Image Style",
      "✅ Social Media Design Consistency",
      "All of these elements need to work together to create a clear and recognizable brand image.",
      "Good design is not only about making things look beautiful. It should also communicate your brand personality, message, service quality, and trustworthiness.",
      "This brand awareness concept is suitable for business pages, startups, online shops, service brands, agencies, personal brands, and creator pages.",
      "When your brand visuals are consistent, people can recognize your brand more easily, trust your business more, and understand your message better.",
      "Building a brand is not just about having a logo. It is about using the right colors, fonts, layouts, messages, and design style consistently to create a strong and memorable brand image in your customers’ minds.",
      "📩 Build your brand online with better visuals and clearer communication.",
    ],
    direction:
      "Use brand color blocks, sample post frames, short message points, and a premium business-page layout.",
  },
  "product-promo": {
    category: "09 / Social Media Content",
    title: "Product Promotion",
    summary:
      "Bilingual product-promotion copy focused on presentation, clarity, value, offers, and purchase motivation.",
    mm: [
      "Product ကောင်းတစ်ခုရှိတယ်ဆိုရင် Presentation ကောင်းကောင်းနဲ့ ပြသဖို့လိုပါတယ်။ ✨",
      "Customer တစ်ယောက်က product post တစ်ခုကို မြင်တဲ့အချိန်မှာ “ဘာ product လဲ?” “ဘာအသုံးဝင်လဲ?” “ဘာကြောင့်ဝယ်သင့်လဲ?” ဆိုတာကို ခဏအတွင်း နားလည်နိုင်ရပါမယ်။",
      "Product Design တစ်ခုက လှဖို့တင်မကဘဲ customer ကို product အကြောင်းရှင်းရှင်းလင်းလင်း သိစေပြီး ဝယ်ချင်စိတ်ဖြစ်လာအောင် ဖန်တီးပေးနိုင်ရပါမယ်။",
      "Product Promotion Design တစ်ခုမှာ အဓိကပါဝင်သင့်တဲ့အရာတွေက—",
      "✅ Product ကို Main Focus ထားခြင်း",
      "✅ Clean & Professional Background",
      "✅ Clear Headline",
      "✅ Product Features",
      "✅ Price Highlight",
      "✅ Special Offer / Discount",
      "✅ Benefit Message",
      "✅ Call-to-Action Button",
      "✅ Brand Visual Consistency",
      "Product post တစ်ခုက ရှုပ်ထွေးနေရင် customer က စိတ်ဝင်စားမှုလျော့သွားနိုင်ပါတယ်။ ဒါကြောင့် design layout ကို clean ဖြစ်အောင်ထားပြီး product image, headline, price, offer နဲ့ CTA တွေကို ရှင်းရှင်းလင်းလင်း ထည့်သွင်းဖော်ပြဖို့ အရေးကြီးပါတယ်။",
      "ဒီ concept က online shops, beauty products, fashion items, gadgets, food products, accessories, lifestyle brands, skincare products, electronic items တွေအတွက် သင့်တော်ပါတယ်။",
      "Product တစ်ခုကို customer တွေ သတိထားမိဖို့ဆိုရင် visual presentation က အရမ်းအရေးကြီးပါတယ်။ Professional design က product ကို ပိုထင်ရှားစေပြီး brand ကိုလည်း ပိုယုံကြည်စေပါတယ်။",
      "📩 သင့် product ကို ပိုပြီးထင်ရှားအောင် Professional Design နဲ့ Promote လုပ်လိုက်ပါ။",
    ],
    en: [
      "A Good Product Needs Good Presentation. ✨",
      "When customers see a product post, they should quickly understand what the product is, how it helps, and why they should buy it.",
      "A product design should not only look attractive. It should also explain the product clearly, highlight its value, and encourage customers to take action.",
      "A strong product promotion design should include:",
      "✅ Product as the Main Focus",
      "✅ Clean & Professional Background",
      "✅ Clear Headline",
      "✅ Product Features",
      "✅ Price Highlight",
      "✅ Special Offer / Discount",
      "✅ Benefit Message",
      "✅ Call-to-Action Button",
      "✅ Brand Visual Consistency",
      "If a product post looks too crowded or unclear, customers may lose interest quickly. That is why a clean layout, strong product image, clear headline, visible price, attractive offer, and simple CTA are important for effective product promotion.",
      "This concept works well for online shops, beauty products, fashion items, gadgets, food products, accessories, lifestyle brands, skincare products, and electronic items.",
      "Good visual presentation helps your product stand out, builds trust with customers, and makes your brand look more professional online.",
      "📩 Promote your product with visuals that make people stop and notice.",
    ],
    direction:
      "Use a clean product cutout, feature chips, price highlight, offer label, and focused product lighting.",
  },
  "service-promo": {
    category: "10 / Social Media Content",
    title: "Service Promotion",
    summary:
      "Bilingual service-promotion copy that explains the offer, process, value, expected result, and CTA clearly.",
    mm: [
      "Service တစ်ခုကို Promote လုပ်တဲ့အခါ Message ရှင်းဖို့ အရမ်းအရေးကြီးပါတယ်။ ✨",
      "Customer တစ်ယောက်က service post တစ်ခုကို မြင်တဲ့အချိန်မှာ “ဒီ service က ဘာလုပ်ပေးတာလဲ?” “ဘယ်လိုအကျိုးရှိမလဲ?” “ဘယ်လို process နဲ့လုပ်ပေးမလဲ?” “ဘာ result ရနိုင်မလဲ?” ဆိုတာကို လွယ်လွယ်ကူကူ နားလည်နိုင်ရပါမယ်။",
      "Service Promotion Design တစ်ခုက လှဖို့တင်မကဘဲ customer ကို ယုံကြည်မှုရှိစေဖို့၊ service ရဲ့ value ကိုရှင်းပြနိုင်ဖို့၊ ဆက်သွယ်ချင်စိတ်ဖြစ်လာအောင် ဖန်တီးပေးနိုင်ဖို့ လိုအပ်ပါတယ်။",
      "Service Promotion Post တစ်ခုမှာ အဓိကပါဝင်သင့်တဲ့အရာတွေက—",
      "✅ Clear Service Message",
      "✅ Trust Building Information",
      "✅ Main Benefits",
      "✅ Simple Process Explanation",
      "✅ Expected Result",
      "✅ Professional Visual Layout",
      "✅ Customer-Friendly Content",
      "✅ Clear Call-to-Action",
      "Message မရှင်းတဲ့ service post တစ်ခုက customer ကို စိတ်ရှုပ်စေနိုင်ပါတယ်။ ဒါကြောင့် service ကို ဘယ်သူတွေအတွက်လဲ၊ ဘာပြဿနာကို ဖြေရှင်းပေးလဲ၊ ဘယ်လိုအကျိုးရှိလဲဆိုတာကို clean layout နဲ့ ရှင်းရှင်းလင်းလင်း ဖော်ပြဖို့ အရေးကြီးပါတယ်။",
      "ဒီ concept က travel agency, design studio, marketing agency, beauty salon, education center, real estate business, consulting service, online service brand, cleaning service, repair service, delivery service စတဲ့ service-based business တွေအတွက် အသုံးပြုလို့ကောင်းပါတယ်။",
      "Professional service post design က customer တွေကို သင့် service အကြောင်း ပိုနားလည်စေပြီး brand အပေါ် ယုံကြည်မှုကိုလည်း တိုးစေပါတယ်။",
      "📩 သင့် Service ကို Customer တွေနားလည်လွယ်အောင် Professional Post Design နဲ့ Promote လုပ်လိုက်ပါ။",
    ],
    en: [
      "When Promoting a Service, a Clear Message Is Very Important. ✨",
      "When customers see a service post, they should quickly understand what the service is, how it helps them, how the process works, and what result they can expect.",
      "A service promotion design should not only look attractive. It should also build trust, explain the value of the service, and encourage customers to take the next step.",
      "A strong service promotion post should include:",
      "✅ Clear Service Message",
      "✅ Trust-Building Information",
      "✅ Main Benefits",
      "✅ Simple Process Explanation",
      "✅ Expected Result",
      "✅ Professional Visual Layout",
      "✅ Customer-Friendly Content",
      "✅ Clear Call-to-Action",
      "If a service post is unclear, customers may not understand what you offer or why they should contact you. That is why it is important to explain who the service is for, what problem it solves, and what benefits customers can receive in a clean and simple way.",
      "This concept is suitable for travel agencies, design studios, marketing agencies, beauty salons, education centers, real estate businesses, consulting services, online service brands, cleaning services, repair services, delivery services, and other service-based businesses.",
      "A professional service promotion design helps customers understand your service better, builds trust, and makes your brand look more reliable online.",
      "📩 Promote your service with a clean, professional, and easy-to-understand design.",
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
    if (text.startsWith("✅")) paragraph.classList.add("content-list-item");
    if (/^\d+\./.test(text)) paragraph.classList.add("content-step");
    if (/^[🎬📌📍]/u.test(text)) paragraph.classList.add("content-subheading");
    if (text.startsWith("📩")) paragraph.classList.add("content-cta");
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
    if (isDialogOpen(reelModal)) closeReel();
    if (isDialogOpen(contentModal)) closeDialog(contentModal);
    setMenuOpen(false);
  }
});

document.querySelector("[data-year]").textContent = new Date().getFullYear();
