import { createStore, combineReducers } from 'redux';
import trailerReducer from '../reducer/trailerReducer';
import favoriteReducer from '../reducer/favoriteReducer'; 

const rootReducer = combineReducers({
  trailer: trailerReducer,
  favorites: favoriteReducer 
});

const store = createStore(
  rootReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;