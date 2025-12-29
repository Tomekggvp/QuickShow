import { StarIcon } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import timeFormat from '../lib/timeFormat';

const MovieCard = ({movie}) => {

    const navigate = useNavigate()

    if (!movie || !movie.backdrop_path) {
        return null;
    }

  return (
   
    <div className='flex flex-col justify-between p-3 rounded-2xl hover:-translate-y-2 transition-all duration-300 w-66 
                    bg-slate-50 border border-slate-200 shadow-md 
                    dark:bg-gray-800 dark:border-transparent dark:shadow-none'>

      <img 
        onClick={() => {navigate(`/movies/${movie._id}`); scrollTo(0,0)}} 
        src={movie.backdrop_path} 
        alt="" 
        className='rounded-lg h-52 w-full object-cover object-right-bottom cursor-pointer shadow-sm' 
      />

      <p className='font-bold mt-3 truncate text-slate-900 dark:text-white'>
        {movie.title}
      </p>

      <p className='text-xs font-medium mt-2 text-slate-500 dark:text-gray-400'>
        {new Date(movie.release_date).getFullYear()} • {movie.genres.slice(0,2).map(genre => genre.name).join(" | ")} • {timeFormat(movie.runtime)}
      </p>

      <div className='flex items-center justify-between mt-4 pb-2'>
        <button 
            onClick={() => {navigate(`/movies/${movie._id}`); scrollTo(0,0)}} 
            className='px-5 py-2 text-xs bg-red-400 hover:bg-red-500 text-white transition rounded-full font-bold shadow-sm cursor-pointer'
        >
            Buy Tickets
        </button>
        
        <p className='flex items-center gap-1 text-sm font-bold text-slate-600 dark:text-gray-400 mt-1 pr-1'>
            <StarIcon className='w-4 h-4 text-red-400 fill-red-400' />
            {movie.vote_average.toFixed(1)}
        </p>
      </div>

    </div>
  );
};

export default MovieCard