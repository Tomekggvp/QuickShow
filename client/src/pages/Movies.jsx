import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import MovieCard from '../components/MovieCard';
import BlurCircle from '../components/BlurCircle';
import Loading from '../components/Loading'; 
import kinopoisk from '../services/kinopoisk';

const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const searchQuery = searchParams.get('search') || '';
  const initialPage = Number(searchParams.get('page')) || 1;

  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const lastMovieRef = useRef(null);

  const fetchMovies = useCallback(async (pageNum, isAppend, query = '') => {
    try {
      if (isAppend) setIsFetchingMore(true);
      else setIsLoading(true);

      let response;
      
      if (query) {
   
        response = await kinopoisk.get('/films', {
          params: {
            keyword: query,
            page: pageNum
          }
        });
      } else {

        response = await kinopoisk.get('/films/collections', { 
          params: { 
            type: 'TOP_POPULAR_ALL', 
            page: pageNum 
          } 
        });
      }


      const results = response.data?.items || response.data?.films || [];
      
      const processedMovies = results.map(movie => ({
        id: movie.kinopoiskId || movie.filmId,
        title: movie.nameRu || movie.nameEn,
        poster_path: movie.posterUrlPreview,
        vote_average: movie.ratingKinopoisk || movie.rating,
        release_date: movie.year,
        genres: movie.genres 
      }));

      if (isAppend) {
        setMovies(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const newMovies = processedMovies.filter(m => !existingIds.has(m.id));
          return [...prev, ...newMovies];
        });
      } else {
        setMovies(processedMovies);
      }
      
      setTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      console.error("Movies fetch error:", error);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchMovies(1, false, searchQuery);
  }, [searchQuery, fetchMovies]);

  useEffect(() => {
    if (page > 1 && !isFetchingMore && movies.length > 0) {
      setTimeout(() => {
        lastMovieRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  }, [movies.length, isFetchingMore, page]); 

  const handleShowMore = () => {
    if (page < totalPages && !isFetchingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      
      const newParams = { page: nextPage };
      if (searchQuery) newParams.search = searchQuery;
      setSearchParams(newParams); 

      fetchMovies(nextPage, true, searchQuery);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className='relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 min-h-[80vh]'>
      <BlurCircle top='150px' left='0px'/>
      <BlurCircle bottom='50px' right='50px'/>
      
      <div className='flex justify-between items-center mb-12'>
        <h1 className='text-2xl font-bold text-black dark:text-white transition-colors duration-300'>
          {searchQuery ? `Результаты поиска: "${searchQuery}"` : "Сейчас в прокате"}
        </h1>
      </div>

      {movies.length > 0 ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 justify-items-center'>
          {movies.map((movie, index) => {
        
            const isFirstInNewBatch = index === movies.length - processedMoviesCount(searchQuery); 

            return (
              <motion.div
                key={`${movie.id}-${index}`}
                ref={isFirstInNewBatch ? lastMovieRef : null} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <MovieCard movie={movie} />
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className='text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-neutral-200 dark:border-neutral-800'>
          <p className='text-neutral-500 text-xl font-medium'>Ничего не найдено по вашему запросу</p>
        </div>
      )}

      {page < totalPages && (
        <div className='flex flex-col items-center mt-20'>
          <button 
            onClick={handleShowMore}
            disabled={isFetchingMore}
            className='px-12 py-4 bg-red-400 hover:bg-red-500 text-white rounded-full font-bold shadow-xl transition-all active:scale-95 disabled:bg-gray-400 cursor-pointer min-w-[200px]'
          >
            {isFetchingMore ? "Загрузка..." : "Показать еще"}
          </button>
        </div>
      )}
    </div>
  );
};

const processedMoviesCount = (query) => {
  
    return 20;
}

export default Movies;