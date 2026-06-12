const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const STORAGE_KEYS = {
  unit: "atmos-unit",
  saved: "atmos-saved-cities",
  lastLocation: "atmos-last-location",
};

const DEFAULT_LOCATION = {
  id: 1609350,
  name: "Bangkok",
  country: "Thailand",
  admin1: "Bangkok",
  latitude: 13.75398,
  longitude: 100.50144,
  timezone: "Asia/Bangkok",
};

const weatherCodes = {
  0: { label: "Clear sky", icon: "sun", mood: "clear" },
  1: { label: "Mostly clear", icon: "sun", mood: "clear" },
  2: { label: "Partly cloudy", icon: "cloud-sun", mood: "cloudy" },
  3: { label: "Overcast", icon: "cloud", mood: "cloudy" },
  45: { label: "Foggy", icon: "cloud-fog", mood: "cloudy" },
  48: { label: "Rime fog", icon: "cloud-fog", mood: "cloudy" },
  51: { label: "Light drizzle", icon: "cloud-drizzle", mood: "rain" },
  53: { label: "Drizzle", icon: "cloud-drizzle", mood: "rain" },
  55: { label: "Heavy drizzle", icon: "cloud-rain", mood: "rain" },
  56: { label: "Freezing drizzle", icon: "cloud-hail", mood: "rain" },
  57: { label: "Heavy freezing drizzle", icon: "cloud-hail", mood: "rain" },
  61: { label: "Light rain", icon: "cloud-rain", mood: "rain" },
  63: { label: "Rain", icon: "cloud-rain", mood: "rain" },
  65: { label: "Heavy rain", icon: "cloud-rain-wind", mood: "rain" },
  66: { label: "Freezing rain", icon: "cloud-hail", mood: "rain" },
  67: { label: "Heavy freezing rain", icon: "cloud-hail", mood: "rain" },
  71: { label: "Light snow", icon: "cloud-snow", mood: "cloudy" },
  73: { label: "Snow", icon: "cloud-snow", mood: "cloudy" },
  75: { label: "Heavy snow", icon: "snowflake", mood: "cloudy" },
  77: { label: "Snow grains", icon: "snowflake", mood: "cloudy" },
  80: { label: "Rain showers", icon: "cloud-sun-rain", mood: "rain" },
  81: { label: "Rain showers", icon: "cloud-rain", mood: "rain" },
  82: { label: "Heavy showers", icon: "cloud-rain-wind", mood: "rain" },
  85: { label: "Snow showers", icon: "cloud-snow", mood: "cloudy" },
  86: { label: "Heavy snow showers", icon: "cloud-snow", mood: "cloudy" },
  95: { label: "Thunderstorm", icon: "cloud-lightning", mood: "storm" },
  96: { label: "Storm with hail", icon: "cloud-lightning", mood: "storm" },
  99: { label: "Severe storm", icon: "cloud-lightning", mood: "storm" },
};

const state = {
  unit: localStorage.getItem(STORAGE_KEYS.unit) || "celsius",
  location: readStorage(STORAGE_KEYS.lastLocation, DEFAULT_LOCATION),
  saved: readStorage(STORAGE_KEYS.saved, []),
  weather: null,
  searchResults: [],
  searchController: null,
  forecastController: null,
  searchTimer: null,
};

const elements = {
  searchForm: document.querySelector("#search-form"),
  searchInput: document.querySelector("#city-search"),
  searchResults: document.querySelector("#search-results"),
  locationButton: document.querySelector("#location-button"),
  unitButtons: document.querySelectorAll("[data-unit]"),
  openSaved: document.querySelector("#open-saved"),
  closeSaved: document.querySelector("#close-saved"),
  savedDrawer: document.querySelector("#saved-drawer"),
  drawerBackdrop: document.querySelector("#drawer-backdrop"),
  savedList: document.querySelector("#saved-list"),
  savedCount: document.querySelector("#saved-count"),
  saveCity: document.querySelector("#save-city"),
  loading: document.querySelector("#loading-overlay"),
  errorBanner: document.querySelector("#error-banner"),
  errorMessage: document.querySelector("#error-message"),
  retryButton: document.querySelector("#retry-button"),
  dismissError: document.querySelector("#dismiss-error"),
  hero: document.querySelector("#weather-hero"),
  locationName: document.querySelector("#location-name"),
  locationRegion: document.querySelector("#location-region"),
  localTime: document.querySelector("#local-time"),
  currentTemperature: document.querySelector("#current-temperature"),
  currentCondition: document.querySelector("#current-condition"),
  currentRange: document.querySelector("#current-range"),
  currentIcon: document.querySelector("#current-icon"),
  weatherSummary: document.querySelector("#weather-summary"),
  feelsLike: document.querySelector("#feels-like"),
  humidity: document.querySelector("#humidity"),
  windSpeed: document.querySelector("#wind-speed"),
  pressure: document.querySelector("#pressure"),
  lastUpdated: document.querySelector("#last-updated"),
  rainNote: document.querySelector("#rain-note"),
  hourlyForecast: document.querySelector("#hourly-forecast"),
  dailyForecast: document.querySelector("#daily-forecast"),
  timezoneLabel: document.querySelector("#timezone-label"),
  sunriseTime: document.querySelector("#sunrise-time"),
  sunsetTime: document.querySelector("#sunset-time"),
  sunProgress: document.querySelector("#sun-progress"),
  sunMarker: document.querySelector("#sun-marker"),
};

function readStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function init() {
  bindEvents();
  setUnitButtons();
  renderSavedCities();
  refreshIcons();
  fetchWeather(state.location);
}

function bindEvents() {
  elements.searchForm.addEventListener("submit", handleSearchSubmit);
  elements.searchInput.addEventListener("input", handleSearchInput);
  elements.searchInput.addEventListener("focus", () => {
    if (state.searchResults.length) elements.searchResults.hidden = false;
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-wrap")) closeSearchResults();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeSearchResults();
      closeSavedDrawer();
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      elements.searchInput.focus();
    }
  });

  elements.unitButtons.forEach((button) => {
    button.addEventListener("click", () => setUnit(button.dataset.unit));
  });

  elements.locationButton.addEventListener("click", useCurrentLocation);
  elements.saveCity.addEventListener("click", toggleSavedCity);
  elements.openSaved.addEventListener("click", openSavedDrawer);
  elements.closeSaved.addEventListener("click", closeSavedDrawer);
  elements.drawerBackdrop.addEventListener("click", closeSavedDrawer);
  elements.retryButton.addEventListener("click", () => fetchWeather(state.location));
  elements.dismissError.addEventListener("click", hideError);
}

function handleSearchInput(event) {
  const query = event.target.value.trim();
  window.clearTimeout(state.searchTimer);

  if (query.length < 2) {
    state.searchResults = [];
    closeSearchResults();
    return;
  }

  state.searchTimer = window.setTimeout(() => searchCities(query), 320);
}

async function handleSearchSubmit(event) {
  event.preventDefault();
  const query = elements.searchInput.value.trim();
  if (!query) return;

  if (state.searchResults.length) {
    selectLocation(state.searchResults[0]);
    return;
  }

  await searchCities(query);
  if (state.searchResults.length === 1) selectLocation(state.searchResults[0]);
}

async function searchCities(query) {
  state.searchController?.abort();
  state.searchController = new AbortController();
  renderSearchState("Searching cities...");

  try {
    const params = new URLSearchParams({
      name: query,
      count: "6",
      language: "en",
      format: "json",
    });
    const response = await fetch(`${GEOCODING_URL}?${params}`, {
      signal: state.searchController.signal,
    });

    if (!response.ok) throw new Error("City search is unavailable.");
    const data = await response.json();
    state.searchResults = data.results || [];
    renderSearchResults();
  } catch (error) {
    if (error.name === "AbortError") return;
    state.searchResults = [];
    renderSearchState("Search could not be completed.");
  }
}

function renderSearchResults() {
  elements.searchResults.hidden = false;

  if (!state.searchResults.length) {
    renderSearchState("No matching cities found.");
    return;
  }

  elements.searchResults.innerHTML = state.searchResults
    .map((location, index) => {
      const region = [location.admin1, location.country].filter(Boolean).join(", ");
      return `
        <button class="search-result" type="button" role="option" data-result-index="${index}">
          <span class="result-icon"><i data-lucide="map-pin"></i></span>
          <span>
            <strong>${escapeHtml(location.name)}</strong>
            <span>${escapeHtml(region)}</span>
          </span>
          <i data-lucide="arrow-up-right"></i>
        </button>
      `;
    })
    .join("");

  elements.searchResults.querySelectorAll("[data-result-index]").forEach((button) => {
    button.addEventListener("click", () => {
      selectLocation(state.searchResults[Number(button.dataset.resultIndex)]);
    });
  });
  refreshIcons();
}

function renderSearchState(message) {
  elements.searchResults.hidden = false;
  elements.searchResults.innerHTML = `<div class="search-state">${escapeHtml(message)}</div>`;
}

function closeSearchResults() {
  elements.searchResults.hidden = true;
}

