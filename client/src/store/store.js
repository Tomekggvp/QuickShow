import { createStore, combineReducers } from 'redux';
import trailerReducer from '../reducer/trailerReducer';

const rootReducer = combineReducers({
  trailer: trailerReducer,
});

const store = createStore(
  rootReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;