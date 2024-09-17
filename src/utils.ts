export interface Weather {
  days: Days[];
  currentConditions: CurrentCondition;
  timezone: string;
}

export interface Days {
  conditions: string;
  datetime: string;
  tempmin: number;
  tempmax: number;
  icon: string;
  hours: Hours[];
}

export interface CurrentCondition {
  icon: string;
  temp: number;
}

export interface Hours {
  icon: string;
  temp: number;
  datetime: string;
}

export interface GetCoordinatesFromUser {
  lat: number;
  lon: number;
}

export enum WeatherIcon {
  RAIN = "rain",
  SNOW = "snow",
  FOG = "fog",
  WIND = "wind",
  CLOUDY = "cloudy",
  CLEARDAY = "clear-day",
  CLEARNIGHT = "clear-night",
  PARTLYCLOUDYDAY = "partly-cloudy-day",
  PARTLYCLOUDYNIGHT = "partly-cloudy-night",
}

export const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
