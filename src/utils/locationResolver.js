import { Country, State, City } from "country-state-city";

export const capitalizeWords = (str = "") =>
  str
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

let stateNameToCountry = null;
let cityNameToCountry = null;
let countryNameLookup = null;

function getCountryNameLookup() {
  if (countryNameLookup) return countryNameLookup;
  countryNameLookup = new Map();
  Country.getAllCountries().forEach((country) => {
    countryNameLookup.set(country.name.trim().toLowerCase(), country.name);
  });
  return countryNameLookup;
}

function getStateLookup() {
  if (stateNameToCountry) return stateNameToCountry;
  stateNameToCountry = new Map();
  Country.getAllCountries().forEach((country) => {
    const states = State.getStatesOfCountry(country.isoCode);
    states.forEach((state) => {
      const key = state.name.trim().toLowerCase();
      if (!stateNameToCountry.has(key)) {
        stateNameToCountry.set(key, country.name);
      }
    });
  });
  return stateNameToCountry;
}

function getCityLookup() {
  if (cityNameToCountry) return cityNameToCountry;
  cityNameToCountry = new Map();
  City.getAllCities().forEach((city) => {
    const key = city.name.trim().toLowerCase();
    if (!cityNameToCountry.has(key)) {
      const country = Country.getCountryByCode(city.countryCode);
      if (country) cityNameToCountry.set(key, country.name);
    }
  });
  return cityNameToCountry;
}

const COLLOQUIAL_OVERRIDES = {
  "abu dhabi": "United Arab Emirates",
  "dubai": "United Arab Emirates",
  "sharjah": "United Arab Emirates",
  "ajman": "United Arab Emirates",
  "fujairah": "United Arab Emirates",
  "ras al khaimah": "United Arab Emirates",
  "ras al-khaimah": "United Arab Emirates",
  "umm al quwain": "United Arab Emirates",
  "umm al-quwain": "United Arab Emirates",
  "uae": "United Arab Emirates",
  "uk": "United Kingdom",
  "usa": "United States",
  "us": "United States",
};

export const resolveCountry = (location = "") => {
  if (!location) return null;
  const parts = location.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length < 1) return null;

  const countryLookup = getCountryNameLookup();
  const stateLookup = getStateLookup();
  const cityLookup = getCityLookup();

  for (let i = parts.length - 1; i >= 0; i--) {
    const key = parts[i].toLowerCase();
    if (COLLOQUIAL_OVERRIDES[key]) return COLLOQUIAL_OVERRIDES[key];
    if (countryLookup.has(key)) return countryLookup.get(key);
    if (stateLookup.has(key)) return stateLookup.get(key);
    if (cityLookup.has(key)) return cityLookup.get(key);
  }

  return capitalizeWords(parts[parts.length - 1]);
};
