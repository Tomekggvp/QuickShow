import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MovieCard from '../components/MovieCard';
import BlurCircle from '../components/BlurCircle';
import Loading from '../components/Loading'; 
import tmdb from '../services/tmdb'; 

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const lastMovieRef = useRef(null);

  const fetchGenres = async () => {
    try {
      const response = await tmdb.get('/genre/movie/list');
      const genreMap = {};
      response.data.genres.forEach(g => { genreMap[g.id] = g.name; });
      setGenres(genreMap);
    } catch (error) { console.error(error); }
  };

  const fetchMovies = async (pageNum = 1, append = false) => {
    try {
      if (append) setIsFetchingMore(true);
      else setIsLoading(true);

      const response = await tmdb.get('/movie/now_playing', { params: { page: pageNum } });

      const processedMovies = response.data.results.map(movie => ({
        ...movie,
        genres: movie.genre_ids.map(id => ({ name: genres[id] || "Movie" }))
      }));

      if (append) {
        setMovies(prev => [...prev, ...processedMovies]);
      } else {
        setMovies(processedMovies);
      }
      
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => { fetchGenres(); }, []);

  useEffect(() => {
    if (Object.keys(genres).length > 0) fetchMovies(1, false);
  }, [genres]);

  useEffect(() => {
    if (page > 1 && !isFetchingMore) {

      lastMovieRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }, [movies.length]); 

  const handleShowMore = () => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
      fetchMovies(page + 1, true);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className='relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 min-h-[80vh]'>
      <BlurCircle top='150px' left='0px'/>
      <BlurCircle bottom='50px' right='50px'/>
      
      <div className='flex justify-between items-center mb-12'>
        <h1 className='text-2xl font-bold'>Now Showing</h1>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 justify-items-center'>
        {movies.map((movie, index) => {
 
          const isFirstInNewBatch = index === movies.length - 20; 

          return (
            <motion.div
              key={`${movie.id}-${index}`}
              ref={isFirstInNewBatch ? lastMovieRef : null} 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <MovieCard movie={movie} />
            </motion.div>
          );
        })}
      </div>


      <div className="h-1" />

      {page < totalPages && (
        <div className='flex flex-col items-center mt-20'>
          <button 
            onClick={handleShowMore}
            disabled={isFetchingMore}
            className='px-12 py-4 bg-red-400 hover:bg-red-500 text-white rounded-full font-bold shadow-xl transition-all active:scale-95 disabled:bg-gray-400'
          >
            {isFetchingMore ? "Loading..." : "Show More Movies"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Movies;