import { SET_CURRENT_TRAILER } from '../action/trailerActions';
import { dummyTrailers } from '../assets/assets';

const initialState = {
  currentTrailer: dummyTrailers[0]
};

const trailerReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CURRENT_TRAILER:
      return {
        ...state,
        currentTrailer: action.payload
      };
    default:
      return state;
  }
};

export default trailerReducer;