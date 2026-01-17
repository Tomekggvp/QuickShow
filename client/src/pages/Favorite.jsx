import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react'; 
import { motion, AnimatePresence } from 'framer-motion'; 
import MovieCard from '../components/MovieCard';
import BlurCircle from '../components/BlurCircle';
import Loading from '../components/Loading';
import tmdb from '../services/tmdb';

const Favorite = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, 
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
    exit: { scale: 0.8, opacity: 0 }, 
  };

  useEffect(() => {
    const fetchFavoriteMovies = async () => {
      const favoriteIds = user?.unsafeMetadata?.favorites || [];
      
      if (favoriteIds.length === 0) {
        setFavoriteMovies([]);
        return;
      }

      setIsLoading(true);
      try {
        const moviePromises = favoriteIds.map((id) =>
          tmdb.get(`/movie/${id}`).catch((err) => {
            console.error(`Failed to fetch movie ${id}:`, err);
            return null;
          })
        );

        const responses = await Promise.all(moviePromises);
        const moviesData = responses
          .filter((res) => res !== null)
          .map((res) => res.data);

        setFavoriteMovies(moviesData);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoaded && isSignedIn) {
      fetchFavoriteMovies();
    }
  }, [user?.unsafeMetadata?.favorites, isLoaded, isSignedIn]);

  if (!isLoaded || isLoading) return <Loading />;


  const EmptyState = ({ title, sub }) => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className='flex flex-col items-center justify-center min-h-[60vh] pt-20'
    >
      <h1 className='text-3xl font-bold text-center'>{title}</h1>
      <p className='text-gray-500 mt-2 text-center'>{sub}</p>
    </motion.div>
  );

  if (!isSignedIn) {
    return <EmptyState title="No favorite movies yet" sub="Please log in to your account and start adding movies!" />;
  }

  if (favoriteMovies.length === 0) {
    return <EmptyState title="Your list is empty" sub="You haven't added any movies to your favorites yet." />;
  }

  return (
    <div className='relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]'>
      <BlurCircle top='150px' left='0px'/>
      <BlurCircle bottom='50px' right='50px'/>
      

      <motion.div 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className='flex justify-between items-center mb-12'
      >
        <div>
          <h1 className='text-3xl font-bold'>Your Favorites</h1>
          <p className='text-red-500 text-sm font-medium mt-1 uppercase tracking-wider'>Personal Collection</p>
        </div>
        <motion.span 
          whileHover={{ scale: 1.1 }}
          className='text-sm font-bold text-white bg-red-500 px-4 py-1.5 rounded-full shadow-lg shadow-red-500/20'
        >
          {favoriteMovies.length} {favoriteMovies.length === 1 ? 'Movie' : 'Movies'}
        </motion.span>
      </motion.div>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className='flex flex-wrap max-sm:justify-center gap-10'
      >
        <AnimatePresence mode='popLayout'>
          {favoriteMovies.map((movie) => (
            <motion.div
              layout 
              key={movie.id || movie._id}
              variants={itemVariants}
              whileHover={{ y: -10 }} 
              exit="exit"
            >
              <MovieCard movie={movie} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Favorite;