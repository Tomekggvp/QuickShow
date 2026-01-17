import axios from 'axios';

const tmdb = axios.create({
  baseURL: 'https://corsproxy.io/?https://api.themoviedb.org/3',
  params: {
    api_key: 'f53964ee2cf1b5f1f14af077bbff023e', 
    language: 'en-US',
  },
});

// Добавим проверку в консоль, чтобы видеть, какой URL формируется
tmdb.interceptors.request.use(config => {
  console.log('Final URL:', config.baseURL + config.url);
  return config;
});

export default tmdb;