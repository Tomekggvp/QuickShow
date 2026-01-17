import axios from 'axios';

const tmdb = axios.create({

  baseURL: 'https://api.allorigins.win/get?url=' + encodeURIComponent('https://api.themoviedb.org/3'),
});

tmdb.interceptors.response.use((response) => {

  if (response.data && response.data.contents) {
    return {
      ...response,
      data: JSON.parse(response.data.contents)
    };
  }
  return response;
});


export const getParams = (extraParams = {}) => ({
  params: {
    api_key: 'f53964ee2cf1b5f1f14af077bbff023e',
    language: 'en-US',
    ...extraParams
  }
});

export default tmdb;