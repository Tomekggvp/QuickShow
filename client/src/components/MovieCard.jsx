import { StarIcon, Heart } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles'; 
import { useFavorites } from '../hooks/useFavorites'; 

const MovieCard = ({ movie }) => {
    const navigate = useNavigate();
    const theme = useTheme(); 
    const isDark = theme.palette.mode === 'dark';

    const { toggleFavorite, isLiked } = useFavorites();
    const liked = isLiked(movie._id);

    if (!movie || !movie.backdrop_path) return null;

    const handleLike = (e) => {
        e.stopPropagation(); 
        toggleFavorite(movie._id, movie.title); 
    };

    return (
        <div className={`
            relative flex flex-col justify-between p-3 rounded-2xl hover:-translate-y-2 transition-all duration-300 w-66 shadow-md
            ${isDark ? 'bg-gray-800 text-white' : 'bg-[#afceec3a] text-black '}
        `}>
            
            <button 
                onClick={handleLike}
                className={`absolute top-5 right-5 z-10 p-2 rounded-full transition-all active:scale-90 shadow-lg cursor-pointer ${
                    liked 
                    ? 'bg-red-500 text-white' 
                    : (isDark ? 'bg-gray-900/80 text-white' : 'bg-white/80 text-gray-600')
                }`}
            >
                <Heart size={16} className={`${liked ? 'fill-current' : ''}`} />
            </button>

            <img 
                onClick={() => { navigate(`/movies/${movie._id}`); window.scrollTo(0,0) }} 
                src={movie.backdrop_path} 
                className='rounded-lg h-52 w-full object-cover cursor-pointer' 
                alt={movie.title}
            />

            <p className='font-bold mt-3 truncate'>{movie.title}</p>

            <p className={`text-xs font-medium mt-2 ${isDark ? 'text-gray-400' : 'text-amber-800'}`}>
                {new Date(movie.release_date).getFullYear()} • {movie.genres.slice(0,2).map(g => g.name).join(" | ")}
            </p>

            <div className='flex items-center justify-between mt-4 pb-2'>
                <button 
                    onClick={() => { navigate(`/movies/${movie._id}`); window.scrollTo(0,0) }}
                    className='px-5 py-2 text-xs bg-red-400 text-white rounded-full font-bold cursor-pointer hover:bg-red-500 transition-colors'
                >
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