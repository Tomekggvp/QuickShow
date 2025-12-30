import { useUser } from '@clerk/clerk-react';
import { useTheme } from '@mui/material/styles';
import toast from 'react-hot-toast';

export const useFavorites = () => {
  const { user, isSignedIn } = useUser();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const isLiked = (movieId) => {
    return user?.unsafeMetadata?.favorites?.includes(String(movieId)) || false;
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
    const currentFavorites = user.unsafeMetadata.favorites || [];
    const alreadyLiked = currentFavorites.includes(idStr);
    
    const newFavorites = alreadyLiked
      ? currentFavorites.filter((id) => id !== idStr)
      : [...currentFavorites, idStr];

    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          favorites: newFavorites,
        },
      });

      if (!alreadyLiked) {
        toast.success(`${movieTitle} added to favorites!`);
      } else {
        toast.success(`Removed from favorites`);
      }
    } catch (error) {
      toast.error('Something went wrong...');
      console.error(error);
    }
  };

  return { toggleFavorite, isLiked, favorites: user?.unsafeMetadata?.favorites || [] };
};