function selectLocation(location) {
  const normalized = {
    id: location.id || `${location.latitude},${location.longitude}`,
    name: location.name,
    country: location.country || "",
    admin1: location.admin1 || "",
    latitude: location.latitude,
    longitude: location.longitude,
    timezone: location.timezone || "auto",
  };

  elements.searchInput.value = "";
  state.searchResults = [];
  closeSearchResults();
  closeSavedDrawer();
  fetchWeather(normalized);
}

async function fetchWeather(location) {
  state.forecastController?.abort();
  state.forecastController = new AbortController();
  setLoading(true);
  hideError();

  const params = new URLSearchParams({
    latitude: location.latitude,
    longitude: location.longitude,
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "weather_code",
      "cloud_cover",
      "pressure_msl",
      "wind_speed_10m",
      "wind_direction_10m",
    ].join(","),
    hourly: [
      "temperature_2m",
      "precipitation_probability",
      "weather_code",
      "wind_speed_10m",
      "relative_humidity_2m",
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "sunrise",
      "sunset",
      "precipitation_probability_max",
      "wind_speed_10m_max",
    ].join(","),
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    timezone: "auto",
    forecast_days: "7",
  });

  try {
    const response = await fetch(`${FORECAST_URL}?${params}`, {
      signal: state.forecastController.signal,
    });
    if (!response.ok) throw new Error(`Forecast request failed (${response.status}).`);

    const weather = await response.json();
    if (!weather.current || !weather.daily || !weather.hourly) {
      throw new Error("The forecast response was incomplete.");
    }

    state.location = { ...location, timezone: weather.timezone || location.timezone };
    state.weather = weather;
    localStorage.setItem(STORAGE_KEYS.lastLocation, JSON.stringify(state.location));
    renderWeather();
  } catch (error) {
    if (error.name === "AbortError") return;
    showError("The live forecast could not be loaded. Check your connection and try again.");
  } finally {
    setLoading(false);
  }
}

function renderWeather() {
  const { current, daily, timezone, timezone_abbreviation: abbreviation } = state.weather;
  const condition = getWeatherCondition(current.weather_code, current.is_day);
  const todayHigh = daily.temperature_2m_max[0];
  const todayLow = daily.temperature_2m_min[0];

  elements.locationName.textContent = state.location.name;
  elements.locationRegion.textContent = locationRegion(state.location);
  elements.localTime.textContent = formatLocalTime(current.time);
  elements.currentTemperature.textContent = `${formatTemperature(current.temperature_2m)}°`;
  elements.currentCondition.textContent = condition.label;
  elements.currentRange.textContent = `H ${formatTemperature(todayHigh)}° · L ${formatTemperature(todayLow)}°`;
  elements.currentIcon.innerHTML = `<i data-lucide="${condition.icon}"></i>`;
  elements.feelsLike.textContent = `${formatTemperature(current.apparent_temperature)}°`;
  elements.humidity.textContent = `${Math.round(current.relative_humidity_2m)}%`;
  elements.windSpeed.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  elements.pressure.textContent = `${Math.round(current.pressure_msl)} hPa`;
  elements.lastUpdated.textContent = formatUpdatedTime(current.time);
  elements.timezoneLabel.textContent = `${timezone.replaceAll("_", " ")} · ${abbreviation}`;
  elements.weatherSummary.textContent = buildSummary(condition, current, daily);

  setHeroMood(condition.mood, current.is_day);
  renderHourlyForecast();
  renderDailyForecast();
  renderSunTrack();
  updateSavedUI();
  refreshIcons();
}

function renderHourlyForecast() {
  const { hourly, current } = state.weather;
  let startIndex = hourly.time.findIndex((time) => time >= current.time);
  if (startIndex < 0) startIndex = 0;

  const items = hourly.time.slice(startIndex, startIndex + 12).map((time, offset) => {
    const index = startIndex + offset;
    const condition = getWeatherCondition(hourly.weather_code[index], true);
    const label = offset === 0 ? "Now" : formatHour(time);
    const rain = hourly.precipitation_probability[index] ?? 0;

    return `
      <article class="hour-card ${offset === 0 ? "now" : ""}">
        <p class="hour-time">${label}</p>
        <i data-lucide="${condition.icon}" aria-label="${condition.label}"></i>
        <p class="hour-temp">${formatTemperature(hourly.temperature_2m[index])}°</p>
        <p class="hour-rain"><i data-lucide="droplet"></i>${rain}%</p>
      </article>
    `;
  });

  const peakRain = Math.max(
    ...hourly.precipitation_probability.slice(startIndex, startIndex + 12).map((value) => value ?? 0),
  );
  elements.rainNote.textContent =
    peakRain >= 50 ? `Up to ${peakRain}% chance of rain` : "Low chance of rain";
  elements.hourlyForecast.innerHTML = items.join("");
}

