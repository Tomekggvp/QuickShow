import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom'; // 
import { motion } from 'framer-motion';
import MovieCard from '../components/MovieCard';
import BlurCircle from '../components/BlurCircle';
import Loading from '../components/Loading'; 
import kinopoisk from '../services/kinopoisk';

const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  

  const initialPage = Number(searchParams.get('page')) || 1;

  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const lastMovieRef = useRef(null);

  const fetchMovies = useCallback(async (pageNum, isAppend) => {
    try {
      if (isAppend) setIsFetchingMore(true);
      else setIsLoading(true);

      const response = await kinopoisk.get('/films/collections', { 
        params: { 
          type: 'TOP_POPULAR_ALL', 
          page: pageNum 
        } 
      });

      const results = response.data?.items || [];
      const processedMovies = results.map(movie => ({
        id: movie.kinopoiskId,
        title: movie.nameRu || movie.nameEn,
        poster_path: movie.posterUrlPreview,
        vote_average: movie.ratingKinopoisk,
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
    const loadInitialData = async () => {
      if (initialPage > 1) {
       
        setIsLoading(true);
        for (let i = 1; i <= initialPage; i++) {
          await fetchMovies(i, i > 1);
        }
        setIsLoading(false);
      } else {
        fetchMovies(1, false);
      }
    };
    loadInitialData();
  }, []); 

  useEffect(() => {
    if (page > 1 && !isFetchingMore && movies.length > 0) {
      setTimeout(() => {
        lastMovieRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  }, [movies.length, isFetchingMore]); 

  const handleShowMore = () => {
    if (page < totalPages && !isFetchingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      setSearchParams({ page: nextPage }); 
      fetchMovies(nextPage, true);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className='relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 min-h-[80vh]'>
      <BlurCircle top='150px' left='0px'/>
      <BlurCircle bottom='50px' right='50px'/>
      
      <div className='flex justify-between items-center mb-12'>
        <h1 className='text-2xl font-bold text-black dark:text-white'>Сейчас в прокате</h1>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 justify-items-center'>
        {movies.map((movie, index) => {
      
          const isFirstInNewBatch = index === movies.length - 20; 

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

export default Movies;