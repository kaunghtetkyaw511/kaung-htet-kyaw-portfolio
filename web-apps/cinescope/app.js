const app = document.querySelector("#app");
const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const settingsDialog = document.querySelector("[data-settings-dialog]");
const settingsForm = document.querySelector("[data-settings-form]");
const toast = document.querySelector("[data-toast]");

const STORAGE = {
  watchlist: "cinescope-watchlist",
  watchlistMovies: "cinescope-watchlist-movies",
  token: "cinescope-tmdb-token",
};

const TMDB = {
  base: "https://api.themoviedb.org/3",
  image: "https://image.tmdb.org/t/p/",
};

const genres = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 80, name: "Crime" },
  { id: 18, name: "Drama" },
  { id: 14, name: "Fantasy" },
  { id: 27, name: "Horror" },
  { id: 9648, name: "Mystery" },
  { id: 878, name: "Science Fiction" },
  { id: 53, name: "Thriller" },
];

const demoMovies = [
  {
    id: 900001,
    title: "Signal Horizon",
    release_date: "2026-04-18",
    vote_average: 8.7,
    popularity: 98,
    genre_ids: [878, 12, 18],
    runtime: 142,
    poster_path: "assets/poster-tidal-orbit.jpg",
    backdrop_path: "assets/hero-signal-horizon.jpg",
    overview:
      "When a silent orbital city appears above Earth, a systems engineer discovers that its arrival is connected to a signal she has been hearing since childhood.",
    tagline: "Some signals are meant to find us.",
  },
  {
    id: 900002,
    title: "The Echo Arch",
    release_date: "2026-02-06",
    vote_average: 8.2,
    popularity: 91,
    genre_ids: [9648, 53, 18],
    runtime: 118,
    poster_path: "assets/poster-echo-arch.jpg",
    backdrop_path: "assets/poster-echo-arch.jpg",
    overview:
      "A forensic architect returns to the unfinished monument where her sister vanished and finds its impossible acoustics replaying fragments of the past.",
    tagline: "Every structure remembers.",
  },
  {
    id: 900003,
    title: "Neon Alibi",
    release_date: "2025-11-14",
    vote_average: 7.9,
    popularity: 87,
    genre_ids: [80, 53, 9648],
    runtime: 126,
    poster_path: "assets/poster-neon-alibi.jpg",
    backdrop_path: "assets/poster-neon-alibi.jpg",
    overview:
      "A private investigator follows a trail of staged memories through a rain-soaked city where every witness remembers a different crime.",
    tagline: "The truth has more than one reflection.",
  },
  {
    id: 900004,
    title: "Eclipse Kingdom",
    release_date: "2026-05-22",
    vote_average: 8.4,
    popularity: 94,
    genre_ids: [12, 14, 18],
    runtime: 154,
    poster_path: "assets/poster-eclipse-kingdom.jpg",
    backdrop_path: "assets/poster-eclipse-kingdom.jpg",
    overview:
      "During a century-long eclipse, an exiled cartographer must cross a forbidden desert to reach a city that exists only in shadow.",
    tagline: "Beyond the light, a kingdom waits.",
  },
  {
    id: 900005,
    title: "Tidal Orbit",
    release_date: "2025-09-03",
    vote_average: 7.8,
    popularity: 80,
    genre_ids: [878, 18, 9648],
    runtime: 111,
    poster_path: "assets/poster-tidal-orbit.jpg",
    backdrop_path: "assets/poster-tidal-orbit.jpg",
    overview:
      "The sole survivor of a lunar research mission wakes beneath the Pacific with no memory of how the station fell from orbit.",
    tagline: "The ocean kept the last transmission.",
  },
  {
    id: 900006,
    title: "Concrete Birds",
    release_date: "2025-12-19",
    vote_average: 7.6,
    popularity: 76,
    genre_ids: [18, 9648],
    runtime: 105,
    poster_path: "assets/poster-echo-arch.jpg",
    backdrop_path: "assets/poster-echo-arch.jpg",
    overview:
      "An urban ecologist notices the city's birds are drawing the same shape above abandoned government buildings.",
    tagline: "Look up before they disappear.",
  },
  {
    id: 900007,
    title: "Last Light Driver",
    release_date: "2026-01-30",
    vote_average: 7.5,
    popularity: 72,
    genre_ids: [80, 28, 53],
    runtime: 119,
    poster_path: "assets/poster-neon-alibi.jpg",
    backdrop_path: "assets/poster-neon-alibi.jpg",
    overview:
      "A getaway driver has one night to cross a city under lockdown with a passenger who may be the reason the lights are going out.",
    tagline: "One road. No second chances.",
  },
  {
    id: 900008,
    title: "The Sunless Map",
    release_date: "2025-08-08",
    vote_average: 7.7,
    popularity: 70,
    genre_ids: [12, 14],
    runtime: 132,
    poster_path: "assets/poster-eclipse-kingdom.jpg",
    backdrop_path: "assets/poster-eclipse-kingdom.jpg",
    overview:
      "A young mapmaker follows a moving constellation toward the only valley untouched by the endless eclipse.",
    tagline: "Not every path appears in daylight.",
  },
];

