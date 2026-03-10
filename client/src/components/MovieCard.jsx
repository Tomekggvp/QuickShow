import { StarIcon, Heart } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles'; 
import { useFavorites } from '../hooks/useFavorites'; 
import { motion } from 'framer-motion';

const MovieCard = ({ movie }) => {
    const navigate = useNavigate();
    const theme = useTheme(); 
    const isDark = theme.palette.mode === 'dark';

    const movieId = movie?.id ? String(movie.id) : movie?._id;
    const { toggleFavorite, isLiked } = useFavorites();
    const liked = isLiked(movieId);

    if (!movie) return null;

    const imagePath = movie.poster_path || 'https://via.placeholder.com/500x750?text=No+Image';

    const handleLike = (e) => {
        e.stopPropagation(); 
        e.preventDefault();
        toggleFavorite(movieId, movie.title); 
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{ y: -10 }}
            transition={{ duration: 0.4 }}
            onClick={() => { navigate(`/movies/${movieId}`); window.scrollTo(0,0) }} 
            className={`
                relative flex flex-col justify-between p-3 rounded-2xl transition-shadow duration-300 w-64 shadow-md cursor-pointer
                ${isDark ? 'bg-gray-800 text-white hover:shadow-2xl hover:shadow-black/50' : 'bg-[#afceec3a] text-black hover:shadow-xl hover:shadow-gray-300'}
            `}
        >
            <motion.button 
                whileTap={{ scale: 0.8 }}
                onClick={handleLike}
                className={`absolute top-5 right-5 z-20 p-2 rounded-full shadow-lg border-none outline-none cursor-pointer ${
                    liked ? 'bg-red-500 text-white' : (isDark ? 'bg-gray-900/80 text-white' : 'bg-white/80 text-gray-600')
                }`}
            >
                <Heart size={16} className={`${liked ? 'fill-current' : ''}`} />
            </motion.button>

            <div className="overflow-hidden rounded-lg h-52 w-full">
                <motion.img 
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    src={imagePath} 
                    className='h-full w-full object-cover bg-gray-200' 
                    alt={movie.title}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/500x750?text=No+Image' }}
                />
            </div>

            <p className='font-bold mt-3 truncate'>{movie.title || 'Untitled'}</p>

            <p className={`text-xs font-medium mt-1 ${isDark ? 'text-gray-400' : 'text-amber-800'}`}>
                {movie.release_date || '2024'} • {movie.genres?.slice(0,2).map(g => g.name || g.genre).join(" | ") || "Movie"}
            </p>

            <div className='flex items-center justify-between mt-4 pb-2'>
                <motion.div
                    whileHover={{ scale: 1.05, backgroundColor: '#ef4444' }}
                    className='px-5 py-2 text-xs bg-red-400 text-white rounded-full font-bold transition-colors'
                >
                   Купить билет
                </motion.div>
                <p className='flex items-center gap-1 text-sm font-bold'>
                    <StarIcon className='w-4 h-4 text-red-400 fill-red-400' />
                    {movie.vote_average ? Number(movie.vote_average).toFixed(1) : '0.0'}
                </p>
            </div>
        </motion.div>
    );
};

export default MovieCard;