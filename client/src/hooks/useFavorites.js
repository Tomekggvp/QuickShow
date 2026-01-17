import { useUser } from '@clerk/clerk-react';
import { useTheme } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const useFavorites = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [localFavorites, setLocalFavorites] = useState([]);

  useEffect(() => {
    if (isLoaded && user?.unsafeMetadata?.favorites) {
      setLocalFavorites(user.unsafeMetadata.favorites);
    }
  }, [user?.unsafeMetadata?.favorites, isLoaded]);

  const isLiked = (movieId) => {
    return localFavorites.includes(String(movieId));
  };

  const toggleFavorite = async (movieId, movieTitle = "Movie") => {
    if (!isSignedIn) {
      toast.error('Please log in to add favorites', {
        style: {
          borderRadius: '10px',
          background: isDark ? '#333' : '#fff',
          color: isDark ? '#fff' : '#333',
        },
        icon: '🔒',
      });
      return;
    }

    const idStr = String(movieId);
    const alreadyLiked = localFavorites.includes(idStr);
    
    const newFavorites = alreadyLiked
      ? localFavorites.filter((id) => id !== idStr)
      : [...localFavorites, idStr];
    
    setLocalFavorites(newFavorites);


    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          favorites: newFavorites,
        },
      });

      toast.success(alreadyLiked ? `Removed ${movieTitle}` : `${movieTitle} added!`, {
        duration: 2000,
        position: 'bottom-right'
      });
    } catch (error) {

      setLocalFavorites(localFavorites);
      toast.error('Failed to update favorites');
      console.error(error);
    }
  };

  return { 
    toggleFavorite, 
    isLiked, 
    favorites: localFavorites 
  };
};