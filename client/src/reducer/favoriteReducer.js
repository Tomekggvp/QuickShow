import { TOGGLE_FAVORITE } from '../action/favoriteActions';

const initialState = {
  favorites: JSON.parse(localStorage.getItem('favoriteMovies')) || []
};

const favoriteReducer = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_FAVORITE:
      const movieId = action.payload;
      const isExist = state.favorites.includes(movieId);
      
      let updatedFavorites;
      if (isExist) {

        updatedFavorites = state.favorites.filter(id => id !== movieId);
      } else {

        updatedFavorites = [...state.favorites, movieId];
      }

      localStorage.setItem('favoriteMovies', JSON.stringify(updatedFavorites));

      return {
        ...state,
        favorites: updatedFavorites
      };
      
    default:
      return state;
  }
};

export default favoriteReducer;