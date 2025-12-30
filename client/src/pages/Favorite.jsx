import React from 'react';
import { useSelector } from 'react-redux'; 
import { dummyShowsData } from '../assets/assets';
import MovieCard from '../components/MovieCard';
import BlurCircle from '../components/BlurCircle';

const Favorite = () => {

  const favoriteIds = useSelector((state) => state.favorites.favorites);

  const favoriteMovies = dummyShowsData.filter((movie) => 
    favoriteIds.includes(movie._id)
  );

  return favoriteMovies.length > 0 ? (
    <div className='relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]'>
      <BlurCircle top='150px' left='0px'/>
      <BlurCircle bottom='50px' right='50px'/>
      
      <h1 className='text-lg font-medium my-4'>Your Favorite Movies</h1>
      
      <div className='flex flex-wrap max-sm:justify-center gap-8'>
        {favoriteMovies.map((movie) => (
          <MovieCard movie={movie} key={movie._id}/>
        ))}
      </div>
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center min-h-[60vh]'>
      <h1 className='text-3xl font-bold text-center'>No favorite movies yet</h1>
      <p className='text-gray-500 mt-2'>Start adding movies to your favorites!</p>
    </div>
  );
};

export default Favorite;