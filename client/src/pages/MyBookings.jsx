import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom' 
import Loading from '../components/Loading'
import BlurCircle from '../components/BlurCircle'
import timeFormat from '../lib/timeFormat'
import { dateFormat } from '../lib/dateFormat'
import { Trash2, AlertTriangle, X, Calendar, Ticket } from 'lucide-react'
import toast from 'react-hot-toast'

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY || '$' 
  const { user, isLoaded, isSignedIn } = useUser()
  const navigate = useNavigate() 

  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, bookingId: null })

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && user?.unsafeMetadata?.bookings) {
        setBookings(user.unsafeMetadata.bookings)
      }
      setIsLoading(false)
    }
  }, [isLoaded, isSignedIn, user])

  const openDeleteModal = (id) => setDeleteModal({ isOpen: true, bookingId: id });
  const closeDeleteModal = () => setDeleteModal({ isOpen: false, bookingId: null });

  const confirmDelete = async () => {
    const bookingId = deleteModal.bookingId;
    try {
      const updatedBookings = bookings.filter(item => item._id !== bookingId);
      await user.update({ unsafeMetadata: { ...user.unsafeMetadata, bookings: updatedBookings } });
      setBookings(updatedBookings);
      toast.success("Booking cancelled");
      closeDeleteModal();
    } catch (error) {
      toast.error("Failed to delete");
    }
  }

  if (!isLoaded || isLoading) return <Loading />

  return (
    <div className='relative px-4 md:px-16 lg:px-40 pt-24 md:pt-40 min-h-screen overflow-x-hidden bg-transparent'>
      <BlurCircle top="100px" left='-100px'/>
      <BlurCircle bottom="0" right='-100px'/>
      
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-2xl md:text-3xl font-bold mb-8 text-center md:text-left'>My Bookings</h1>

        {!isSignedIn ? (
          <div className='text-center mt-20 text-gray-500'>Please login to see bookings.</div>
        ) : bookings.length > 0 ? (
          <div className='flex flex-col gap-6'>
            {bookings.map((item) => (
              <div key={item._id} className='flex flex-col md:flex-row bg-white/40 dark:bg-gray-800/40 border border-red-400/20 rounded-3xl overflow-hidden backdrop-blur-md hover:shadow-xl transition-all duration-300 relative'>
                
                <button 
                  onClick={() => openDeleteModal(item._id)}
                  className='absolute top-4 right-4 z-10 p-2.5 bg-white/80 dark:bg-gray-900/80 text-gray-400 hover:text-red-500 rounded-full shadow-sm transition-all cursor-pointer'
                >
                  <Trash2 size={18} />
                </button>

                <div 
                  onClick={() => navigate(`/movies/${item.show.movie._id}`)} 
                  className='w-full md:w-48 h-56 md:h-auto overflow-hidden cursor-pointer group'
                >
                  <img 
                    src={item.show.movie.poster_path} 
                    alt={item.show.movie.title} 
                    className='w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-500' 
                  />
                </div>

                <div className='flex-1 p-6 flex flex-col justify-between'>
                  <div>

                    <h2 
                      onClick={() => navigate(`/movies/${item.show.movie._id}`)}
                      className='text-xl font-bold mb-1 pr-10 cursor-pointer hover:text-red-500 transition-colors'
                    >
                      {item.show.movie.title}
                    </h2>
                    <p className='text-gray-500 text-sm mb-4'>{timeFormat(item.show.movie.runtime)}</p>
                    
                    <div className='flex flex-wrap gap-3 mb-4'>
                      <div className='flex items-center gap-2 bg-red-400/10 px-3 py-1.5 rounded-xl text-red-500 text-xs font-bold'>
                        <Calendar size={14} />
                        {dateFormat(item.show.showDateTime)}
                      </div>
                      <div className='flex items-center gap-2 bg-blue-400/10 px-3 py-1.5 rounded-xl text-blue-500 text-xs font-bold'>
                        <Ticket size={14} />
                        {item.bookedSeats.length} Tickets
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4'>
                    <div>
                      <p className='text-gray-400 text-[10px] uppercase tracking-widest'>Seats</p>
                      <p className='font-bold text-gray-800 dark:text-gray-200'>{item.bookedSeats.join(", ")}</p>
                    </div>
                    <div className='text-right'>
                      <p className='text-2xl font-black text-red-500'>{currency}{item.amount}</p>
                      {!item.isPaid && (
                        <button className='mt-1 text-xs font-bold text-blue-500 hover:underline cursor-pointer'>
                          Pay Now →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center mt-20 py-20 bg-white/20 rounded-3xl border-2 border-dashed border-gray-200'>
            <p className='text-gray-400'>No bookings yet. Time to watch something!</p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={closeDeleteModal}></div>
          <div className="relative bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="text-red-500" size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Cancel Order?</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                This will remove your reservation for this movie. You'll need to book again to get these seats.
              </p>
              <div className="flex flex-col gap-3 w-full">
                <button onClick={confirmDelete} className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-200 dark:shadow-none transition-all cursor-pointer">
                  Yes, cancel it
                </button>
                <button onClick={closeDeleteModal} className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 transition-all cursor-pointer">
                  Wait, go back
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