const readJSON = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
};

const state = {
  token: localStorage.getItem(STORAGE.token) || "",
  watchlist: new Set(readJSON(STORAGE.watchlist, [])),
  savedMovies: readJSON(STORAGE.watchlistMovies, {}),
  movies: [...demoMovies],
  genres: [...genres],
  feed: "trending",
  genre: "all",
  sort: "popular",
  query: "",
  loading: false,
  usingDemo: true,
};

const feedLabels = {
  trending: "Trending this week",
  now_playing: "Now playing",
  top_rated: "Top rated",
};

const icon = (name) => `<i data-lucide="${name}"></i>`;

const refreshIcons = () => {
  if (window.lucide) window.lucide.createIcons();
};

const escapeHTML = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const getYear = (movie) =>
  movie.release_date ? movie.release_date.slice(0, 4) : "TBA";

const genreName = (id) =>
  state.genres.find((genre) => genre.id === id)?.name || "Other";

const movieGenres = (movie) => {
  const ids = movie.genre_ids || movie.genres?.map((genre) => genre.id) || [];
  return ids.slice(0, 2).map(genreName).join(" / ");
};

const imageURL = (path, size = "w500") => {
  if (!path) return "assets/poster-echo-arch.jpg";
  if (path.startsWith("assets/") || path.startsWith("http")) return path;
  return `${TMDB.image}${size}${path}`;
};

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove("is-visible"), 2200);
};

const setMenu = (open) => {
  menuToggle?.setAttribute("aria-expanded", String(open));
  siteNav?.classList.toggle("is-open", open);
  header?.classList.toggle("menu-active", open);
  document.body.classList.toggle("menu-open", open);

  const currentIcon = menuToggle?.querySelector("svg, [data-lucide]");
  if (currentIcon) {
    currentIcon.outerHTML = `<i data-lucide="${open ? "x" : "menu"}"></i>`;
    refreshIcons();
  }
};

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
};

const saveWatchlist = () => {
  localStorage.setItem(STORAGE.watchlist, JSON.stringify([...state.watchlist]));
  localStorage.setItem(STORAGE.watchlistMovies, JSON.stringify(state.savedMovies));
  document.querySelectorAll("[data-watchlist-count]").forEach((element) => {
    element.textContent = state.watchlist.size;
  });
};

const toggleWatchlist = (movieId) => {
  const id = Number(movieId);
  if (state.watchlist.has(id)) {
    state.watchlist.delete(id);
    delete state.savedMovies[id];
    showToast("Removed from watchlist");
  } else {
    state.watchlist.add(id);
    const movie = [...state.movies, ...demoMovies].find(
      (candidate) => candidate.id === id,
    );
    if (movie) state.savedMovies[id] = movie;
    showToast("Added to watchlist");
  }
  saveWatchlist();
  updateWatchlistButtons(id);
  if (parseRoute().path === "/watchlist") renderWatchlist();
};

const updateWatchlistButtons = (movieId) => {
  const saved = state.watchlist.has(Number(movieId));
  document.querySelectorAll(`[data-watchlist-id="${movieId}"]`).forEach((button) => {
    button.classList.toggle("is-saved", saved);
    button.setAttribute(
      "aria-label",
      saved ? "Remove from watchlist" : "Add to watchlist",
    );
    const currentIcon = button.querySelector("svg, [data-lucide]");
    if (currentIcon) {
      currentIcon.outerHTML = `<i data-lucide="${
        saved ? "bookmark-check" : "bookmark"
      }"></i>`;
    }
    const label = button.querySelector("[data-watchlist-label]");
    if (label) label.textContent = saved ? "In watchlist" : "Watchlist";
  });
  refreshIcons();
};

const tmdbRequest = async (endpoint, params = {}) => {
  const url = new URL(`${TMDB.base}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") url.searchParams.set(key, value);
  });

  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${state.token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed (${response.status})`);
  }

  return response.json();
};

