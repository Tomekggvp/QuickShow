import React, { useState, useMemo, useEffect } from 'react'
import BlurCircle from './BlurCircle'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const DateSelect = ({ id }) => {
    const navigate = useNavigate()
    
    const availableDates = useMemo(() => {
        const dates = [];
        const today = new Date();
        
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(today.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            dates.push(dateStr);
        }
        return dates;
    }, []);

    const [selected, setSelected] = useState(availableDates[0])

    const onBookHandler = () => {
        if (!selected) {
            return toast.error('Пожалуйста, выберите дату')
        }

        navigate(`/movies/${id}/${selected}`)
        window.scrollTo(0, 0)
    }

    return (
        <div id='dateSelect' className='pt-30'>
            <div className='flex flex-col lg:flex-row items-center justify-between gap-10 relative p-8 bg-red-400/5 border border-red-400/20 rounded-2xl overflow-hidden'>
                <BlurCircle top='-100px' left='-100px' />
                <BlurCircle top='100px' right='0px' />

                <div className='w-full overflow-hidden'>
                    <p className='text-xl font-bold mb-6 text-black dark:text-white flex items-center gap-2'>
                        <span className='w-2 h-6 bg-red-400 rounded-full inline-block'></span>
                        Выберите дату
                    </p>
                    
                    <div className='relative flex items-center group'>
                        <div className='flex gap-3 overflow-x-auto pb-6 custom-scrollbar scroll-smooth'>
                            {availableDates.map((dateStr, index) => {
                                const dateObj = new Date(dateStr);
                                const day = dateObj.getDate();
                                const month = dateObj.toLocaleDateString("ru-RU", { month: "short" });
                                const weekday = dateObj.toLocaleDateString("ru-RU", { weekday: "short" });
                                const isToday = index === 0;

                                return (
                                    <button 
                                        key={dateStr}
                                        onClick={() => setSelected(dateStr)} 
                                        className={`flex flex-col items-center justify-center min-w-[70px] h-24 rounded-2xl transition-all duration-300 cursor-pointer shrink-0 border-2
                                            ${selected === dateStr 
                                                ? "bg-red-400 border-red-400 text-white shadow-lg shadow-red-400/30 scale-105" 
                                                : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-red-400/50"
                                            }`}
                                    >
                                        <span className={`text-[10px] uppercase font-bold mb-1 ${selected === dateStr ? "text-white/80" : "text-red-400"}`}>
                                            {isToday ? "Сегодня" : weekday}
                                        </span>
                                        <span className='text-2xl font-black leading-none'>{day}</span>
                                        <span className='text-[11px] font-medium uppercase mt-1'>{month}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <button 
                    onClick={onBookHandler} 
                    className='w-full lg:w-auto bg-red-400 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-red-500 transition-all shadow-xl shadow-red-400/20 active:scale-95 cursor-pointer shrink-0'
                >
                    Купить билет
                </button>
            </div>
        </div>
    )
}

export default DateSelect