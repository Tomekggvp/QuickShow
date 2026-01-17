import { ArrowRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BlurCircle from './BlurCircle';
import MovieCard from './MovieCard';
import Loading from './Loading'; 
import { useTheme } from '@mui/material/styles'; 
import tmdb from '../services/tmdb'; 

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

                const [genresRes, moviesRes] = await Promise.all([
                    tmdb.get('/genre/movie/list'),
                    tmdb.get('/movie/now_playing', { params: { page: 1 } })
                ]);

                const genreMap = {};
                if (genresRes.data?.genres) {
                    genresRes.data.genres.forEach(g => {
                        genreMap[g.id] = g.name;
                    });
                }

                const results = moviesRes.data?.results;
                if (results && Array.isArray(results)) {
                    const formattedMovies = results.slice(0, 5).map(movie => ({
                        ...movie,

                        genres: (movie.genre_ids || []).map(id => ({ 
                            name: genreMap[id] || "Movie" 
                        }))
                    }));
                    setMovies(formattedMovies);
                } else {
                    console.warn("No movies found in response");
                }

            } catch (error) {
                console.error("Error loading featured content:", error);
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
                <p className={`${textColor} font-medium text-lg`}>Now Showing</p>
                <button onClick={() => navigate('/movies')} className={`group flex items-center gap-2 text-sm ${textColor} cursor-pointer`}>
                    View All 
                    <ArrowRight className='group-hover:translate-x-0.5 transition w-4.5 h-4.5'/> 
                </button>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 mt-8 justify-items-center'>
                {movies?.length > 0 ? (
                    movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)
                ) : (
                    <p className={textColor}>No movies available at the moment.</p>
                )}
            </div>

            {movies?.length > 0 && (
                <div className='flex justify-center mt-20 text-white'>
                    <button onClick={() => {navigate('/movies'); window.scrollTo(0,0)}}
                        className='px-10 py-3 text-sm bg-red-400 hover:bg-red-300 transition rounded-md font-medium cursor-pointer'>
                        Show more
                    </button>
                </div>
            )}
        </div>
    );
};

export default FeaturedSection;