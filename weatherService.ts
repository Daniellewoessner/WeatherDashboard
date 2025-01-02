import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

interface Coordinates {
  lat: number;
  lon: number;
}

interface Weather {
  city: string;
  date: string;
  description: string;
  tempF: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  icon: string;           // Add icon
  iconDescription: string // Add icon description
}

class Weather {
  constructor(
    public city: string,
    public date: string,
    public description: string,
    public tempF: number,
    public feelsLike: number,
    public humidity: number,
    public windSpeed: number,
    public icon: string, // Add icon
    public iconDescription: string // Add icon description
  ) {}
}

export class WeatherService {
  private baseURL: string;
  private apiKey: string;
  private cityName: string;

  constructor(cityName: string) {
    this.baseURL = 'https://api.openweathermap.org/data/2.5';
    this.apiKey = process.env.WEATHER_API_KEY || '';
    this.cityName = cityName;
  }
  

  private async fetchLocationData(query: string): Promise<Coordinates[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        limit: '1',
        appid: this.apiKey
      });
      
      const response = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?${params}`
      );
      
      if (!response.data.length) {
        throw new Error('City not found');
      }
      
      return [{
        lat: response.data[0].lat,
        lon: response.data[0].lon
      }];
    } catch (error) {
      console.error('Location fetch error:', error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }

  private async fetchWeatherData(coordinates: Coordinates) {
    const params = new URLSearchParams({
      lat: coordinates.lat.toString(),
      lon: coordinates.lon.toString(),
      appid: this.apiKey,
      units: 'metric'
    });

    try {
      const [currentWeather, forecast] = await Promise.all([
        axios.get(`${this.baseURL}/weather?${params}`),
        axios.get(`${this.baseURL}/forecast?${params}`)
      ]);
      
      return {
        currentWeather: currentWeather.data,
        forecast: forecast.data
      };
    } catch (error) {
      console.error('Weather fetch error:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }
  private parseCurrentWeather(response: any): Weather {
    console.log('Current Weather Response:', response);
  
    if (!response || !response.weather || !response.main || !response.wind) {
      throw new Error('Invalid weather data received');
    }
  
    const current = response;
    const name = this.cityName === 'location not found' 
      ? 'Location not found, here\'s the weather for Orlando, FL instead'
      : current.name;

      // Convert Celsius to Fahrenheit
      const tempF = (current.main.temp * 9/5) + 32;

    return new Weather(
      name,
      new Date().toLocaleDateString(),
      current.weather[0].description,
      Math.round(tempF*10)/10, // Round to 1 decimal place
      current.main.feels_like,
      current.main.humidity,
      current.wind.speed,
      current.weather[0].icon, // Add icon
      current.weather[0].description // Add icon description  
    );
  }

  private parseForecast(response: any): Weather[] {
    return response.list
      .filter((_: any, i: number) => i % 8 === 0)
      .map((weather: any) => {
        const date = new Date(weather.dt * 1000);
        // Convert Celsius to Fahrenheit
        const tempF = (weather.main.temp * 9/5) + 32;

        return new Weather(
          this.cityName,
          date.toLocaleDateString(),
          weather.weather[0].description,
          Math.round(tempF*10)/10, // Round to 1 decimal place
          weather.main.feels_like,
          weather.main.humidity,
          weather.wind.speed,
          weather.weather[0].icon, // Add icon
          weather.weather[0].description // Add icon description
        );
      });
  }

  private buildForecastArray(currentWeather: Weather, forecast: Weather[]): Weather[] {
    return [currentWeather, ...forecast];
  }

  async getWeatherForCity(city: string): Promise<Weather[] | undefined> {
    try {
      const locationData = await this.fetchLocationData(city);
      if (!locationData.length) {
        throw new Error('Location not found');
      }

      const coordinates = locationData[0];
      const weatherData = await this.fetchWeatherData(coordinates);

      console.log ('Weather API Response:', weatherData);
      
      const current = this.parseCurrentWeather(weatherData.currentWeather);

      console.log('Parsed Current Weather:', current);

      const forecast = this.parseForecast(weatherData.forecast);

      console.log('Parsed Forecast:', forecast);
      
      return this.buildForecastArray(current, forecast);
    } catch (error) {
      console.error('Weather service error:', error instanceof Error ? error.message : 'Unknown error');
      return undefined;
    }
  }
}

export default {
  createWeatherService(cityName: string) {
    return new WeatherService(cityName);
  }
};
