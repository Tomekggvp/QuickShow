import { ArrowRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BlurCircle from './BlurCircle';
import MovieCard from './MovieCard';
import Loading from './Loading'; 
import { useTheme } from '@mui/material/styles'; 
import kinopoisk from '../services/kinopoisk'; 

const FeaturedSection = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const textColor = isDark ? 'text-gray-300' : 'text-black';

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                
                const response = await kinopoisk.get('/films/collections', {
                    params: { type: 'TOP_POPULAR_ALL', page: 1 }
                });

               
                const formattedMovies = (response.data.items || []).slice(0, 5).map(movie => ({
                    id: movie.kinopoiskId,
                    title: movie.nameRu || movie.nameEn,
                    poster_path: movie.posterUrlPreview, 
                    vote_average: movie.ratingKinopoisk || 0,
                    release_date: movie.year,
                    genres: (movie.genres || []).slice(0, 2) 
                }));

                setMovies(formattedMovies);
            } catch (error) {
                console.error("Error loading Kinopoisk content:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) return <div className='py-20'><Loading /></div>;

    return (
        <div className='px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden'>
            <div className='relative flex items-center justify-between pt-20 pb-10'>
                <BlurCircle top='0' right='-80px' />
                <p className={`${textColor} font-medium text-lg`}>Сейчас в тренде</p>
                <button onClick={() => navigate('/movies')} className={`group flex items-center gap-2 text-sm ${textColor} cursor-pointer`}>
                    Смотреть все 
                    <ArrowRight className='group-hover:translate-x-0.5 transition w-4.5 h-4.5'/> 
                </button>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 mt-8 justify-items-center'>
                {movies.length > 0 ? (
                    movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)
                ) : (
                    <p className={textColor}>Фильмы не найдены.</p>
                )}
            </div>

            <div className='flex justify-center mt-20 text-white'>
                <button onClick={() => {navigate('/movies'); window.scrollTo(0,0)}}
                    className='px-10 py-3 text-sm bg-red-400 hover:bg-red-300 transition rounded-md font-medium cursor-pointer'>
                    Показать больше
                </button>
            </div>
        </div>
    );
};

export default FeaturedSection;