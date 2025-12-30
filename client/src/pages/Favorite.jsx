import React from 'react';
import { useUser } from '@clerk/clerk-react'; 
import { dummyShowsData } from '../assets/assets';
import MovieCard from '../components/MovieCard';
import BlurCircle from '../components/BlurCircle';

const Favorite = () => {
  const { user, isLoaded, isSignedIn } = useUser();

  // Пока Clerk проверяет сессию, ничего не рендерим
  if (!isLoaded) return null;

  // Если пользователь не авторизован
  if (!isSignedIn) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh]'>
        <h1 className='text-3xl font-bold text-center'>No favorite movies yet</h1>
        <p className='text-gray-500 mt-2'>Please log in to your account.</p>
        <p className='text-gray-500 mt-2'>And start adding movies to your favorites!</p>
      </div>
    );
  }

  // Если авторизован, получаем данные из Clerk
  const favoriteIds = user?.unsafeMetadata?.favorites || [];
  const favoriteMovies = dummyShowsData.filter((movie) => 
    favoriteIds.includes(String(movie._id))
  );

  // Если авторизован, но список пуст
  if (favoriteMovies.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh]'>
        <h1 className='text-3xl font-bold text-center'>Your list is empty</h1>
        <p className='text-gray-500 mt-2'>You haven't added any movies to your favorites yet.</p>
      </div>
    );
  }

  // Если авторизован и есть фильмы
  return (
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
  );
};

export default Favorite;