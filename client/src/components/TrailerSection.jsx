import React from 'react';
import { useSelector, useDispatch } from 'react-redux'; 
import { setCurrentTrailer } from '../action/trailerActions'; 
import { dummyTrailers } from '../assets/assets';
import ReactPlayer from 'react-player';
import BlurCircle from './BlurCircle';
import { PlayCircleIcon } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

const TrailerSection = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const currentTrailer = useSelector((state) => state.trailer.currentTrailer);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 40 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-100px" }}
      variants={container}
      className='px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden'
    >

      <motion.p
        variants={item}
        className={`${isDark ? 'text-gray-300' : 'text-black'} font-medium text-lg max-w-[960px]`}
      >
        Трейлеры
      </motion.p>

      <motion.div variants={item} className='relative mt-6'>
        <BlurCircle top='-100px' right='-100px' />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
        >
          <ReactPlayer
            src={currentTrailer.videoUrl}
            controls={false}
            className='mx-auto max-w-full'
            width="100%"
            style={{ maxWidth: '960px' }}
            height="540px"
          />
        </motion.div>
      </motion.div>

      <motion.div
        variants={container}
        className='group grid grid-cols-4 gap-4 md:gap-8 mt-8 max-w-3x1 mx-auto'
      >
        {dummyTrailers.map((trailer) => (
          <motion.div
            variants={item}
            whileHover={{ scale: 1.05, y: -6 }}
            whileTap={{ scale: 0.95 }}
            key={trailer.image}
            className='relative group-hover:not-hover:opacity-50 duration-300 transition max-md:h-60 md:max-h-60 cursor-pointer'
            onClick={() => dispatch(setCurrentTrailer(trailer))}
          >
            <img
              src={trailer.image}
              alt="trailer"
              className='rounded-lg w-full h-full object-cover brightness-75'
            />

            <PlayCircleIcon
              strokeWidth={1.6}
              className='absolute top-1/2 left-1/2 w-5 md:w-8 h-5 md:h-12 transform -translate-x-1/2 -translate-y-1/2 text-white'
            />
          </motion.div>
        ))}
      </motion.div>

    </motion.div>
  );
};

export default TrailerSection;