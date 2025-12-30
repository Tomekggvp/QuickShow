import { StarIcon } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import timeFormat from '../lib/timeFormat';
import { useTheme } from '@mui/material/styles'; 

const MovieCard = ({movie}) => {
    const navigate = useNavigate();
    const theme = useTheme(); 
    
    const isDark = theme.palette.mode === 'dark';

    if (!movie || !movie.backdrop_path) return null;

    return (
        <div className={`
            flex flex-col justify-between p-3 rounded-2xl hover:-translate-y-2 transition-all duration-300 w-66 shadow-md
            ${isDark ? 'bg-gray-800 text-white' : 'bg-[#afceec3a] text-black '}
        `}>

            <img 
                onClick={() => {navigate(`/movies/${movie._id}`); scrollTo(0,0)}} 
                src={movie.backdrop_path} 
                className='rounded-lg h-52 w-full object-cover cursor-pointer' 
            />

            <p className='font-bold mt-3 truncate'>
                {movie.title}
            </p>

            <p className={`text-xs font-medium mt-2 ${isDark ? 'text-gray-400' : 'text-amber-800'}`}>
                {new Date(movie.release_date).getFullYear()} • {movie.genres.slice(0,2).map(genre => genre.name).join(" | ")}
            </p>

            <div className='flex items-center justify-between mt-4 pb-2'>
                <button className='px-5 py-2 text-xs bg-red-400 text-white rounded-full font-bold cursor-pointer'>
                    Buy Tickets
                </button>
                <p className='flex items-center gap-1 text-sm font-bold'>
                    <StarIcon className='w-4 h-4 text-red-400 fill-red-400' />
                    {movie.vote_average.toFixed(1)}
                </p>
            </div>
        </div>
    );
};

export default MovieCard;