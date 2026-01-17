import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { dummyDateTimeData } from '../assets/assets'; 
import BlurCircle from '../components/BlurCircle';
import { Heart, PlayCircleIcon, StarIcon } from 'lucide-react';
import timeFormat from '../lib/timeFormat';
import DateSelect from '../components/DateSelect';
import MovieCard from '../components/MovieCard';
import Loading from '../components/Loading';
import { useTheme } from '@mui/material/styles';
import VideoModal from '../components/VideoModal';
import { useFavorites } from '../hooks/useFavorites';
import tmdb from '../services/tmdb'; 

const MovieDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const castScrollRef = useRef(null);

  const { toggleFavorite, isLiked } = useFavorites();
  const liked = isLiked(id);

  const [show, setShow] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const langNames = new Intl.DisplayNames(['en'], { type: 'language' });

  const handleWheel = (e) => {
    if (castScrollRef.current) {
      if (e.deltaY !== 0) {
        castScrollRef.current.scrollLeft += e.deltaY;
      }
    }
  };

  const getMovieData = async () => {
    try {
      setShow(null);
      const [movieRes, genresRes] = await Promise.all([
        tmdb.get(`/movie/${id}`, { params: { append_to_response: 'credits,videos', _t: Date.now() } }),
        tmdb.get('/genre/movie/list')
      ]);

      const movieData = movieRes.data;
      const genreMap = {};
      genresRes.data.genres.forEach(g => { genreMap[g.id] = g.name; });

      let rawRecs = [];
      const recsRes = await tmdb.get(`/movie/${id}/recommendations`, { params: { _t: Date.now() } });
      rawRecs = recsRes.data.results;

      if (rawRecs.length === 0) {
        const similarRes = await tmdb.get(`/movie/${id}/similar`);
        rawRecs = similarRes.data.results;
      }

      const adaptedMovie = {
        ...movieData,
        poster_path: movieData.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}` 
            : 'https://via.placeholder.com/500x750?text=No+Poster',
        trailer_url: movieData.videos?.results?.find(v => v.type === 'Trailer')?.key 
          ? `https://www.youtube.com/watch?v=${movieData.videos.results.find(v => v.type === 'Trailer').key}`
          : '',
        casts: movieData.credits.cast
          .filter(c => c.profile_path !== null) 
          .map(c => ({
            name: c.name,
            profile_path: `https://image.tmdb.org/t/p/w200${c.profile_path}`
          }))
      };

      const adaptedRecs = rawRecs.slice(0, 4).map(movie => ({
        ...movie,
        genres: movie.genre_ids.map(gid => ({ name: genreMap[gid] || "Movie" }))
      }));

      setShow({ movie: adaptedMovie, dateTime: dummyDateTimeData });
      setRecommendations(adaptedRecs);
    } catch (error) {
      console.error("Ошибка при получении данных фильма:", error);
    }
  };

  useEffect(() => {
    getMovieData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  return show ? (
    <div className={`px-6 md:px-16 lg:px-40 pt-30 md:pt-50 pb-20 ${isDark ? 'text-white' : 'text-black'}`}>
      
      <VideoModal 
        isOpen={isVideoOpen} 
        onClose={() => setIsVideoOpen(false)} 
        videoUrl={show.movie.trailer_url} 
      />

      {/* Main Movie Info */}
      <div className='flex flex-col md:flex-row gap-8 max-w-6x1 mx-auto'>
        <img src={show.movie.poster_path} alt={show.movie.title} className='max-md:mx-auto rounded-xl h-104 w-full md:max-w-70 object-cover shadow-lg' />

        <div className='relative flex flex-col gap-3 flex-1'>
          <BlurCircle top='-100px' left='-100px' />
          
          <p className='text-red-500 font-medium uppercase text-sm tracking-widest'>
            {show.movie.original_language ? langNames.of(show.movie.original_language) : 'Unknown Language'}
          </p>

          <h1 className='text-4xl font-semibold leading-tight text-balance'>{show.movie.title}</h1>
          
          <div className='flex items-center gap-2'>
            <StarIcon className='w-5 h-5 text-red-400 fill-red-400' />
            <span className="font-bold text-lg">{show.movie.vote_average.toFixed(1)}</span> User Rating
          </div>

          <p className='text-sm opacity-80 mt-2 leading-relaxed max-w-xl'>{show.movie.overview}</p>

          <p className='text-sm font-medium opacity-90 mt-2'>
            {timeFormat(show.movie.runtime)} • {show.movie.genres.map(g => g.name).join(", ")} • {show.movie.release_date.split("-")[0]}
          </p>

          <div className='flex items-center flex-wrap gap-4 mt-6'>
            <button onClick={() => setIsVideoOpen(true)} className='flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-black transition rounded-md font-medium cursor-pointer active:scale-95 text-white shadow-md'>
              <PlayCircleIcon className='w-5 h-5' /> Watch Trailer
            </button>
            
            <a href="#dateSelect" className='px-10 py-3 text-sm bg-gradient-to-tr from-red-600 to-red-400 text-white rounded-lg font-semibold tracking-wide shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-300 active:scale-95'>
              Buy Tickets
            </a>
            
            <button 
              onClick={() => toggleFavorite(id, show.movie.title)}
              className={`p-3 rounded-full transition-all active:scale-95 ${liked ? 'bg-red-500/20' : (isDark ? 'bg-gray-700' : 'bg-gray-200')}`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'text-red-500 fill-red-500' : (isDark ? 'text-white' : 'text-gray-600')}`} />
            </button>
          </div>
        </div>
      </div>

      {/* CAST SECTION WITH CUSTOM SCROLLBAR & WIKIPEDIA LINKS */}
      <div className="mt-20">
        <p className='text-xl font-bold mb-6'>The Cast</p>
        <div 
          ref={castScrollRef}
          onWheel={handleWheel}
          className='flex overflow-x-auto custom-scrollbar gap-8 pb-4 snap-x snap-mandatory'
        >
          {show.movie.casts.map((cast, index) => (
            <a 
              key={index}
              href={`https://en.wikipedia.org/wiki/${encodeURIComponent(cast.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className='flex flex-col items-center text-center min-w-[100px] snap-center group cursor-pointer'
            >
              <div className="w-20 h-20 rounded-full overflow-hidden shadow-md border-2 border-transparent group-hover:border-red-500 transition-all duration-300">
                <img 
                  src={cast.profile_path} 
                  className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300' 
                  alt={cast.name} 
                />
              </div>
              <p className='font-medium text-[11px] md:text-xs mt-3 line-clamp-2 leading-tight uppercase tracking-tighter group-hover:text-red-500 transition-colors'>
                {cast.name}
              </p>
            </a>
          ))}
          <div className="min-w-[50px]"></div>
        </div>
      </div>

      <div id="dateSelect" className="mt-16">
        <DateSelect dateTime={show.dateTime} id={id} />
      </div>

      <div className="mt-24">
        <p className='text-2xl font-bold mb-8'>You May Also Like</p>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 justify-items-center'>
            {recommendations.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
        </div>
      </div>

      <div className='flex justify-center mt-20 mb-10'>
        <button 
          onClick={() => { navigate('/movies'); window.scrollTo(0, 0) }} 
          className='px-12 py-3 border-2 border-red-400 text-red-400 hover:bg-red-400 hover:text-white transition-all rounded-full font-bold active:scale-95'
        >
          See All Movies
        </button>
      </div>

    </div>
  ) : <Loading />
};

export default MovieDetails;