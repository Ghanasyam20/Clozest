"use client";

import { Cloud, Droplets, Wind, MapPin, RefreshCw } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { cn } from "@/utils/cn";
import { formatTemp } from "@/utils/formatters";

const CONDITION_ICONS: Record<string, string> = {
  "Clear":         "☀️",
  "Clear sky":     "☀️",
  "Mainly clear":  "🌤️",
  "Partly cloudy": "⛅",
  "Overcast":      "☁️",
  "Foggy":         "🌫️",
  "Drizzle":       "🌦️",
  "Rain":          "🌧️",
  "Showers":       "🌧️",
  "Snow":          "❄️",
  "Thunderstorm":  "⛈️",
};

function getConditionIcon(condition: string): string {
  for (const [key, icon] of Object.entries(CONDITION_ICONS)) {
    if (condition.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return "🌡️";
}

export function WeatherWidget() {
  const { weather, loading, error, refresh } = useWeather();

  if (loading) {
    return (
      <div className="glass rounded-xl px-4 py-3 flex items-center gap-3 min-w-[180px] animate-pulse">
        <div className="w-8 h-8 rounded-lg bg-surface-2" />
        <div className="space-y-1.5">
          <div className="h-4 w-16 bg-surface-2 rounded" />
          <div className="h-3 w-12 bg-surface-2 rounded" />
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <button
        onClick={refresh}
        className="glass rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-foreground-faint hover:text-foreground-muted transition-colors"
        title="Click to retry weather"
      >
        <Cloud className="h-4 w-4" />
        <span>Weather unavailable</span>
        <RefreshCw className="h-3 w-3" />
      </button>
    );
  }

  const icon = getConditionIcon(weather.condition);

  return (
    <div className="glass rounded-xl px-4 py-3 flex items-center gap-4">
      {/* Icon + temp */}
      <div className="flex items-center gap-2">
        <span className="text-2xl leading-none">{icon}</span>
        <div>
          <p className="text-lg font-semibold text-foreground leading-none">
            {formatTemp(weather.temperature)}
          </p>
          <p className="text-xs text-foreground-muted mt-0.5">{weather.condition}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-border" />

      {/* Details */}
      <div className="space-y-1">
        {weather.humidity !== undefined && (
          <div className="flex items-center gap-1.5 text-xs text-foreground-faint">
            <Droplets className="h-3 w-3" />
            <span>{weather.humidity}%</span>
          </div>
        )}
        {weather.windSpeed !== undefined && (
          <div className="flex items-center gap-1.5 text-xs text-foreground-faint">
            <Wind className="h-3 w-3" />
            <span>{weather.windSpeed} km/h</span>
          </div>
        )}
        {weather.location && (
          <div className="flex items-center gap-1.5 text-xs text-foreground-faint">
            <MapPin className="h-3 w-3" />
            <span className="truncate max-w-[100px]">{weather.location}</span>
          </div>
        )}
      </div>

      {/* Outfit hint */}
      {weather.isRaining && (
        <div className="ml-1 text-xs px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
          Bring a jacket
        </div>
      )}
    </div>
  );
}