const loadGenres = async () => {
  if (!state.token) return;
  const data = await tmdbRequest("/genre/movie/list");
  if (data.genres?.length) state.genres = data.genres;
};

const loadFeed = async ({ render = true } = {}) => {
  state.loading = true;
  if (render) renderHome();

  try {
    if (!state.token) {
      state.movies = [...demoMovies];
      state.usingDemo = true;
    } else {
      let data;
      if (state.query.trim()) {
        data = await tmdbRequest("/search/movie", {
          query: state.query.trim(),
          include_adult: false,
        });
      } else {
        const endpoint =
          state.feed === "trending"
            ? "/trending/movie/week"
            : `/movie/${state.feed}`;
        data = await tmdbRequest(endpoint);
      }
      state.movies = data.results || [];
      state.usingDemo = false;
    }
  } catch (error) {
    console.error(error);
    state.movies = [...demoMovies];
    state.usingDemo = true;
    showToast("TMDB unavailable. Showing demo catalog.");
  } finally {
    state.loading = false;
    renderHome();
    updateApiStatus();
  }
};

const filteredMovies = (movies = state.movies) => {
  let result = [...movies];

  if (state.usingDemo && state.query.trim()) {
    const query = state.query.trim().toLowerCase();
    result = result.filter(
      (movie) =>
        movie.title.toLowerCase().includes(query) ||
        movie.overview.toLowerCase().includes(query),
    );
  }

  if (state.genre !== "all") {
    result = result.filter((movie) => {
      const ids = movie.genre_ids || movie.genres?.map((genre) => genre.id) || [];
      return ids.includes(Number(state.genre));
    });
  }

  result.sort((a, b) => {
    if (state.sort === "rating") return b.vote_average - a.vote_average;
    if (state.sort === "year") return getYear(b).localeCompare(getYear(a));
    return (b.popularity || 0) - (a.popularity || 0);
  });

  return result;
};

const renderSkeletons = () =>
  Array.from(
    { length: 10 },
    () => `
      <article class="skeleton-card" aria-hidden="true">
        <div class="skeleton skeleton-poster"></div>
        <div class="skeleton skeleton-line"></div>
        <div class="skeleton skeleton-line short"></div>
      </article>
    `,
  ).join("");

const renderMovieCard = (movie) => {
  const saved = state.watchlist.has(Number(movie.id));
  return `
    <article class="movie-card">
      <a class="poster-link" href="#/movie/${movie.id}" aria-label="View ${escapeHTML(
        movie.title,
      )} details">
        <img
          src="${escapeHTML(imageURL(movie.poster_path))}"
          alt="${escapeHTML(movie.title)} poster"
          loading="lazy"
        />
        <span class="poster-rating">
          ${icon("star")}
          ${Number(movie.vote_average || 0).toFixed(1)}
        </span>
      </a>
      <button
        class="bookmark-button ${saved ? "is-saved" : ""}"
        type="button"
        data-watchlist-id="${movie.id}"
        aria-label="${saved ? "Remove from watchlist" : "Add to watchlist"}"
      >
        ${icon(saved ? "bookmark-check" : "bookmark")}
      </button>
      <div class="movie-card-copy">
        <h3>${escapeHTML(movie.title)}</h3>
        <span class="movie-year">${getYear(movie)}</span>
        <p>${escapeHTML(movieGenres(movie))}</p>
      </div>
    </article>
  `;
};

const renderEmpty = (watchlist = false) => `
  <div class="empty-state">
    <div>
      ${icon(watchlist ? "bookmark-x" : "search-x")}
      <h2>${watchlist ? "Your watchlist is empty" : "No movies found"}</h2>
      <p>${
        watchlist
          ? "Save a few titles and they will appear here."
          : "Try another title, genre, or feed."
      }</p>
    </div>
  </div>
`;

const feedTab = (value, label) => `
  <button
    class="feed-tab ${state.feed === value ? "is-active" : ""}"
    type="button"
    data-feed="${value}"
  >
    ${label}
  </button>
`;

const heroMovie = () =>
  state.movies.find((movie) => movie.id === 900001) ||
  state.movies[0] ||
  demoMovies[0];

