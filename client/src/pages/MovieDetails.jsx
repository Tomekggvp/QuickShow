import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { dummyDateTimeData } from '../assets/assets'; 
import BlurCircle from '../components/BlurCircle';
import { Heart, PlayCircleIcon, StarIcon } from 'lucide-react';
import timeFormat from '../lib/timeFormat';
import DateSelect from '../components/DateSelect';
import Loading from '../components/Loading';
import { useTheme } from '@mui/material/styles';
import VideoModal from '../components/VideoModal';
import { useFavorites } from '../hooks/useFavorites';
import kinopoisk from '../services/kinopoisk'; 

const MovieDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const castScrollRef = useRef(null);

  const { toggleFavorite, isLiked } = useFavorites();
  const liked = isLiked(id);

  const [show, setShow] = useState(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const getMovieData = async () => {
    try {
      setShow(null);
      const numericId = Number(id);

      const [movieRes, staffRes, videoRes] = await Promise.all([
        kinopoisk.get(`/films/${numericId}`),
        kinopoisk.get(`https://kinopoiskapiunofficial.tech/api/v1/staff?filmId=${numericId}`),
        kinopoisk.get(`/films/${numericId}/videos`)
      ]);

      const movieData = movieRes.data;
      const staffData = Array.isArray(staffRes.data) ? staffRes.data : [];
      const videoData = videoRes.data?.items || [];

      const findBestTrailer = (videos, movie) => {
        const officialYT = videos.find(v => 
          (v.type === 'TRAILER' || v.type === 'TEASER') && 
          (v.site?.toLowerCase() === 'youtube' || v.url?.includes('youtube.com') || v.url?.includes('youtu.be'))
        );

        let finalUrl = '';
        if (officialYT) {
          finalUrl = officialYT.url;
        } else {
          const query = encodeURIComponent(`${movie.nameRu || movie.nameEn} ${movie.year} трейлер`);
          finalUrl = `https://www.youtube.com/results?search_query=${query}`;
        }

        if (finalUrl.includes('youtube.com/watch?v=')) {
          return finalUrl.replace('watch?v=', 'embed/');
        } else if (finalUrl.includes('youtu.be/')) {
          const videoId = finalUrl.split('/').pop();
          return `https://www.youtube.com/embed/${videoId}`;
        }
        return finalUrl;
      };

      const finalTrailerUrl = findBestTrailer(videoData, movieData);

      const adaptedMovie = {
        title: movieData.nameRu || movieData.nameEn || 'Без названия',
        original_language: movieData.countries?.[0]?.country || 'Неизвестно',
        vote_average: movieData.ratingKinopoisk || movieData.ratingImdb || 0,
        overview: movieData.description || 'Описание отсутствует.',
        runtime: movieData.filmLength || 0,
        release_date: movieData.year ? String(movieData.year) : '2024',
        poster_path: movieData.posterUrl,
        genres: movieData.genres || [],
        trailer_url: finalTrailerUrl,
        is_embeddable: finalTrailerUrl.includes('embed'),
        casts: staffData
          .filter(person => person.professionKey === 'ACTOR')
          .slice(0, 15)
          .map(person => ({
            name: person.nameRu || person.nameEn,
            profile_path: person.posterUrl
          }))
      };

      setShow({ movie: adaptedMovie, dateTime: dummyDateTimeData });
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
    }
  };

  useEffect(() => {
    if (id) {
      getMovieData();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [id]);

  return show ? (
    <div className={`px-6 md:px-16 lg:px-40 pt-30 md:pt-50 pb-20 ${isDark ? 'text-white' : 'text-black'}`}>
      
      <VideoModal 
        isOpen={isVideoOpen} 
        onClose={() => setIsVideoOpen(false)} 
        videoUrl={show.movie.trailer_url} 
      />

      <div className='flex flex-col md:flex-row gap-8 max-w-6x1 mx-auto'>
        <img 
          src={show.movie.poster_path} 
          alt={show.movie.title} 
          className='max-md:mx-auto rounded-xl h-104 w-full md:max-w-70 object-cover shadow-lg' 
        />

        <div className='relative flex flex-col gap-3 flex-1'>
          <BlurCircle top='-100px' left='-100px' />
          
          <p className='text-red-500 font-medium uppercase text-sm tracking-widest'>
            {show.movie.original_language}
          </p>

          <h1 className='text-4xl font-semibold leading-tight text-balance'>{show.movie.title}</h1>
          
          <div className='flex items-center gap-2'>
            <StarIcon className='w-5 h-5 text-red-400 fill-red-400' />
            <span className="font-bold text-lg">{show.movie.vote_average}</span> Рейтинг Кинопоиска
          </div>

          <p className='text-sm opacity-80 mt-2 leading-relaxed max-w-xl'>{show.movie.overview}</p>

          <p className='text-sm font-medium opacity-90 mt-2'>
            {timeFormat(show.movie.runtime)} • {show.movie.genres.map(g => g.genre).join(", ")} • {show.movie.release_date}
          </p>

          <div className='flex items-center flex-wrap gap-4 mt-6'>
            {show.movie.trailer_url && (
              <button 
                onClick={() => {
                  if (show.movie.is_embeddable) {
                    setIsVideoOpen(true);
                  } else {
                    window.open(show.movie.trailer_url, '_blank');
                  }
                }} 
                className='flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-black transition rounded-md font-medium cursor-pointer active:scale-95 text-white shadow-md'
              >
                <PlayCircleIcon className='w-5 h-5' /> 
                {show.movie.is_embeddable ? 'Смотреть трейлер' : 'Поиск трейлера'}
              </button>
            )}
            
            <a href="#dateSelect" className='px-10 py-3 text-sm bg-gradient-to-tr from-red-600 to-red-400 text-white rounded-lg font-semibold tracking-wide shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-300 active:scale-95'>
              Купить билеты
            </a>
            
            <button 
              onClick={() => toggleFavorite(id, show.movie.title)}
              className={`p-3 rounded-full transition-all active:scale-95 cursor-pointer ${liked ? 'bg-red-500/20' : (isDark ? 'bg-gray-700' : 'bg-gray-200')}`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'text-red-500 fill-red-500' : (isDark ? 'text-white' : 'text-gray-600')}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-20">
        <p className='text-xl font-bold mb-6'>Актерский состав</p>
        <div 
          ref={castScrollRef}
          className='flex overflow-x-auto custom-scrollbar gap-8 pb-4 snap-x snap-mandatory'
        >
          {show.movie.casts.length > 0 ? (
            show.movie.casts.map((cast, index) => (
              <a 
                key={index}
                href={`https://www.google.com/search?q=${encodeURIComponent(cast.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className='flex flex-col items-center text-center min-w-[100px] snap-center group cursor-pointer'
              >
                <div className="w-20 h-20 rounded-full overflow-hidden shadow-md border-2 border-transparent group-hover:border-red-400 transition-all duration-300">
                  <img 
                    src={cast.profile_path || 'https://via.placeholder.com/200x200?text=Нет+фото'} 
                    className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300' 
                    alt={cast.name} 
                  />
                </div>
                <p className='font-medium text-[11px] md:text-xs mt-3 line-clamp-2 leading-tight uppercase tracking-tighter group-hover:text-red-500 transition-colors'>
                  {cast.name}
                </p>
              </a>
            ))
          ) : (
            <p className='opacity-60'>Информация об актерах не найдена.</p>
          )}
          <div className="min-w-[50px]"></div>
        </div>
      </div>

      <div id="dateSelect" className="mt-16">
        <DateSelect dateTime={show.dateTime} id={id} />
      </div>

      <div className='flex justify-center mt-20 mb-10'>
        <button 
          onClick={() => { navigate('/movies'); window.scrollTo(0, 0) }} 
          className='px-12 py-3 border-2 border-red-400 text-red-400 hover:bg-red-400 hover:text-white transition-all rounded-full font-bold active:scale-95 cursor-pointer'
        >
          Назад к фильмам
        </button>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default MovieDetails;