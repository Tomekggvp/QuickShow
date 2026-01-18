import axios from 'axios';

const kinopoisk = axios.create({
  baseURL: 'https://kinopoiskapiunofficial.tech/api/v2.2',
  headers: {
   
    'X-API-KEY': import.meta.env.VITE_KINOPOISK_API_KEY,
    'Content-Type': 'application/json',
  },
});

export default kinopoisk;