const renderHero = () => {
  const movie = heroMovie();
  const saved = state.watchlist.has(Number(movie.id));
  return `
    <section class="hero">
      <img
        class="hero-backdrop"
        src="${escapeHTML(
          imageURL(movie.backdrop_path || movie.poster_path, "original"),
        )}"
        alt=""
        fetchpriority="high"
      />
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <p class="eyebrow">Featured premiere</p>
        <h1>${escapeHTML(movie.title)}</h1>
        <div class="movie-meta">
          <span class="rating">${icon("star")} ${Number(
            movie.vote_average || 0,
          ).toFixed(1)}</span>
          <span class="meta-divider"></span>
          <span>${getYear(movie)}</span>
          <span class="meta-divider"></span>
          <span>${escapeHTML(movieGenres(movie))}</span>
        </div>
        <p class="hero-summary">${escapeHTML(movie.overview)}</p>
        <div class="hero-actions">
          <a class="primary-button" href="#/movie/${movie.id}">
            ${icon("play")}
            <span>View details</span>
          </a>
          <button
            class="secondary-button ${saved ? "is-saved" : ""}"
            type="button"
            data-watchlist-id="${movie.id}"
          >
            ${icon(saved ? "bookmark-check" : "bookmark")}
            <span data-watchlist-label>${saved ? "In watchlist" : "Watchlist"}</span>
          </button>
        </div>
      </div>
    </section>
  `;
};

const renderCatalog = ({ watchlist = false } = {}) => {
  const source = watchlist
    ? [...state.watchlist]
        .map(
          (id) =>
            state.savedMovies[id] ||
            [...demoMovies, ...state.movies].find((movie) => movie.id === id),
        )
        .filter(Boolean)
    : filteredMovies();

  return `
    <section class="catalog" id="catalog">
      <div class="catalog-toolbar">
        <div class="section-title">
          <div>
            <p class="eyebrow">${watchlist ? "Saved titles" : "Movie directory"}</p>
            <h2>${watchlist ? "My watchlist" : feedLabels[state.feed]}</h2>
          </div>
          <span class="result-count">${source.length} title${
            source.length === 1 ? "" : "s"
          }</span>
        </div>

        ${
          watchlist
            ? ""
            : `
              <div class="catalog-controls">
                <div class="feed-tabs" aria-label="Movie feeds">
                  ${feedTab("trending", "Trending")}
                  ${feedTab("now_playing", "Now playing")}
                  ${feedTab("top_rated", "Top rated")}
                </div>
                <div class="search-row">
                  <label class="search-field">
                    <span class="sr-only">Search movies</span>
                    ${icon("search")}
                    <input
                      type="search"
                      placeholder="Search movies"
                      value="${escapeHTML(state.query)}"
                      data-search
                    />
                    <button
                      class="clear-search ${state.query ? "is-visible" : ""}"
                      type="button"
                      data-clear-search
                      title="Clear search"
                    >
                      ${icon("x")}
                    </button>
                  </label>
                  <select class="sort-select" data-sort aria-label="Sort movies">
                    <option value="popular" ${
                      state.sort === "popular" ? "selected" : ""
                    }>Most popular</option>
                    <option value="rating" ${
                      state.sort === "rating" ? "selected" : ""
                    }>Highest rated</option>
                    <option value="year" ${
                      state.sort === "year" ? "selected" : ""
                    }>Newest first</option>
                  </select>
                </div>
              </div>
            `
        }
      </div>

      ${
        watchlist
          ? ""
          : `
            <div class="genre-filter" aria-label="Filter by genre">
              <button
                class="genre-button ${state.genre === "all" ? "is-active" : ""}"
                type="button"
                data-genre="all"
              >
                All genres
              </button>
              ${state.genres
                .map(
                  (genre) => `
                    <button
                      class="genre-button ${
                        String(state.genre) === String(genre.id) ? "is-active" : ""
                      }"
                      type="button"
                      data-genre="${genre.id}"
                    >
                      ${escapeHTML(genre.name)}
                    </button>
                  `,
                )
                .join("")}
            </div>
          `
      }

      <div class="movie-grid" style="margin-top: 26px">
        ${
          state.loading
            ? renderSkeletons()
            : source.length
              ? source.map(renderMovieCard).join("")
              : renderEmpty(watchlist)
        }
      </div>
    </section>
  `;
};