function renderDailyForecast() {
  const { daily } = state.weather;
  const allLows = daily.temperature_2m_min;
  const allHighs = daily.temperature_2m_max;
  const minTemp = Math.min(...allLows);
  const maxTemp = Math.max(...allHighs);
  const spread = Math.max(maxTemp - minTemp, 1);

  elements.dailyForecast.innerHTML = daily.time
    .map((time, index) => {
      const condition = getWeatherCondition(daily.weather_code[index], true);
      const dayLabel = index === 0 ? "Today" : formatWeekday(time);
      const low = daily.temperature_2m_min[index];
      const high = daily.temperature_2m_max[index];
      const rangeStart = ((low - minTemp) / spread) * 32;
      const rangeWidth = Math.max(((high - low) / spread) * 68, 18);

      return `
        <article class="day-row">
          <span class="day-name">${dayLabel}</span>
          <span class="day-condition">
            <i data-lucide="${condition.icon}"></i>
            <span>${condition.label}</span>
          </span>
          <span class="day-rain">
            <i data-lucide="droplet"></i>
            ${daily.precipitation_probability_max[index] ?? 0}%
          </span>
          <span class="temp-range">
            <span>${formatTemperature(high)}°</span>
            <span class="range-line" style="margin-left:${rangeStart}%; width:${rangeWidth}%"></span>
            <span>${formatTemperature(low)}°</span>
          </span>
          <span class="day-wind">
            <i data-lucide="wind"></i>
            ${Math.round(daily.wind_speed_10m_max[index])} km/h
          </span>
        </article>
      `;
    })
    .join("");
}

function renderSunTrack() {
  const { daily, current } = state.weather;
  const sunrise = daily.sunrise[0];
  const sunset = daily.sunset[0];
  elements.sunriseTime.textContent = formatHour(sunrise);
  elements.sunsetTime.textContent = formatHour(sunset);

  const currentMinutes = timeToMinutes(current.time);
  const sunriseMinutes = timeToMinutes(sunrise);
  const sunsetMinutes = timeToMinutes(sunset);
  const progress = clamp(
    ((currentMinutes - sunriseMinutes) / Math.max(sunsetMinutes - sunriseMinutes, 1)) * 100,
    0,
    100,
  );

  elements.sunProgress.style.width = `${progress}%`;
  elements.sunMarker.style.left = `${progress}%`;
}

function buildSummary(condition, current, daily) {
  const rain = daily.precipitation_probability_max[0] ?? 0;
  const wind = Math.round(current.wind_speed_10m);
  const temperature = formatTemperature(current.temperature_2m);
  const rainText = rain >= 60 ? `Rain is likely, peaking near ${rain}%.` : `Rain chance peaks near ${rain}%.`;
  const windText = wind >= 25 ? `Winds are brisk at ${wind} km/h.` : `Winds remain gentle at ${wind} km/h.`;
  return `${condition.label} and ${temperature}° right now. ${rainText} ${windText}`;
}

function getWeatherCondition(code, isDay) {
  const condition = weatherCodes[code] || {
    label: "Variable weather",
    icon: "cloud-sun",
    mood: "cloudy",
  };
  if (!isDay && condition.mood === "clear") {
    return { ...condition, label: "Clear night", icon: "moon", mood: "night" };
  }
  if (!isDay) return { ...condition, mood: "night" };
  return condition;
}

function setHeroMood(mood, isDay) {
  elements.hero.className = "weather-hero";
  elements.hero.classList.add(`mood-${isDay ? mood : "night"}`);
}

function setUnit(unit) {
  if (unit === state.unit) return;
  state.unit = unit;
  localStorage.setItem(STORAGE_KEYS.unit, unit);
  setUnitButtons();
  if (state.weather) renderWeather();
}

