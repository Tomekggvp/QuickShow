import React from 'react';
import { assets } from '../assets/assets';
import { ArrowRight, CalendarIcon, ClockIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const HeroSection = () => {
    const navigate = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2, delayChildren: 0.3 }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1, 
            transition: { duration: 0.8, ease: "easeOut" } 
        }
    };

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className='relative flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36 bg-[url("/backgroundImage.png")] bg-cover bg-center h-screen'
        >

            <motion.img 
                variants={itemVariants}
                src={assets.marvelLogo} 
                alt='Marvel' 
                className='max-h-11 lg:h-11 mt-20 z-10' 
            />

            <motion.h1 
                variants={itemVariants}
                className='text-5xl md:text-[70px] md:leading-18 font-semibold max-w-110 text-white z-10'
            >
                Guardians <br /> of the Glory
            </motion.h1>

            <motion.div variants={itemVariants} className='flex items-center gap-4 text-white z-10'>
                <span className="opacity-80">Action | Adventure | Sci-Fi</span>
                <div className='flex items-center gap-1'>
                    <CalendarIcon className='w-4.5 h-4.5 text-red-400' /> 2018
                </div>
                <div className='flex items-center gap-1'>
                    <ClockIcon className='w-4.5 h-4.5 text-red-400' /> 2h 8m
                </div>
            </motion.div>

            <motion.p variants={itemVariants} className='max-w-md text-gray-300 z-10 leading-relaxed'>
                В постапокалиптическом мире, где города передвигаются на колесах и пожирают друг друга, чтобы выжить,
                двое людей встречаются в Лондоне и пытаются остановить заговор.
            </motion.p>

            <motion.button 
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/movies')} 
                className='z-10 flex items-center gap-2 px-8 py-3.5 text-sm bg-red-500 hover:bg-red-600 transition-all rounded-full font-medium cursor-pointer text-white shadow-xl shadow-red-500/20'
            >
                Исследуйте фильмы
                <ArrowRight className='w-5 h-5' />
            </motion.button>
        </motion.div>
    );
};

export default HeroSection;