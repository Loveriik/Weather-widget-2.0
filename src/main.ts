import "./style.css";

import {
  Weather,
  daysOfWeek,
  WeatherIcon,
  GetCoordinatesFromUser,
} from "./utils";

import tzlookup from "tz-lookup";
import moment from "moment-timezone";

class WeatherWidget {
  private weatherApiKey = import.meta.env.VITE_WEATHER_API_KEY;
  private coordinatesApiKey = import.meta.env.VITE_COORDINATES_API_KEY;
  private form = document.querySelector("#form") as HTMLFormElement;
  private formInput = document.querySelector("#formInput") as HTMLInputElement;
  private temperatureNow = document.querySelector(
    "#tempNow"
  ) as HTMLSpanElement;
  private temperatureAtHourContainer =
    document.querySelectorAll(".tempAtHour")!;

  private weekDaysContainer = document.querySelectorAll(".weekDay")!;
  private minmaxTempForWeekDays = document.querySelectorAll(".minmax")!;
  private cityName = document.querySelector(".city")!;
  private description = document.querySelector(
    ".description"
  ) as HTMLSpanElement;
  private cornerIcon = document.querySelector(".bigIcon") as HTMLImageElement;
  private widgetBody = document.querySelector(".widgetBody") as HTMLDivElement;
  private spinner = document.querySelector(".spinner") as HTMLSpanElement;

  constructor() {
    this.init();
  }

