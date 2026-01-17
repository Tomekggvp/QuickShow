import { StarIcon, Heart } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles'; 
import { useFavorites } from '../hooks/useFavorites'; 

const MovieCard = ({ movie }) => {
    const navigate = useNavigate();
    const theme = useTheme(); 
    const isDark = theme.palette.mode === 'dark';

    const movieId = movie?.id ? String(movie.id) : movie?._id;

    const { toggleFavorite, isLiked } = useFavorites();
    const liked = isLiked(movieId);

    if (!movie) return null;

    const imagePath = movie.backdrop_path?.startsWith('http') 
        ? movie.backdrop_path 
        : (movie.backdrop_path || movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.backdrop_path || movie.poster_path}`
            : 'https://via.placeholder.com/500x281?text=No+Image');

    const handleLike = (e) => {
        e.stopPropagation(); 
        e.preventDefault();
        
        toggleFavorite(movieId, movie.title); 
    };

    return (
        <div 
            onClick={() => { navigate(`/movies/${movieId}`); window.scrollTo(0,0) }} 
            className={`
                relative flex flex-col justify-between p-3 rounded-2xl hover:-translate-y-2 transition-all duration-300 w-66 shadow-md cursor-pointer
                ${isDark ? 'bg-gray-800 text-white' : 'bg-[#afceec3a] text-black '}
            `}
        >
            {/* Кнопка лайка */}
            <button 
                onClick={handleLike}
                type="button"
                className={`absolute top-5 right-5 z-20 p-2 rounded-full transition-all active:scale-90 shadow-lg cursor-pointer border-none outline-none ${
                    liked 
                    ? 'bg-red-500 text-white' 
                    : (isDark ? 'bg-gray-900/80 text-white' : 'bg-white/80 text-gray-600')
                }`}
            >
                <Heart size={16} className={`${liked ? 'fill-current' : ''}`} />
            </button>

            <img 
                src={imagePath} 
                className='rounded-lg h-52 w-full object-cover bg-gray-200 dark:bg-gray-700' 
                alt={movie.title}
                onError={(e) => { e.target.src = 'https://via.placeholder.com/500x281?text=No+Image' }}
            />

            <p className='font-bold mt-3 truncate'>{movie.title || 'Untitled'}</p>

            <p className={`text-xs font-medium mt-2 ${isDark ? 'text-gray-400' : 'text-amber-800'}`}>
                {movie.release_date ? new Date(movie.release_date).getFullYear() : '2024'} 
                {" • "}
                {movie.genres && Array.isArray(movie.genres) 
                    ? movie.genres.slice(0, 2).map(g => g.name).join(" | ") 
                    : "Movie"}
            </p>

            <div className='flex items-center justify-between mt-4 pb-2'>
                <div
                    className='px-5 py-2 text-xs bg-red-400 text-white rounded-full font-bold hover:bg-red-500 transition-colors'
                >
                    Buy Tickets
                </div>
                <p className='flex items-center gap-1 text-sm font-bold'>
                    <StarIcon className='w-4 h-4 text-red-400 fill-red-400' />
                    {movie.vote_average ? movie.vote_average.toFixed(1) : '0.0'}
                </p>
            </div>
        </div>
    );
};

export default MovieCard;