const bindCatalogEvents = () => {
  app.querySelectorAll("[data-feed]").forEach((button) => {
    button.addEventListener("click", () => {
      state.feed = button.dataset.feed;
      state.query = "";
      state.genre = "all";
      loadFeed();
    });
  });

  app.querySelectorAll("[data-genre]").forEach((button) => {
    button.addEventListener("click", () => {
      state.genre = button.dataset.genre;
      renderHome();
      document.querySelector("#catalog")?.scrollIntoView({ block: "start" });
    });
  });

  app.querySelector("[data-sort]")?.addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderHome();
    document.querySelector("#catalog")?.scrollIntoView({ block: "start" });
  });

  const searchInput = app.querySelector("[data-search]");
  searchInput?.addEventListener("input", (event) => {
    state.query = event.target.value;
    app
      .querySelector("[data-clear-search]")
      ?.classList.toggle("is-visible", Boolean(state.query));

    clearTimeout(bindCatalogEvents.searchTimeout);
    bindCatalogEvents.searchTimeout = setTimeout(() => {
      if (state.token) {
        loadFeed();
      } else {
        renderHome({ preserveFocus: true });
      }
    }, 350);
  });

  app.querySelector("[data-clear-search]")?.addEventListener("click", () => {
    state.query = "";
    loadFeed();
  });

  app.querySelectorAll("[data-watchlist-id]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleWatchlist(button.dataset.watchlistId);
    });
  });
};

const renderHome = ({ preserveFocus = false } = {}) => {
  const focusSearch = preserveFocus && document.activeElement?.matches("[data-search]");
  const selectionStart = focusSearch ? document.activeElement.selectionStart : null;

  app.innerHTML = `${renderHero()}${renderCatalog()}`;
  bindCatalogEvents();
  refreshIcons();

  if (focusSearch) {
    const input = app.querySelector("[data-search]");
    input?.focus();
    input?.setSelectionRange(selectionStart, selectionStart);
  }
};

const renderWatchlist = () => {
  app.innerHTML = `
    <section class="hero" style="min-height: 430px">
      <img class="hero-backdrop" src="assets/hero-signal-horizon.jpg" alt="" />
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <p class="eyebrow">Your collection</p>
        <h1 style="max-width: 12ch">Saved for later.</h1>
        <p class="hero-summary">
          A personal list of films worth returning to.
        </p>
      </div>
    </section>
    ${renderCatalog({ watchlist: true })}
  `;
  bindCatalogEvents();
  refreshIcons();
};

const findMovie = async (id) => {
  const numericId = Number(id);
  const localMovie = [...state.movies, ...demoMovies].find(
    (movie) => movie.id === numericId,
  );
  if (localMovie) return localMovie;
  if (!state.token) return null;

  try {
    return await tmdbRequest(`/movie/${numericId}`, {
      append_to_response: "videos,credits",
    });
  } catch (error) {
    console.error(error);
    return null;
  }
};

