# Overview

As a software engineer, I aimed to create a robust and user-friendly weather forecast application that demonstrates proficiency in JavaScript, modern web development techniques, and secure API key management. This project serves as a practical exercise in building a real-world application with a focus on clean code, error handling, and a polished user experience.

This software is a web-based weather forecast application built using JavaScript, HTML, and CSS. It allows users to search for weather information by city name or use their current location to fetch and display current weather conditions and a 5-day temperature forecast. The application integrates the OpenWeatherMap API for real-time weather data and Chart.js for interactive data visualization.

The purpose of writing this software was to gain hands-on experience with asynchronous JavaScript, API integration, DOM manipulation, and data visualization techniques. Additionally, the project emphasizes secure API key management by loading the API key from a separate configuration file, ensuring that sensitive information is not exposed in the codebase.

[Software Demo Video]()

# Development Environment

This software was developed using VS Code on a Mac M1. The development environment included a modern web browser (Chrome) for testing and debugging. The Live Server extension for VS Code was used for real-time updates during development.

The programming language used was JavaScript (ES6+), along with HTML5 and CSS3 for structuring and styling the application. The following libraries were used:

- **Chart.js**: For creating the 5-day temperature forecast chart. Chart.js is included in the project via a Content Delivery Network (CDN). This means the Chart.js library is loaded directly from a remote server when the `index.html` file is opened in a browser, rather than being included as a local file in the project.

# Useful Websites

The following websites were helpful in the development of this project:

- [OpenWeatherMap API Documentation](https://openweathermap.org/api): For understanding the API endpoints and data structures.
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/): For learning how to create and customize charts.
- [MDN Web Docs](https://developer.mozilla.org/en-US/): For JavaScript, HTML, and CSS references.
- [Stack Overflow](https://stackoverflow.com/): For troubleshooting and finding solutions to common problems.

# Future Work

The following are some areas for future improvement and additions to the software:

- Implement a more sophisticated UI with additional weather details (e.g., wind direction, sunrise/sunset times).
- Add support for multiple languages and units (e.g., Fahrenheit).
- Implement a caching mechanism to reduce API calls and improve performance.
- Add a feature to save favorite locations for quick access.