import axios from 'axios';

// Проверяем, запущено ли приложение локально или на хостинге
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

const tmdb = axios.create({
  // Если локально — бьем напрямую (нужен VPN), если на Netlify — через наш прокси
  baseURL: isLocal 
    ? 'https://api.themoviedb.org/3' 
    : window.location.origin + '/tmdb-api',
  params: {
    api_key: import.meta.env.VITE_TMDB_API_KEY,
    language: 'en-US',
  },
});

// ОБЯЗАТЕЛЬНО: экспортируем экземпляр axios как default
export default tmdb;