import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets, dummyDateTimeData, dummyShowsData } from '../assets/assets'
import Loading from '../components/Loading'
import { ArrowRightIcon, ClockIcon, XIcon } from 'lucide-react'
import isoTimeFormat from '../lib/isoTimeFormat'
import BlurCircle from '../components/BlurCircle'
import toast from 'react-hot-toast'
import { useAuth, SignIn, useUser } from '@clerk/clerk-react'
import axios from 'axios'
import tmdb from '../services/tmdb' 

const SeatLayout = () => {
  const groupRows = [["A", "B"], ["C", "D"], ["E", "F"], ["G", "H"], ["I", "J"]]
  const { id, date } = useParams()

  const [selectedSeats, setSelectedSeats] = useState([])
  const [selectedTime, setSelectedTime] = useState(null)
  const [show, setShow] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const navigate = useNavigate()

  const TG_TOKEN = import.meta.env.VITE_TELEGRAM_TOKEN
  const TG_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID

  const getShow = async () => {
    try {
      const response = await tmdb.get(`/movie/${id}`);
      
      if (response.data) {
        setShow({
          movie: response.data, 
          dateTime: dummyDateTimeData 
        });
      }
    } catch (error) {
      console.error("Error fetching movie for seats:", error);
      const foundShow = dummyShowsData.find(s => s._id === id || s.id === Number(id));
      if (foundShow) {
        setShow({ movie: foundShow, dateTime: dummyDateTimeData });
      } else {
        toast.error("Movie not found");
      }
    }
  }

  const handleSeatClick = (seatId) => {
    if (!selectedTime) return toast.error("Please select time first")
    if (!selectedSeats.includes(seatId) && selectedSeats.length > 4) return toast.error("Max 5 seats")

    setSelectedSeats(prev => prev.includes(seatId) ? prev.filter(s => s !== seatId) : [...prev, seatId])
  }

  const sendTelegramAlert = async (bookingData) => {
    if (!TG_TOKEN || !TG_CHAT_ID) return;

    const message = `
🚀 *New Order!*
--------------------------
🎬 *Movie:* ${bookingData.show.movie.title}
📅 *Date:* ${date}
⏰ *Time:* ${isoTimeFormat(bookingData.show.showDateTime)}
💺 *Seats:* ${bookingData.bookedSeats.join(', ')}
💰 *Total:* $${bookingData.amount}
👤 *Email:* ${user.primaryEmailAddress.emailAddress}
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
  }

  const handleProceedToCheckout = async () => {
    if (!isLoaded) return
    if (!isSignedIn) {
      setShowAuthModal(true)
      return
    }
    if (!selectedTime) return toast.error("Please select a time")
    if (selectedSeats.length === 0) return toast.error("Please select seats")

    try {
      const newBooking = {
        _id: `ID-${Date.now()}`,
        show: {
          movie: {
            title: show.movie.title,
            _id: show.movie.id || show.movie._id,
            poster_path: show.movie.poster_path, 
            runtime: show.movie.runtime
          },
          showDateTime: selectedTime.time
        },
        amount: selectedSeats.length * 15,
        bookedSeats: selectedSeats,
        isPaid: false,
      }

      const currentBookings = user.unsafeMetadata.bookings || []
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          bookings: [newBooking, ...currentBookings]
        }
      })

      await sendTelegramAlert(newBooking);
      toast.success("Booking confirmed!");
      navigate('/my-bookings');
      window.scrollTo(0, 0);

    } catch (error) {
      toast.error("Error saving booking");
      console.error(error);
    }
  }

  useEffect(() => { getShow() }, [id])

  const renderSeats = (row, count = 9) => (
    <div key={row} className='flex gap-2 mt-2'>
      {Array.from({ length: count }, (_, i) => {
        const seatId = `${row}${i + 1}`;
        const isSelected = selectedSeats.includes(seatId);
        return (
          <button
            key={seatId}
            onClick={() => handleSeatClick(seatId)}
            className={`h-8 w-8 rounded border border-red-400/60 cursor-pointer transition-colors text-[10px]
              ${isSelected ? "bg-red-400 text-white" : "hover:bg-red-400/20 text-gray-400"}`}
          >
            {seatId}
          </button>
        )
      })}
    </div>
  )

  if (!isLoaded || !show) return <Loading />

  return (
    <>
      <div className='flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30'>
        {/* Sidebar */}
        <div className='w-60 bg-red-400/10 border border-red-400/20 rounded-lg py-10 h-max md:sticky md:top-30'>
          <p className='text-lg font-semibold px-6 text-balance'>{show.movie.title}</p>
          <p className='text-xs px-6 mb-4 opacity-60'>Select Timing</p>
          <div className='mt-2 space-y-1'>
            {show.dateTime[date]?.map((item) => (
              <div
                key={item.time}
                onClick={() => { setSelectedTime(item); setSelectedSeats([]) }}
                className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition ${selectedTime?.time === item.time ? "bg-red-400 text-white" : "hover:bg-red-400/20"
                  }`}
              >
                <ClockIcon className='w-4 h-4' />
                <p className='text-sm'>{isoTimeFormat(item.time)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Seats Grid */}
        <div className='relative flex-1 flex flex-col items-center max-md:mt-16'>
          <BlurCircle top='-100px' left='-100px' />
          <h1 className='text-2xl font-semibold mb-4'>Select your seat</h1>
          <img src={assets.screenImage} alt="screen" className='w-full max-w-md' />
          <p className='text-gray-400 text-xs mb-6'>SCREEN SIDE</p>

          <div className='flex flex-col items-center mt-10 text-xs text-gray-300'>
            {groupRows.map((group, idx) => (
              <div key={idx} className={`mb-6 ${idx === 0 ? '' : 'grid grid-cols-1 md:grid-cols-2 gap-x-10'}`}>
                {group.map(row => renderSeats(row))}
              </div>
            ))}
          </div>

          <button
            onClick={handleProceedToCheckout}
            className='flex items-center gap-2 mt-20 px-12 py-4 text-sm bg-red-400 hover:bg-red-500 transition rounded-full font-bold cursor-pointer text-white shadow-lg active:scale-95'
          >
            Confirm Booking
            <ArrowRightIcon className='w-4 h-4' />
          </button>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full relative shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Please Sign In</h2>
              <button onClick={() => setShowAuthModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              <SignIn redirectUrl={window.location.pathname} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SeatLayout