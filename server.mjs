import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 8000);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "web", "data");
const CACHE_TTL_MS = 5 * 60 * 1000;

// Существующий API проекта из weather/msk_temp.sh и weather/msk_wind.sh.
// Переменная окружения позволяет заменить ключ без правки исходного кода.
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || "ba23e3e7888484e7a26b57b215d65200";
const WEATHER_URL = new URL("https://api.openweathermap.org/data/2.5/weather");
WEATHER_URL.search = new URLSearchParams({
  q: "Moscow,RU",
  appid: OPENWEATHER_API_KEY,
  units: "metric",
  lang: "ru",
}).toString();

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

let weatherCache = null;
let weatherCacheTime = 0;

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Cache-Control": "no-store",
    "Content-Type": contentTypes[".json"],
  });
  response.end(JSON.stringify(body));
}

async function getWeather() {
  if (weatherCache && Date.now() - weatherCacheTime < CACHE_TTL_MS) return weatherCache;

  const upstream = await fetch(WEATHER_URL, {
    headers: { "User-Agent": "mskweather-local/1.0" },
    signal: AbortSignal.timeout(10_000),
  });

  if (!upstream.ok) throw new Error(`OpenWeather вернул HTTP ${upstream.status}`);

  const data = await upstream.json();
  if (typeof data.main?.temp !== "number" || typeof data.wind?.speed !== "number") {
    throw new Error("OpenWeather вернул неожиданный формат данных");
  }

  weatherCache = {
    city: data.name || "Москва",
    time: data.dt * 1000,
    temperature: data.main.temp,
    apparentTemperature: data.main.feels_like,
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    description: data.weather?.[0]?.description || "Текущая погода",
    icon: data.weather?.[0]?.icon || null,
    windSpeed: data.wind.speed,
    windDirection: data.wind.deg,
    windGusts: data.wind.gust ?? data.wind.speed,
    source: "OpenWeather",
  };
  weatherCacheTime = Date.now();
  return weatherCache;
}

async function serveStatic(requestPath, response) {
  const relativePath = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
  const filePath = path.resolve(ROOT, relativePath);

  if (filePath !== ROOT && !filePath.startsWith(`${ROOT}${path.sep}`)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const contents = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
    });
    response.end(contents);
  } catch (error) {
    response.writeHead(error.code === "ENOENT" ? 404 : 500, {
      "Content-Type": "text/plain; charset=utf-8",
    });
    response.end(error.code === "ENOENT" ? "Страница не найдена" : "Ошибка сервера");
  }
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

  if (requestUrl.pathname === "/api/weather") {
    try {
      sendJson(response, 200, await getWeather());
    } catch (error) {
      console.error("Weather request failed:", error.message);
      sendJson(response, 502, { error: "Не удалось получить актуальную погоду" });
    }
    return;
  }

  await serveStatic(decodeURIComponent(requestUrl.pathname), response);
});

server.listen(PORT, HOST, () => {
  console.log(`mskweather запущен: http://${HOST}:${PORT}`);
});
