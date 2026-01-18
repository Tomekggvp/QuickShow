import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { assets, dummyShowsData } from '../assets/assets';
import Loading from '../components/Loading';
import { ArrowRightIcon, ClockIcon, XIcon } from 'lucide-react';
import BlurCircle from '../components/BlurCircle';
import toast from 'react-hot-toast';
import { useAuth, SignIn, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import kinopoisk from '../services/kinopoisk'; 

const SeatLayout = () => {
  const groupRows = [["A", "B"], ["C", "D"], ["E", "F"], ["G", "H"], ["I", "J"]];
  const { id, date } = useParams(); 

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [show, setShow] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  const TG_TOKEN = import.meta.env.VITE_TELEGRAM_TOKEN;
  const TG_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const availableTimes = useMemo(() => {
    const times = ["10:00", "13:00", "16:00", "19:00", "22:00"];
    return times.map(t => ({ time: t }));
  }, [id, date]);

  const getShow = async () => {
    try {
      const response = await kinopoisk.get(`/films/${id}`);
      if (response.data) {
        setShow({
          movie: {
            title: response.data.nameRu || response.data.nameEn,
            id: response.data.kinopoiskId,
            poster_path: response.data.posterUrl,
            runtime: response.data.filmLength
          }
        });
      }
    } catch (error) {
      const foundShow = dummyShowsData.find(s => s._id === id || s.id === Number(id));
      if (foundShow) setShow({ movie: foundShow });
      else toast.error("Фильм не найден");
    }
  };

  const sendTelegramAlert = async (bookingData) => {
    if (!TG_TOKEN || !TG_CHAT_ID) return;

    const message = `
🚀 *Новый заказ!*
--------------------------
🎬 *Фильм:* ${bookingData.show.movie.title}
📅 *Дата:* ${date}
⏰ *Время:* ${bookingData.show.showDateTime}
💺 *Места:* ${bookingData.bookedSeats.join(', ')}
💰 *Сумма:* $${bookingData.amount}
👤 *Email:* ${user?.primaryEmailAddress?.emailAddress || 'Не указан'}
--------------------------
    `;

    try {
      await axios.post(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
        chat_id: TG_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      });
    } catch (error) {
      console.error("Telegram notification failed:", error);
    }
  };

  const handleSeatClick = (seatId) => {
    if (!selectedTime) return toast.error("Сначала выберите время сеанса");
    if (!selectedSeats.includes(seatId) && selectedSeats.length > 4) return toast.error("Максимум 5 мест");
    setSelectedSeats(prev => prev.includes(seatId) ? prev.filter(s => s !== seatId) : [...prev, seatId]);
  };

  const handleProceedToCheckout = async () => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setShowAuthModal(true);
      return;
    }
    if (!selectedTime || selectedSeats.length === 0) return toast.error("Выберите время и места");

    try {

      const newBooking = {
        _id: `ID-${Date.now()}`,
        show: { 
          movie: show.movie, 
          date: date,           
          showDateTime: selectedTime.time 
        },
        amount: selectedSeats.length * 15,
        bookedSeats: selectedSeats,
        isPaid: false,
      };

      const currentBookings = user.unsafeMetadata.bookings || [];
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          bookings: [newBooking, ...currentBookings]
        }
      });

      await sendTelegramAlert(newBooking);

      toast.success("Бронирование подтверждено!");
      navigate('/my-bookings');
      window.scrollTo(0, 0);

    } catch (error) {
      toast.error("Ошибка сохранения бронирования");
      console.error(error);
    }
  };

  useEffect(() => { 
    getShow();
    setSelectedTime(null);
    setSelectedSeats([]);
  }, [id, date]);

  const renderSeats = (row, count = 9) => (
    <div key={row} className='flex gap-1.5 sm:gap-2 mt-1.5'>
      {Array.from({ length: count }, (_, i) => {
        const seatId = `${row}${i + 1}`;
        const isSelected = selectedSeats.includes(seatId);
        return (
          <button
            key={seatId}
            onClick={() => handleSeatClick(seatId)}
            className={`h-7 w-7 sm:h-8 sm:w-8 rounded-md border border-red-400/40 cursor-pointer transition-all text-[9px] sm:text-[10px] font-bold
              ${isSelected ? "bg-red-500 text-white border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]" : `hover:bg-red-400/20 ${isDark ? "text-gray-500" : "text-gray-400"}`}`}
          >
            {seatId}
          </button>
        );
      })}
    </div>
  );

  if (!isLoaded || !show) return <Loading />;

  return (
    <>
      <div className={`flex flex-col md:flex-row px-4 md:px-16 lg:px-40 py-24 md:py-32 min-h-screen transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
        
        {/* Sidebar */}
        <div className={`w-full md:w-64 border rounded-2xl py-6 h-max md:sticky md:top-32 ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
          <p className={`text-lg md:text-xl font-black px-6 mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
            {show.movie.title}
          </p>

          <p className='text-[10px] px-6 text-neutral-500 font-bold uppercase'>Дата: {date}</p>
          <p className='text-[10px] px-6 mb-6 text-red-500 font-bold uppercase tracking-[0.2em]'>Время сеанса</p>
          
          <div className='space-y-1'>
            {availableTimes.map((item) => (
              <div
                key={item.time}
                onClick={() => { setSelectedTime(item); setSelectedSeats([]) }}
                className={`flex items-center gap-3 px-6 py-3.5 cursor-pointer transition-all border-l-4 ${
                  selectedTime?.time === item.time 
                  ? "bg-red-500 border-red-600 text-white shadow-lg" 
                  : `border-transparent hover:bg-white/5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`
                }`}
              >
                <ClockIcon className={`w-4 h-4 ${selectedTime?.time === item.time ? "text-white" : "text-red-500"}`} />
                <p className='font-bold text-sm'>{item.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Seats Grid Section */}
        <div className='relative flex-1 flex flex-col items-center max-md:mt-12 overflow-hidden'>
          <BlurCircle top='-100px' left='100px' />
          <h1 className={`text-2xl md:text-4xl font-black mb-8 tracking-tighter ${isDark ? 'text-white' : 'text-black'}`}>План зала</h1>
          
          <div className='w-full flex flex-col items-center transform scale-[0.85] sm:scale-90 md:scale-100 origin-top'>
             <div className='w-full max-w-md h-1.5 bg-gradient-to-b from-red-500 to-transparent rounded-full mb-2 opacity-80 shadow-[0_-5px_15px_rgba(239,68,68,0.4)]'></div>
             <p className='text-gray-500 text-[8px] font-bold tracking-[0.6em] mb-10 uppercase opacity-60'>Экран</p>

             <div className='flex flex-col items-center gap-1 w-full scrollbar-hide'>
               <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
               {groupRows.map((group, idx) => (
                 <div key={idx} className={`flex flex-col items-center ${idx !== 0 ? 'lg:flex-row lg:gap-8' : ''} mb-3`}>
                   {group.map(row => renderSeats(row))}
                 </div>
               ))}
             </div>
          </div>

          <div className={`flex gap-6 mt-6 md:mt-12 text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
             <div className='flex items-center gap-2'><div className='w-3 h-3 rounded border border-white/20'></div><span>Свободно</span></div>
             <div className='flex items-center gap-2'><div className='w-3 h-3 rounded bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'></div><span>Выбрано</span></div>
          </div>

          <button
            onClick={handleProceedToCheckout}
            className='flex items-center gap-3 mt-12 md:mt-16 px-12 md:px-20 py-4 md:py-5 bg-red-500 hover:bg-red-600 transition-all rounded-full font-black text-white shadow-2xl shadow-red-500/20 active:scale-95 cursor-pointer uppercase tracking-widest text-[10px] md:text-xs'
          >
            Подтвердить заказ
            <ArrowRightIcon className='w-4 h-4 md:w-5 md:h-5' />
          </button>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl max-w-md w-full relative shadow-2xl overflow-hidden border ${isDark ? 'bg-neutral-900 border-white/5' : 'bg-white border-gray-100'}`}>
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
              <h2 className={`text-lg font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-gray-800'}`}>Вход</h2>
              <button onClick={() => setShowAuthModal(false)} className="p-2 hover:bg-white/5 rounded-full transition text-gray-500">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex justify-center scale-90">
              <SignIn redirectUrl={window.location.pathname} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SeatLayout;