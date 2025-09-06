import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { dummyDateTimeData, dummyShowsData } from '../assets/assets';
import BlurCircle from '../components/BlurCircle';
import { StarIcon } from 'lucide-react';

const MovieDetails = () => {

  const {id} = useParams()
  const [show, setShow] = useState(null)

  const getShow = async () => {
    const show = dummyShowsData.find( show => show._id === id)
    setShow({

      movie: show,
      dateTime: dummyDateTimeData

    })
  }

  useEffect(() => {
    getShow()
  },[id])

  return show ? (
    <div className='px-6 md:px-16 lg:px-40 pt-30 md:pt-50'>
      <div className='flex flex-col md:flex-row gap-8 max-w-6x1 mx-auto'>
          <img src={show.movie.poster_path} alt=""  className='max-md:mx-auto rouded-x1 h-104 max-w-70 object-cover'/>

          <div className='relative flex flex-col gap-3 '>
            <BlurCircle top='-100px' left='-100px'/>
            <p className='text-primary'>ENGLISH</p>
            <h1 className='text-4xl font-semibold max-w-96 text-balance'>{show.movie.title}</h1>
            <div className='flext items-center gap-2 text-gray-300'>
                <StarIcon className='w-5 h-5 text-primary fill-primary'/>
                {show.movie.vote_average.toFixed(1)} User Rating
            </div>
            <p className='text-gray-400 mt-2 text-sm leading-tight max-w-xl'>{show.movie.overview}</p>
            <p></p>
          </div>
      </div>
    </div>
  ) : <div>Loading...</div> ;
};

export default MovieDetails