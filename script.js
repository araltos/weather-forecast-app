let API_KEY = null;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

let temperatureChart = null;
let isFahrenheit = true; // Changed to start with Fahrenheit

async function loadApiKey() {
    try {
        const response = await fetch('./config.json');
        if (!response.ok) {
            throw new Error('Could not load configuration file');
        }
        const config = await response.json();
        API_KEY = config.API_KEY;
        
        if (!API_KEY || API_KEY === 'YOUR_ACTUAL_API_KEY_HERE') {
            throw new Error('API key not configured properly');
        }
        
        console.log('✅ API key loaded successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to load API key:', error);
        displayError('Configuration error: Please check your API key setup');
        return false;
    }
}

async function searchWeather() {
    if (!API_KEY) {
        const keyLoaded = await loadApiKey();
        if (!keyLoaded) return;
    }
    
    const cityName = document.getElementById('cityInput').value.trim();
    
    try {
        if (!cityName) {
            throw new Error('Please enter a city name');
        }
        
        if (cityName.length < 2) {
            throw new Error('City name must be at least 2 characters');
        }
        
        clearPreviousResults();
        fetchWeatherData(cityName);
        
    } catch (error) {
        displayError(error.message);
        console.error('Search error:', error);
    }
}

async function useMyLocation() {
    if (!API_KEY) {
        const keyLoaded = await loadApiKey();
        if (!keyLoaded) return;
    }
    
    if (!navigator.geolocation) {
        displayError('Geolocation is not supported by this browser');
        return;
    }
    
    document.getElementById('weatherDisplay').innerHTML = '<p>🔍 Getting your location...</p>';
    
    navigator.geolocation.getCurrentPosition(
        function(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            console.log(`Location found: ${lat}, ${lon}`);
            fetchWeatherByCoords(lat, lon);
        },
        function(error) {
            let errorMessage = 'Unable to get your location: ';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += 'Location access denied. Please enable location services.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += 'Location information unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMessage += 'Location request timed out.';
                    break;
                default:
                    errorMessage += 'Unknown error occurred.';
                    break;
            }
            displayError(errorMessage);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        }
    );
}

async function fetchWeatherData(cityName) {
    try {
        document.getElementById('weatherDisplay').innerHTML = '<p>🌤️ Loading weather data...</p>';
        
        const weatherResponse = await fetch(
            `${BASE_URL}/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`
        );
        
        if (!weatherResponse.ok) {
            if (weatherResponse.status === 404) {
                throw new Error('City not found. Please check the spelling and try again.');
            } else if (weatherResponse.status === 401) {
                throw new Error('Invalid API key. Please check your configuration.');
            } else {
                throw new Error(`Weather service error: ${weatherResponse.status}`);
            }
        }
        
        const weatherData = await weatherResponse.json();
        console.log('Weather data received:', weatherData);
        
        displayCurrentWeather(weatherData);
        
        const forecastResponse = await fetch(
            `${BASE_URL}/forecast?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`
        );
        
        if (forecastResponse.ok) {
            const forecastData = await forecastResponse.json();
            console.log('Forecast data received:', forecastData);
            displayForecastChart(forecastData);
        } else {
            console.warn('Could not fetch forecast data');
        }
        
    } catch (error) {
        displayError(error.message);
        console.error('Fetch error:', error);
    }
}

async function fetchWeatherByCoords(lat, lon) {
    try {
        document.getElementById('weatherDisplay').innerHTML = '<p>🌍 Loading weather for your location...</p>';
        
        const weatherResponse = await fetch(
            `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        
        if (!weatherResponse.ok) {
            throw new Error('Unable to fetch weather data for your location');
        }
        
        const weatherData = await weatherResponse.json();
        displayCurrentWeather(weatherData);
        
        const forecastResponse = await fetch(
            `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        
        if (forecastResponse.ok) {
            const forecastData = await forecastResponse.json();
            displayForecastChart(forecastData);
        }
        
    } catch (error) {
        displayError(error.message);
        console.error('Coordinates fetch error:', error);
    }
}

function celsiusToFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}

