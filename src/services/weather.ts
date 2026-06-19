import type { WeatherData } from "@/types";

const OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast";

interface OpenMeteoResponse {
  current: {
    temperature_2m:      number;
    relative_humidity_2m: number;
    wind_speed_10m:       number;
    precipitation:        number;
    weather_code:         number;
  };
}

const WMO_CONDITIONS: Record<number, string> = {
  0:  "Clear sky",
  1:  "Mainly clear",
  2:  "Partly cloudy",
  3:  "Overcast",
  45: "Foggy",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with heavy hail",
};

export async function getWeatherByCoords(
  latitude:  number,
  longitude: number
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude:  latitude.toString(),
    longitude: longitude.toString(),
    current:   [
      "temperature_2m",
      "relative_humidity_2m",
      "wind_speed_10m",
      "precipitation",
      "weather_code",
    ].join(","),
    timezone:   "auto",
    forecast_days: "1",
  });

  const res = await fetch(`${OPEN_METEO_BASE}?${params}`, {
    next: { revalidate: 1800 }, // cache 30 min
  });

  if (!res.ok) throw new Error("Failed to fetch weather data");

  const data: OpenMeteoResponse = await res.json();
  const current = data.current;

  return {
    temperature: Math.round(current.temperature_2m),
    condition:   WMO_CONDITIONS[current.weather_code] ?? "Unknown",
    humidity:    current.relative_humidity_2m,
    windSpeed:   current.wind_speed_10m,
    isRaining:   current.precipitation > 0,
  };
}

export async function getWeatherByCity(city: string): Promise<WeatherData> {
  // Geocode via Open-Meteo's free geocoding API
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
  );

  if (!geoRes.ok) throw new Error("Geocoding failed");

  const geoData = await geoRes.json();
  const location = geoData.results?.[0];
  if (!location) throw new Error(`City not found: ${city}`);

  const weather = await getWeatherByCoords(location.latitude, location.longitude);
  return { ...weather, location: `${location.name}, ${location.country}` };
}
