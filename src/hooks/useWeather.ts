"use client";

import { useState, useEffect } from "react";
import type { WeatherData } from "@/types";

interface UseWeatherResult {
  weather:  WeatherData | null;
  loading:  boolean;
  error:    string | null;
  refresh:  () => void;
}

export function useWeather(): UseWeatherResult {
  const [weather,  setWeather]  = useState<WeatherData | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [tick,     setTick]     = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchWeather(lat: number, lon: number) {
      try {
        const params = new URLSearchParams({
          latitude:  lat.toString(),
          longitude: lon.toString(),
          current:   "temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code",
          timezone:  "auto",
        });

        const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
        if (!res.ok) throw new Error("Weather fetch failed");

        const data = await res.json();
        const c    = data.current;

        const WMO: Record<number, string> = {
          0: "Clear", 1: "Clear", 2: "Partly cloudy", 3: "Overcast",
          51: "Drizzle", 61: "Rain", 71: "Snow", 80: "Showers", 95: "Thunderstorm",
        };

        const code = c.weather_code as number;
        const condition = WMO[code] ?? (code < 50 ? "Cloudy" : "Rainy");

        if (!cancelled) {
          setWeather({
            temperature: Math.round(c.temperature_2m),
            condition,
            humidity:    c.relative_humidity_2m,
            windSpeed:   c.wind_speed_10m,
            isRaining:   c.precipitation > 0,
          });
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError("Could not fetch weather");
        console.warn("[useWeather]", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      ()    => {
        if (!cancelled) {
          setError("Location access denied");
          setLoading(false);
        }
      },
      { timeout: 8000, enableHighAccuracy: false }
    );

    return () => { cancelled = true; };
  }, [tick]);

  return { weather, loading, error, refresh: () => setTick((t) => t + 1) };
}