function setUnitButtons() {
  elements.unitButtons.forEach((button) => {
    const active = button.dataset.unit === state.unit;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function formatTemperature(celsius) {
  const value = state.unit === "fahrenheit" ? (celsius * 9) / 5 + 32 : celsius;
  return Math.round(value);
}

function useCurrentLocation() {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported in this browser.");
    return;
  }

  setLoading(true);
  navigator.geolocation.getCurrentPosition(
    (position) => {
      fetchWeather({
        id: `geo-${position.coords.latitude},${position.coords.longitude}`,
        name: "Current location",
        country: "",
        admin1: "",
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timezone: "auto",
      });
    },
    () => {
      setLoading(false);
      showError("Location access was unavailable. Search for your city instead.");
    },
    { enableHighAccuracy: false, timeout: 9000, maximumAge: 600000 },
  );
}

function toggleSavedCity() {
  if (!state.location) return;
  const key = locationKey(state.location);
  const existingIndex = state.saved.findIndex((item) => locationKey(item) === key);

  if (existingIndex >= 0) {
    state.saved.splice(existingIndex, 1);
  } else {
    state.saved.unshift(state.location);
  }

  localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify(state.saved));
  renderSavedCities();
  updateSavedUI();
}

function renderSavedCities() {
  elements.savedCount.textContent = state.saved.length;
  elements.savedCount.hidden = state.saved.length === 0;

  if (!state.saved.length) {
    elements.savedList.innerHTML = `
      <div class="empty-saved">
        <i data-lucide="bookmark"></i>
        <p>Saved cities will appear here for quick weather checks.</p>
      </div>
    `;
    refreshIcons();
    return;
  }

  elements.savedList.innerHTML = state.saved
    .map(
      (location, index) => `
        <article class="saved-city">
          <button class="saved-city-main" type="button" data-saved-index="${index}">
            <strong>${escapeHtml(location.name)}</strong>
            <span>${escapeHtml(locationRegion(location))}</span>
          </button>
          <button class="icon-button remove-city" type="button" data-remove-index="${index}" aria-label="Remove ${escapeHtml(location.name)}">
            <i data-lucide="trash-2"></i>
          </button>
        </article>
      `,
    )
    .join("");

  elements.savedList.querySelectorAll("[data-saved-index]").forEach((button) => {
    button.addEventListener("click", () => selectLocation(state.saved[Number(button.dataset.savedIndex)]));
  });

  elements.savedList.querySelectorAll("[data-remove-index]").forEach((button) => {
    button.addEventListener("click", () => {
      state.saved.splice(Number(button.dataset.removeIndex), 1);
      localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify(state.saved));
      renderSavedCities();
      updateSavedUI();
    });
  });
  refreshIcons();
}

function updateSavedUI() {
  const isSaved =
    state.location && state.saved.some((item) => locationKey(item) === locationKey(state.location));
  elements.saveCity.classList.toggle("saved", isSaved);
  elements.saveCity.setAttribute("aria-label", isSaved ? "Remove saved city" : "Save this city");
  elements.saveCity.setAttribute("title", isSaved ? "Remove saved city" : "Save city");
}

function openSavedDrawer() {
  elements.drawerBackdrop.hidden = false;
  elements.savedDrawer.classList.add("open");
  elements.savedDrawer.setAttribute("aria-hidden", "false");
}

function closeSavedDrawer() {
  elements.savedDrawer.classList.remove("open");
  elements.savedDrawer.setAttribute("aria-hidden", "true");
  window.setTimeout(() => {
    if (!elements.savedDrawer.classList.contains("open")) elements.drawerBackdrop.hidden = true;
  }, 240);
}

function setLoading(isLoading) {
  elements.loading.classList.toggle("visible", isLoading);
}

function showError(message) {
  elements.errorMessage.textContent = message;
  elements.errorBanner.hidden = false;
  refreshIcons();
}

function hideError() {
  elements.errorBanner.hidden = true;
}

function formatLocalTime(isoTime) {
  const date = parseLocalDate(isoTime);
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const monthDay = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${weekday}, ${monthDay} · ${time}`;
}

function formatUpdatedTime(isoTime) {
  const date = parseLocalDate(isoTime);
  return `Updated ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}

function formatHour(isoTime) {
  return parseLocalDate(isoTime).toLocaleTimeString("en-US", {
    hour: "numeric",
  });
}

function formatWeekday(isoTime) {
  return parseLocalDate(isoTime).toLocaleDateString("en-US", {
    weekday: "long",
  });
}

function parseLocalDate(isoTime) {
  const [datePart, timePart = "00:00"] = isoTime.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

function timeToMinutes(isoTime) {
  const timePart = isoTime.split("T")[1] || "00:00";
  const [hour, minute] = timePart.split(":").map(Number);
  return hour * 60 + minute;
}

function locationRegion(location) {
  const parts = [location.admin1, location.country].filter(
    (part, index, values) => part && values.indexOf(part) === index && part !== location.name,
  );
  return parts.join(", ") || "Live coordinates";
}

function locationKey(location) {
  return `${Number(location.latitude).toFixed(3)},${Number(location.longitude).toFixed(3)}`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

window.addEventListener("DOMContentLoaded", init);