function displayCurrentWeather(data) {
    const weatherDisplay = document.getElementById('weatherDisplay');
    
    let temperature = data.main.temp;
    let feelsLike = data.main.feels_like;
    const description = data.weather[0].description;
    const iconCode = data.weather[0].icon;
    const cityName = data.name;
    const country = data.sys.country;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const pressure = data.main.pressure;
    
    if (isFahrenheit) {
        temperature = celsiusToFahrenheit(temperature);
        feelsLike = celsiusToFahrenheit(feelsLike);
    }
    
    temperature = Math.round(temperature);
    feelsLike = Math.round(feelsLike);
    
    const unit = isFahrenheit ? '°F' : '°C';
    
    const weatherHTML = `
        <div class="weather-card">
            <h2>📍 ${cityName}, ${country}</h2>
            <div style="display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap;">
                <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" 
                     alt="${description}" 
                     style="width: 100px; height: 100px;">
                <div>
                    <h3>${temperature}${unit}</h3>
                    <p style="font-size: 1.2em; text-transform: capitalize; margin: 0;">
                        ${description}
                    </p>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 25px; text-align: left;">
                <div style="background: rgba(255,255,255,0.7); padding: 15px; border-radius: 10px;">
                    <strong>🌡️ Feels like:</strong> ${feelsLike}${unit}<br>
                    <strong>💧 Humidity:</strong> ${humidity}%
                </div>
                <div style="background: rgba(255,255,255,0.7); padding: 15px; border-radius: 10px;">
                    <strong>💨 Wind:</strong> ${windSpeed} m/s<br>
                    <strong>📊 Pressure:</strong> ${pressure} hPa
                </div>
            </div>
        </div>
    `;
    
    weatherDisplay.innerHTML = weatherHTML;
}

function displayForecastChart(forecastData) {
    try {
        const dailyForecasts = forecastData.list
            .filter(item => item.dt_txt.includes('12:00:00'))
            .slice(0, 5)
            .map(item => {
                const date = new Date(item.dt * 1000);
                let temperature = Math.round(item.main.temp);
                
                if (isFahrenheit) {
                    temperature = Math.round(celsiusToFahrenheit(item.main.temp));
                }
                
                return {
                    date: date.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                    }),
                    temperature: temperature,
                    description: item.weather[0].description,
                    icon: item.weather[0].icon
                };
            });
        
        const labels = dailyForecasts.map(forecast => forecast.date);
        const temperatures = dailyForecasts.map(forecast => forecast.temperature);
        
        if (temperatureChart) {
            temperatureChart.destroy();
        }
        
        const ctx = document.getElementById('temperatureChart').getContext('2d');
        temperatureChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: isFahrenheit ? 'Temperature (°F)' : 'Temperature (°C)',
                    data: temperatures,
                    borderColor: '#ffbe33',
                    backgroundColor: 'rgba(255, 190, 51, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#ffbe33',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 3,
                    pointRadius: 8,
                    pointHoverRadius: 10
                }]
            },
            options: {
                responsive: true,
                devicePixelRatio: window.devicePixelRatio || 2,
                plugins: {
                    title: {
                        display: true,
                        text: '📈 5-Day Temperature Forecast',
                        font: {
                            size: 18,
                            weight: 'bold'
                        },
                        color: '#2c3e50'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: isFahrenheit ? 'Temperature (°F)' : 'Temperature (°C)',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                }
            }
        });
        
        console.log('Chart created successfully with data:', dailyForecasts);
        
    } catch (error) {
        console.error('Chart creation error:', error);
        displayError('Unable to create forecast chart');
    }
}

function displayError(message) {
    const weatherDisplay = document.getElementById('weatherDisplay');
    weatherDisplay.innerHTML = `<div class="error">❌ ${message}</div>`;
    
    if (temperatureChart) {
        temperatureChart.destroy();
        temperatureChart = null;
    }
    
    console.error('Error displayed to user:', message);
}

function clearPreviousResults() {
    document.getElementById('weatherDisplay').innerHTML = '';
    if (temperatureChart) {
        temperatureChart.destroy();
        temperatureChart = null;
    }
}

function retryApiCall(apiFunction, maxRetries = 3, currentRetry = 0, delay = 1000) {
    return apiFunction()
        .catch(error => {
            if (currentRetry < maxRetries) {
                console.log(`Retry attempt ${currentRetry + 1} of ${maxRetries} after ${delay}ms`);
                
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve(retryApiCall(
                            apiFunction, 
                            maxRetries, 
                            currentRetry + 1, 
                            delay * 2
                        ));
                    }, delay);
                });
            } else {
                console.error('All retry attempts failed');
                throw error;
            }
        });
}

function toggleTemperatureUnit() {
    isFahrenheit = !isFahrenheit;
    
    const cityName = document.getElementById('cityInput').value.trim();
    if (cityName) {
        fetchWeatherData(cityName);
    } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
            err => displayError('Geolocation failed.')
        );
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    await loadApiKey();
    
    const cityInput = document.getElementById('cityInput');
    cityInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            searchWeather();
        }
    });
    
    cityInput.focus();
    
    console.log('🌤️ Weather Forecast App loaded successfully on Mac M1!');
    console.log('🔐 API key loaded securely from config.json');
    console.log('🌡️ Starting with Fahrenheit display');
    console.log('Ready to fetch weather data...');
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        searchWeather,
        useMyLocation,
        displayError,
        retryApiCall,
        loadApiKey
    };
}