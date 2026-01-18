import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom' 
import Loading from '../components/Loading'
import BlurCircle from '../components/BlurCircle'
import timeFormat from '../lib/timeFormat'
import { Trash2, AlertTriangle, Calendar, Ticket, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY || '$' 
  const { user, isLoaded, isSignedIn } = useUser()
  const navigate = useNavigate() 

  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, bookingId: null })

  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'))

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && user?.unsafeMetadata?.bookings) {
        setBookings(user.unsafeMetadata.bookings)
      }
      setIsLoading(false)
    }

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [isLoaded, isSignedIn, user])

  const formatBookingDate = (item) => {
    try {
      const dateVal = item.show?.date || item.date;
      const timeVal = item.show?.showDateTime || item.showDateTime;

      if (!dateVal) return timeVal || "Дата не указана";

      const [year, month, day] = dateVal.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);

      if (isNaN(dateObj.getTime())) {
        return `${dateVal} ${timeVal || ''}`;
      }

      const displayDate = dateObj.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
      });

      return timeVal ? `${displayDate}, ${timeVal}` : displayDate;
      
    } catch (e) {
      return "Ошибка даты";
    }
  }

  const openDeleteModal = (id) => setDeleteModal({ isOpen: true, bookingId: id });
  const closeDeleteModal = () => setDeleteModal({ isOpen: false, bookingId: null });

  const confirmDelete = async () => {
    const bookingId = deleteModal.bookingId;
    try {
      const updatedBookings = bookings.filter(item => item._id !== bookingId);
      await user.update({ unsafeMetadata: { ...user.unsafeMetadata, bookings: updatedBookings } });
      setBookings(updatedBookings);
      toast.success("Бронирование отменено");
      closeDeleteModal();
    } catch (error) {
      toast.error("Ошибка при удалении");
    }
  }

  const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/500x750?text=No+Poster';
    if (path.startsWith('http')) return path;
    return `https://image.tmdb.org/t/p/w500${path}`;
  }

  if (!isLoaded || isLoading) return <Loading />

  return (
    <div className='relative px-4 md:px-16 lg:px-40 pt-24 md:pt-40 min-h-screen overflow-x-hidden bg-transparent transition-colors duration-300'>
      <BlurCircle top="100px" left='-100px'/>
      <BlurCircle bottom="0" right='-100px'/>
      
      <div className='max-w-4xl mx-auto relative z-10'>
        <h1 className={`text-3xl md:text-4xl font-black mb-10 tracking-tight text-center md:text-left transition-colors duration-300 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
          Бронирования
        </h1>

        {!isSignedIn ? (
          <div className='text-center mt-20 text-neutral-500 font-medium'>
            Войдите в систему для просмотра билетов.
          </div>
        ) : bookings.length > 0 ? (
          <div className='flex flex-col gap-6'>
            {bookings.map((item) => {
              const movieId = item.show?.movie?.id || item.show?.movie?._id;
              const runtime = item.show?.movie?.runtime;
              
              return (
                <div key={item._id} className='flex flex-col md:flex-row bg-white/70 dark:bg-neutral-900/40 border border-neutral-200 dark:border-white/5 rounded-[2rem] overflow-hidden backdrop-blur-md hover:shadow-xl transition-all duration-300 relative'>
                  
                  <button 
                    onClick={() => openDeleteModal(item._id)}
                    className='absolute top-4 right-4 z-10 p-2.5 bg-white/90 dark:bg-neutral-800 text-neutral-400 hover:text-red-500 rounded-full shadow-sm transition-all cursor-pointer'
                  >
                    <Trash2 size={18} />
                  </button>

                  <div 
                    onClick={() => navigate(`/movies/${movieId}`)} 
                    className='w-full md:w-48 h-56 md:h-auto overflow-hidden cursor-pointer group bg-neutral-200 dark:bg-neutral-800'
                  >
                    <img 
                      src={getImageUrl(item.show?.movie?.poster_path)} 
                      alt={item.show?.movie?.title} 
                      className='w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500' 
                    />
                  </div>

                  <div className='flex-1 p-6 flex flex-col justify-between'>
                    <div>
                      <h2 className='text-xl font-bold mb-1 pr-10 text-neutral-900 dark:text-white'>
                        {item.show?.movie?.title}
                      </h2>
                      
                      <p className='flex items-center gap-1.5 text-neutral-500 text-sm mb-4 font-medium'>
                        <Clock size={14} className="text-neutral-400" />
                        {runtime ? timeFormat(runtime) : 'Продолжительность не указана'}
                      </p>
                      
                      <div className='flex flex-wrap gap-3 mb-4'>
                        <div className='flex items-center gap-2 bg-red-400/10 px-3 py-1.5 rounded-xl text-red-500 text-xs font-bold'>
                          <Calendar size={14} />
                          {formatBookingDate(item)}
                        </div>
                        <div className='flex items-center gap-2 bg-blue-400/10 px-3 py-1.5 rounded-xl text-blue-500 text-xs font-bold'>
                          <Ticket size={14} />
                          {item.bookedSeats.length} Билета(ов)
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center justify-between border-t border-neutral-100 dark:border-neutral-700 pt-4'>
                      <div>
                        <p className='text-neutral-400 text-[10px] uppercase font-bold tracking-widest'>Места</p>
                        <p className='font-bold text-neutral-800 dark:text-neutral-200'>
                          {item.bookedSeats.join(", ")}
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='text-2xl font-black text-red-500 leading-none'>{currency}{item.amount}</p>
                        {!item.isPaid && (
                          <button className='mt-2 text-[10px] font-bold text-blue-500 hover:underline cursor-pointer uppercase tracking-wider'>
                            Оплатить сейчас →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className='text-center mt-20 py-20 bg-white/40 dark:bg-white/5 rounded-[2.5rem] border-2 border-dashed border-neutral-200 dark:border-neutral-800'>
            <p className='text-neutral-400 font-bold'>У вас пока нет активных бронирований</p>
          </div>
        )}
      </div>

      {/* MODAL CANCEL */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={closeDeleteModal}></div>
          <div className="relative bg-white dark:bg-neutral-900 rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="text-red-500" size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-neutral-900 dark:text-white">Отменить заказ?</h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-8 leading-relaxed">
                Это действие удалит вашу бронь. Вы уверены?
              </p>
              <div className="flex flex-col gap-3 w-full">
                <button onClick={confirmDelete} className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg transition-all cursor-pointer">
                  Да, отменить
                </button>
                <button onClick={closeDeleteModal} className="w-full py-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-2xl font-bold cursor-pointer">
                  Назад
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyBookings