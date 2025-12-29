import React from 'react';
import { useSelector, useDispatch } from 'react-redux'; 
import { setCurrentTrailer } from '../action/trailerActions'; 
import { dummyTrailers } from '../assets/assets';
import ReactPlayer from 'react-player';
import BlurCircle from './BlurCircle';
import { PlayCircleIcon } from 'lucide-react';
import { useTheme } from '@mui/material/styles'; // 1. Импортируем хук темы

const TrailerSection = () => {
  const dispatch = useDispatch();
  const theme = useTheme(); // 2. Получаем доступ к теме
  
  // Проверяем, темная ли сейчас тема
  const isDark = theme.palette.mode === 'dark';

  // Получаем текущий трейлер из Redux Store
  const currentTrailer = useSelector((state) => state.trailer.currentTrailer);

  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden'>
      {/* 3. Меняем класс цвета в зависимости от темы */}
      <p className={`${isDark ? 'text-gray-300' : 'text-black'} font-medium text-lg max-w-[960px]`}>
        Trailers
      </p>

      <div className='relative mt-6'>
        <BlurCircle top='-100px' right='-100px' />
        <ReactPlayer 
          src={currentTrailer.videoUrl} // Исправлено: ReactPlayer использует url вместо src
          controls={false} 
          className='mx-auto max-w-full' 
          width="100%" // Сделал адаптивным (был фиксированный px)
          style={{ maxWidth: '960px' }}
          height="540px"
        />
      </div>

      <div className='group grid grid-cols-4 gap-4 md:gap-8 mt-8 max-w-3x1 mx-auto'>
        {dummyTrailers.map((trailer) => (
          <div 
            key={trailer.image} 
            className='relative group-hover:not-hover:opacity-50 hover:-translate-y-1 duration-300 transition max-md:h-60 md:max-h-60 cursor-pointer' 
            onClick={() => dispatch(setCurrentTrailer(trailer))}
          >
            <img src={trailer.image} alt="trailer" className='rounded-lg w-full h-full object-cover brightness-75'/>
            {/* Иконку тоже можно подкрасить, если нужно, чтобы она всегда была видна */}
            <PlayCircleIcon strokeWidth={1.6} className='absolute top-1/2 left-1/2 w-5 md:w-8 h-5 md:h-12 transform -translate-x-1/2 -translate-y-1/2 text-white' />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrailerSection;