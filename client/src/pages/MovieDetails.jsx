import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { dummyDateTimeData } from '../assets/assets'; 
import BlurCircle from '../components/BlurCircle';
import { Heart, PlayCircleIcon, StarIcon, Image as ImageIcon, Clapperboard, X } from 'lucide-react';
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
  const framesScrollRef = useRef(null);

  const { toggleFavorite, isLiked } = useFavorites();
  const liked = isLiked(id);

  const [show, setShow] = useState(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState(null);

  const getMovieData = async () => {
    try {
      setShow(null);
      const numericId = Number(id);

      const [movieRes, staffRes, videoRes, boxOfficeRes, imagesRes] = await Promise.all([
        kinopoisk.get(`/films/${numericId}`),
        kinopoisk.get(`https://kinopoiskapiunofficial.tech/api/v1/staff?filmId=${numericId}`),
        kinopoisk.get(`/films/${numericId}/videos`),
        kinopoisk.get(`/films/${numericId}/box_office`),
        kinopoisk.get(`/films/${numericId}/images?type=STILL&page=1`)
      ]);

      const movieData = movieRes.data;
      const staffData = Array.isArray(staffRes.data) ? staffRes.data : [];
      const boxOfficeData = boxOfficeRes.data?.items || [];
      const framesData = imagesRes.data?.items || [];

      const getStaffByRole = (roleKey, limit = 3) => {
        return staffData
          .filter(person => person.professionKey === roleKey)
          .slice(0, limit)
          .map(person => person.nameRu || person.nameEn)
          .join(', ') || '—';
      };

      const budgetObj = boxOfficeData.find(item => item.type === 'BUDGET');
      const worldBoxOfficeObj = boxOfficeData.find(item => item.type === 'WORLD');

      const findBestTrailer = (videos, movie) => {
        const officialYT = videos.find(v => 
          (v.type === 'TRAILER' || v.type === 'TEASER') && 
          (v.site?.toLowerCase() === 'youtube' || v.url?.includes('youtube.com') || v.url?.includes('youtu.be'))
        );

        let finalUrl = '';
        if (officialYT) {
          finalUrl = officialYT.url;
        } else {
          const query = encodeURIComponent(`${movie.nameRu || movie.nameEn} трейлер`);
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

      const adaptedMovie = {
        title: movieData.nameRu || movieData.nameEn || 'Без названия',
        original_language: movieData.countries?.[0]?.country || 'Неизвестно',
        vote_average: movieData.ratingKinopoisk || movieData.ratingImdb || 0,
        overview: movieData.description || 'Описание отсутствует.',
        runtime: movieData.filmLength || 0,
        release_date: movieData.year ? String(movieData.year) : '—',
        poster_path: movieData.posterUrl,
        genres: movieData.genres || [],
        trailer_url: findBestTrailer(videoRes.data?.items || [], movieData),
        is_embeddable: true,
        
        director: getStaffByRole('DIRECTOR', 1),
        writer: getStaffByRole('WRITER', 2),
        producer: getStaffByRole('PRODUCER', 2),
        operator: getStaffByRole('OPERATOR', 1),
        composer: getStaffByRole('COMPOSER', 1),

        budget: budgetObj ? `${budgetObj.amount.toLocaleString()} ${budgetObj.symbol}` : '—',
        boxOfficeWorld: worldBoxOfficeObj ? `${worldBoxOfficeObj.amount.toLocaleString()} ${worldBoxOfficeObj.symbol}` : '—',
        premiereWorld: movieData.premiereWorld || movieData.year || '—',

        frames: framesData.map(img => img.imageUrl),

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

  
  const renderClickableNames = (namesString) => {
    if (!namesString || namesString === '—') return '—';
    
    return namesString.split(', ').map((name, index, array) => (
      <React.Fragment key={index}>
        <a 
          href={`https://ru.wikipedia.org/wiki/${encodeURIComponent(name)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-red-500 transition-colors border-b border-dotted border-gray-500 hover:border-red-500"
        >
          {name}
        </a>
        {index < array.length - 1 && ', '}
      </React.Fragment>
    ));
  };

  const InfoRow = ({ label, value, color }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-500/10">
      <span className="text-[11px] uppercase tracking-widest opacity-50 font-bold">{label}</span>
      <span className={`text-[13px] font-medium text-right ml-4 ${color || ''}`}>{value}</span>
    </div>
  );

  return show ? (
    <div className={`px-6 md:px-16 lg:px-40 pt-30 md:pt-44 pb-20 ${isDark ? 'text-white' : 'text-black'}`}>
      
      {selectedFrame && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedFrame(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white hover:text-red-500 transition-colors z-[110]"
            onClick={() => setSelectedFrame(null)}
          >
            <X size={40} />
          </button>
          
          <img 
            src={selectedFrame} 
            className="max-w-full max-h-full rounded-xl shadow-2xl object-contain animate-in zoom-in duration-300"
            alt="Full Frame"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <VideoModal 
        isOpen={isVideoOpen} 
        onClose={() => setIsVideoOpen(false)} 
        videoUrl={show.movie.trailer_url} 
      />

      <div className='flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto'>
        <img 
          src={show.movie.poster_path} 
          alt={show.movie.title} 
          className='max-lg:mx-auto rounded-2xl h-[500px] w-full md:max-w-[350px] object-cover shadow-2xl' 
        />

        <div className='relative flex flex-col flex-1 gap-4'>
          <BlurCircle top='-50px' left='-50px' />
          
          <p className='text-red-500 font-bold uppercase text-xs tracking-[0.2em]'>
            {show.movie.original_language}
          </p>

          <h1 className='text-5xl font-black leading-tight tracking-tight'>{show.movie.title}</h1>
          
          <div className='flex items-center gap-4 my-2'>
            <div className="flex items-center gap-2">
                <StarIcon className='w-6 h-6 text-red-500 fill-red-500' />
                <span className="font-black text-2xl">{show.movie.vote_average}</span>
            </div>
            <div className="h-6 w-[1px] bg-gray-500/20"></div>
            <p className='text-sm opacity-60 font-medium'>
                {show.movie.genres.map(g => g.genre).join(", ")} • {show.movie.release_date}
            </p>
          </div>

          <p className='text-[15px] opacity-70 leading-relaxed max-w-2xl italic'>
            {show.movie.overview}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 mt-6">
             <div>
                {/* Используем функцию для Режиссера и Сценариста */}
                <InfoRow label="Режиссер" value={renderClickableNames(show.movie.director)} />
                <InfoRow label="Сценарий" value={renderClickableNames(show.movie.writer)} />
                <InfoRow label="Бюджет" value={show.movie.budget} color="text-red-400" />
             </div>
             <div>
                <InfoRow label="Сборы" value={show.movie.boxOfficeWorld} color="text-green-500" />
                <InfoRow label="Премьера" value={show.movie.premiereWorld} />
                <InfoRow label="Длительность" value={timeFormat(show.movie.runtime)} />
             </div>
          </div>

          <div className='flex items-center flex-wrap gap-4 mt-8'>
            <button 
              onClick={() => setIsVideoOpen(true)} 
              className='flex items-center gap-2 px-8 py-4 bg-gray-800 hover:bg-black transition rounded-xl font-bold text-white shadow-lg active:scale-95'
            >
              <PlayCircleIcon className='w-5 h-5' /> Трейлер
            </button>
            
            <a href="#dateSelect" className='px-10 py-4 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-600/30 hover:bg-red-500 transition-all active:scale-95'>
              Купить билеты
            </a>
            
            <button 
              onClick={() => toggleFavorite(id, show.movie.title)}
              className={`p-4 rounded-xl transition-all border ${liked ? 'bg-red-500/10 border-red-500/50' : 'bg-gray-500/10 border-gray-500/20'}`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'text-red-500 fill-red-500' : 'opacity-50'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* КАДРЫ ИЗ ФИЛЬМА */}
      {show.movie.frames.length > 0 && (
        <div className="mt-24">
          <div className="flex items-center gap-3 mb-8">
              <ImageIcon className="text-red-500 w-5 h-5" />
              <h2 className='text-xl font-black uppercase tracking-widest'>Кадры из фильма</h2>
          </div>
          <div 
            ref={framesScrollRef}
            className='flex overflow-x-auto custom-scrollbar gap-6 pb-6 snap-x'
          >
            {show.movie.frames.map((url, index) => (
              <div 
                key={index} 
                className="min-w-[300px] md:min-w-[450px] h-[200px] md:h-[280px] rounded-2xl overflow-hidden shadow-xl snap-center border border-white/5 cursor-zoom-in"
                onClick={() => setSelectedFrame(url)}
              >
                 <img 
                    src={url} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
                    alt={`Frame ${index}`}
                 />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Актерский состав */}
      <div className="mt-24">
        <div className="flex items-center gap-3 mb-8">
            <Clapperboard className="text-red-500 w-5 h-5" />
            <h2 className='text-xl font-black uppercase tracking-widest'>Актерский состав</h2>
        </div>
        <div 
          ref={castScrollRef}
          className='flex overflow-x-auto custom-scrollbar gap-10 pb-6 snap-x'
        >
          {show.movie.casts.map((cast, index) => (
            <a 
              key={index} 
              href={`https://ru.wikipedia.org/wiki/${encodeURIComponent(cast.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className='flex flex-col items-center text-center min-w-[100px] snap-center group cursor-pointer'
            >
              <div className="w-24 h-24 rounded-full overflow-hidden mb-4 shadow-lg border-2 border-transparent group-hover:border-red-500 transition-all">
                <img 
                  src={cast.profile_path || 'https://via.placeholder.com/200x200'} 
                  className='w-full h-full object-cover' 
                  alt={cast.name} 
                />
              </div>
              <p className='font-bold text-[10px] uppercase tracking-wider opacity-60 group-hover:opacity-100 transition-all'>
                {cast.name}
              </p>
            </a>
          ))}
        </div>
      </div>

      <div id="dateSelect" className="mt-20">
        <DateSelect dateTime={show.dateTime} id={id} />
      </div>

      <div className='flex justify-center mt-28'>
        <button 
          onClick={() => { navigate('/movies'); window.scrollTo(0, 0) }} 
          className='px-12 py-4 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-xl font-black uppercase text-xs tracking-widest active:scale-95'
        >
          Вернуться к каталогу
        </button>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default MovieDetails;