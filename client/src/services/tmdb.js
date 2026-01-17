import axios from 'axios';

const tmdb = axios.create({
  // Это публичное зеркало (прокси), оно работает без VPN и лишних настроек
  baseURL: 'https://tmdb-proxy.movies-api.workers.dev/3', 
  params: {
    // Вставьте сюда ваш ключ напрямую для теста
    api_key: 'f53964ee2cf1b5f1f14af077bbff023e', 
    language: 'en-US',
  },
});

export default tmdb;