  private init(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) =>
        this.getCoordinates(position)
      );
    }
    this.form.addEventListener("submit", this.getCoordinatesFromUser);
  }

  private getCoordinatesFromUser = async (event: Event): Promise<void> => {
    try {
      event.preventDefault();
      const city = this.formInput.value.trim();

      if (!city) {
        return;
      }

      const cityUrl = `http://api.openweathermap.org/geo/1.0/direct?q=<${city}>&appid=${this.coordinatesApiKey}`;

      const response = await fetch(cityUrl);
      const data: GetCoordinatesFromUser[] = await response.json();

      const latitude = data[0].lat;
      const longitude = data[0].lon;

      const timeZone = tzlookup(latitude, longitude);
      const currentHour = moment.tz(new Date(), timeZone).format("HH");

      this.formInput.value = "";
      this.fetchWeather(latitude, longitude, currentHour);
    } catch (error) {
      console.log(error);
    }
  };

  private getCoordinates(position: GeolocationPosition): void {
    const lat = position.coords.latitude;
    const long = position.coords.longitude;

    this.fetchWeather(lat, long);
  }

  private async fetchWeather(
    lat: number,
    long: number,
    time?: string
  ): Promise<void> {
    try {
      const response = await fetch(
        `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${long}?unitGroup=metric&key=${this.weatherApiKey}`
      );

      const data = await response.json();
      const currentTime = this.getTime();

      if (time) {
        this.setWeather(Number(time), data);
      } else {
        this.setWeather(currentTime, data);
      }
    } catch (error) {}
  }

  private getTime(): number {
    const date = new Date();
    return date.getHours();
  }

  private setIcon(type: string, img: HTMLImageElement): void {
    switch (type) {
      case WeatherIcon.CLEARDAY:
        img.src = "/icons/clear-day.png";
        img.alt = "clear-day";
        break;
      case WeatherIcon.CLOUDY:
        img.src = "/icons/cloudy.png";
        img.alt = "cloudy";
        break;
      case WeatherIcon.FOG:
        img.src = "/icons/fog.png";
        img.alt = "fog";
        break;
      case WeatherIcon.CLEARNIGHT:
        img.src = "/icons/clear-night.png";
        img.alt = "clear-night";
        break;
      case WeatherIcon.RAIN:
        img.src = "/icons/rain.png";
        img.alt = "rain";
        break;
      case WeatherIcon.SNOW:
        img.src = "/icons/snow.png";
        img.alt = "snow";
        break;
      case WeatherIcon.WIND:
        img.src = "/icons/wind.png";
        img.alt = "wind";
        break;
      case WeatherIcon.PARTLYCLOUDYDAY:
        img.src = "/icons/cloudy-day.png";
        img.alt = "cloudy day";
        break;
      case WeatherIcon.PARTLYCLOUDYNIGHT:
        img.src = "/icons/cloudy-night.png";
        img.alt = "cloudy night";
        break;
    }
  }

  private setBackground(temp: number): void {
    switch (true) {
      case temp <= 0:
        this.widgetBody.style.background =
          "linear-gradient(135deg, #d7e8f7, #6c849e)";
        break;
      case temp > 0 && temp <= 10:
        this.widgetBody.style.background =
          "linear-gradient(135deg, #b6d7e4, #8aaea3)";
        break;
      case temp > 10 && temp <= 20:
        this.widgetBody.style.background =
          "linear-gradient(135deg, #d3f6db, #90c9b2)";
        break;
      case temp > 20 && temp <= 30:
        this.widgetBody.style.background =
          "linear-gradient(135deg, #f9e4b7, #f3c395)";
        break;
      case temp > 30 && temp <= 40:
        this.widgetBody.style.background =
          "linear-gradient(135deg, #f9c5b6, #e88d8f)";
        break;
      case temp > 40:
        this.widgetBody.style.background =
          "linear-gradient(135deg, #f8ad6d, #e76a4f)";
        break;
    }
  }

  private setWeather(time: number, data: Weather): void {
    this.temperatureNow.textContent =
      Math.floor(data.currentConditions.temp).toString() + "°C";

    this.setBackground(data.currentConditions.temp);
    this.setIcon(data.days[0].icon, this.cornerIcon);

    this.cityName.textContent = `in ${data.timezone.split("/")[1]} is`;

    this.description.textContent = data.days[0].conditions;

    //* Building up an array for a six hours forecast
    let hours;
    if (23 - time >= 5) {
      hours = data.days[0].hours.slice(time, time + 6);
    } else {
      const difference = 23 - time;
      const requiredNumberOfDays = 5 - difference;

      hours = [
        ...data.days[0].hours.slice(time, time + difference + 1),
        ...data.days[1].hours.slice(0, requiredNumberOfDays),
      ];
    }

    //* Setting up temperatures for every hour
    this.temperatureAtHourContainer.forEach((item, index) => {
      const time = item.querySelector(".time") as HTMLParagraphElement;
      const temperature = item.querySelector(
        ".temperature"
      ) as HTMLParagraphElement;

      const icon = item.querySelector("img") as HTMLImageElement;
      this.setIcon(hours[index].icon, icon);

      temperature.textContent =
        Math.floor(hours[index].temp).toString()! + "°C";

      if (index === 0) {
        time.textContent = "now";
      } else {
        time.textContent = hours[index].datetime?.slice(0, 5)!;
      }
    });

    //* Setting up correct display of week days and weather badge
    this.weekDaysContainer.forEach((item, index) => {
      const newDat = new Date(data.days[index + 1].datetime);
      const dayIndex = newDat.getDay();
      const requiredDay = daysOfWeek[dayIndex];

      const dayHTMLElement = item.querySelector("h2") as HTMLHeadingElement;
      dayHTMLElement.textContent = requiredDay;

      const weatherBadge = item.querySelector("img") as HTMLImageElement;
      this.setIcon(data.days[index + 1].icon, weatherBadge);
    });

    //* Setting up correct display of min max temperatures
    this.minmaxTempForWeekDays.forEach((item, index) => {
      const minTemp = Math.floor(data.days[index + 1].tempmin);
      const maxTemp = Math.floor(data.days[index + 1].tempmax);

      const minHTNLElement = item.querySelector(".min") as HTMLParagraphElement;
      minHTNLElement.textContent = minTemp.toString();

      const maxHTMLElement = item.querySelector(".max") as HTMLParagraphElement;
      maxHTMLElement.textContent = maxTemp.toString();
    });

    this.spinner.classList.add("hidden");
    this.widgetBody.classList.remove("hidden");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new WeatherWidget();
});
