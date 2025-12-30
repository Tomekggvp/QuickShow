export const TOGGLE_FAVORITE = 'TOGGLE_FAVORITE';

export const toggleFavorite = (movieId) => ({
  type: TOGGLE_FAVORITE,
  payload: movieId
});