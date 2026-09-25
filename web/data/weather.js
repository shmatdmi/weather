const elements = {
  apparent: document.querySelector("#apparent"),
  condition: document.querySelector("#condition"),
  humidity: document.querySelector("#humidity"),
  refresh: document.querySelector("#refresh"),
  status: document.querySelector("#status"),
  statusText: document.querySelector("#status-text"),
  temperature: document.querySelector("#temperature"),
  updated: document.querySelector("#updated"),
  weather: document.querySelector("#weather"),
  windDirection: document.querySelector("#wind-direction"),
  windGusts: document.querySelector("#wind-gusts"),
  windSpeed: document.querySelector("#wind-speed"),
};

function formatNumber(value) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(value);
}

function compassDirection(degrees) {
  const directions = ["северный", "северо-восточный", "восточный", "юго-восточный", "южный", "юго-западный", "западный", "северо-западный"];
  return directions[Math.round(degrees / 45) % directions.length];
}

async function loadWeather() {
  elements.refresh.disabled = true;
  if (elements.status) elements.status.className = "status";
  elements.statusText.textContent = "Получаем свежие данные…";
  if (elements.weather) elements.weather.setAttribute("aria-busy", "true");

  try {
    const response = await fetch(`/api/weather?refresh=${Date.now()}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Ошибка загрузки");

    elements.temperature.textContent = formatNumber(data.temperature);
    elements.apparent.textContent = `${formatNumber(data.apparentTemperature)} °C`;
    elements.condition.textContent = data.description;
    elements.windSpeed.textContent = formatNumber(data.windSpeed);
    elements.windGusts.textContent = formatNumber(data.windGusts);
    elements.windDirection.textContent = compassDirection(data.windDirection);
    elements.humidity.textContent = formatNumber(data.humidity);
    elements.updated.textContent = new Intl.DateTimeFormat("ru-RU", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Europe/Moscow",
    }).format(new Date(data.time));

    if (elements.status) elements.status.className = "status ready";
    elements.statusText.textContent = "Данные OpenWeather актуальны";
  } catch (error) {
    if (elements.status) elements.status.className = "status error";
    elements.statusText.textContent = error.message || "Не удалось загрузить погоду";
  } finally {
    elements.refresh.disabled = false;
    if (elements.weather) elements.weather.setAttribute("aria-busy", "false");
  }
}

elements.refresh.addEventListener("click", loadWeather);
loadWeather();
setInterval(loadWeather, 5 * 60 * 1000);