const runtimeText = (minutes) => {
  if (!minutes) return "Runtime TBA";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const renderDetail = async (id) => {
  app.innerHTML = `
    <section class="detail-view">
      <div class="detail-hero">
        <div class="detail-shade"></div>
        <div class="detail-layout">
          <div class="skeleton detail-poster"></div>
          <div class="detail-copy">
            <div class="skeleton skeleton-line short"></div>
            <div class="skeleton skeleton-line"></div>
            <div class="skeleton skeleton-line"></div>
          </div>
        </div>
      </div>
    </section>
  `;

  const movie = await findMovie(id);
  if (!movie) {
    app.innerHTML = renderEmpty();
    refreshIcons();
    return;
  }

  const saved = state.watchlist.has(Number(movie.id));
  const trailer = movie.videos?.results?.find(
    (video) => video.site === "YouTube" && video.type === "Trailer",
  );
  const directors =
    movie.credits?.crew
      ?.filter((person) => person.job === "Director")
      .map((person) => person.name)
      .join(", ") || "Not listed";

  app.innerHTML = `
    <section class="detail-view">
      <div class="detail-hero">
        <img
          class="detail-backdrop"
          src="${escapeHTML(
            imageURL(movie.backdrop_path || movie.poster_path, "original"),
          )}"
          alt=""
        />
        <div class="detail-shade"></div>
        <a class="icon-button back-button" href="#/" title="Back to movies">
          ${icon("arrow-left")}
          <span class="sr-only">Back to movies</span>
        </a>

        <div class="detail-layout">
          <img
            class="detail-poster"
            src="${escapeHTML(imageURL(movie.poster_path, "w500"))}"
            alt="${escapeHTML(movie.title)} poster"
          />
          <div class="detail-copy">
            <p class="eyebrow">${escapeHTML(movie.tagline || "Movie details")}</p>
            <h1>${escapeHTML(movie.title)}</h1>
            <div class="movie-meta">
              <span class="rating">${icon("star")} ${Number(
                movie.vote_average || 0,
              ).toFixed(1)}</span>
              <span class="meta-divider"></span>
              <span>${getYear(movie)}</span>
              <span class="meta-divider"></span>
              <span>${escapeHTML(movieGenres(movie))}</span>
            </div>
            <p class="detail-overview">${escapeHTML(
              movie.overview || "No overview is available for this title.",
            )}</p>
            <div class="detail-actions">
              ${
                trailer
                  ? `
                    <a
                      class="primary-button"
                      href="https://www.youtube.com/watch?v=${encodeURIComponent(
                        trailer.key,
                      )}"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ${icon("play")}
                      <span>Watch trailer</span>
                    </a>
                  `
                  : `
                    <button class="primary-button" type="button" data-no-trailer>
                      ${icon("play")}
                      <span>Trailer</span>
                    </button>
                  `
              }
              <button
                class="secondary-button ${saved ? "is-saved" : ""}"
                type="button"
                data-watchlist-id="${movie.id}"
              >
                ${icon(saved ? "bookmark-check" : "bookmark")}
                <span data-watchlist-label>${
                  saved ? "In watchlist" : "Watchlist"
                }</span>
              </button>
            </div>
            <div class="detail-stats">
              <div class="detail-stat">
                <span>Runtime</span>
                <strong>${runtimeText(movie.runtime)}</strong>
              </div>
              <div class="detail-stat">
                <span>Release</span>
                <strong>${escapeHTML(movie.release_date || "TBA")}</strong>
              </div>
              <div class="detail-stat">
                <span>Director</span>
                <strong>${escapeHTML(directors)}</strong>
              </div>
              <div class="detail-stat">
                <span>Language</span>
                <strong>${escapeHTML(
                  movie.original_language?.toUpperCase() || "EN",
                )}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  app.querySelector("[data-watchlist-id]")?.addEventListener("click", (event) => {
    toggleWatchlist(event.currentTarget.dataset.watchlistId);
  });
  app.querySelector("[data-no-trailer]")?.addEventListener("click", () => {
    showToast("Trailer is available when TMDB is connected.");
  });
  refreshIcons();
};

const parseRoute = () => {
  const hash = location.hash || "#/";
  const [path, queryString = ""] = hash.slice(1).split("?");
  return {
    path,
    params: new URLSearchParams(queryString),
  };
};

const route = async () => {
  setMenu(false);
  const { path, params } = parseRoute();
  window.scrollTo(0, 0);

  if (path.startsWith("/movie/")) {
    await renderDetail(path.split("/")[2]);
  } else if (path === "/watchlist") {
    renderWatchlist();
  } else {
    const requestedFeed = params.get("feed");
    if (requestedFeed && feedLabels[requestedFeed]) state.feed = requestedFeed;
    renderHome();
    if (state.token) loadFeed({ render: false });
  }
};

const updateApiStatus = () => {
  document
    .querySelector("[data-api-dot]")
    ?.classList.toggle("is-live", Boolean(state.token && !state.usingDemo));
};

const openSettings = () => {
  settingsForm.elements.token.value = state.token;
  settingsDialog.showModal();
  document.body.classList.add("dialog-open");
};

const closeSettings = () => {
  settingsDialog.close();
  document.body.classList.remove("dialog-open");
};

menuToggle?.addEventListener("click", () => {
  setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
});

siteNav?.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenu(false);
});

window.addEventListener("scroll", updateHeader, { passive: true });
window.addEventListener("hashchange", route);

document.querySelector("[data-api-settings]")?.addEventListener("click", openSettings);
document
  .querySelector("[data-settings-close]")
  ?.addEventListener("click", closeSettings);

settingsForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const token = settingsForm.elements.token.value.trim();

  if (!token) {
    showToast("Enter a TMDB API Read Access Token.");
    return;
  }

  state.token = token;
  localStorage.setItem(STORAGE.token, token);
  closeSettings();
  state.query = "";
  await loadGenres();
  await loadFeed();
  showToast("TMDB connected.");
});

document.querySelector("[data-use-demo]")?.addEventListener("click", () => {
  state.token = "";
  localStorage.removeItem(STORAGE.token);
  state.movies = [...demoMovies];
  state.genres = [...genres];
  state.usingDemo = true;
  closeSettings();
  renderHome();
  updateApiStatus();
  showToast("Using demo catalog.");
});

settingsDialog?.addEventListener("close", () => {
  document.body.classList.remove("dialog-open");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

saveWatchlist();
updateHeader();
updateApiStatus();
route();
