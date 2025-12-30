import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { SearchIcon, MenuIcon, XIcon, TicketPlus } from 'lucide-react'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'
import { IconButton } from '@mui/material'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import { useTheme } from '@mui/material/styles'
import { useColorMode } from '../ThemeContext'

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const { user } = useUser()
    const { openSignIn } = useClerk()
    const navigate = useNavigate()

    const theme = useTheme()
    const { toggleColorMode } = useColorMode()

    const isDark = theme.palette.mode === 'dark';
    const textColor = isDark ? 'text-white' : 'text-black';

    return (
        <div className='fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-5'>

            <Link to='/' className='max-md:flex-1'>
                <img 
                    src={assets.logo} 
                    alt="Logo" 
                    className={`w-36 h-auto transition-all duration-300 ${!isDark ? 'brightness-0' : ''}`} 
                />
            </Link>

            <div className={`
                max-md:absolute max-md:top-0 max-md:left-0 max-md:font-medium max-md:text-lg z-50 
                flex flex-col md:flex-row items-center max-md:justify-center gap-8 min-md:px-8 py-3 
                max-md:h-screen min-md:rounded-full overflow-hidden transition-all duration-300
                
                backdrop-blur-md border
                
                ${isDark 
                    ? 'bg-black/70 md:bg-white/10 border-gray-300/20' 
                    : 'bg-white/60 md:bg-gray-200/40 border-gray-400/30 shadow-sm'}
                
                ${isOpen ? 'max-md:w-full' : 'max-md:w-0'}
            `}>

                <XIcon className={`md:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer ${textColor}`} onClick={() => setIsOpen(!isOpen)} />

                <Link className={textColor} onClick={() => { scrollTo(0, 0); setIsOpen(false) }} to='/'>Home</Link>
                <Link className={textColor} onClick={() => { scrollTo(0, 0); setIsOpen(false) }} to='/movies'>Movies</Link>
                <Link className={textColor} onClick={() => { scrollTo(0, 0); setIsOpen(false) }} to='/'>Theaters</Link>
                <Link className={textColor} onClick={() => { scrollTo(0, 0); setIsOpen(false) }} to='/'>Releases</Link>
                <Link className={textColor} onClick={() => { scrollTo(0, 0); setIsOpen(false) }} to='/favorite'>Favorites</Link>
            </div>

            <div className='flex items-center gap-8'>
                <IconButton onClick={toggleColorMode} sx={{ color: 'inherit' }}>
                    {isDark ? <Brightness7Icon className="text-yellow-400" /> : <Brightness4Icon className="text-slate-600" />}
                </IconButton>

                <SearchIcon className={`max-md:hidden w-6 h-6 cursor-pointer ${textColor}`} />
                
                {
                    !user ? (
                        <button onClick={openSignIn} className='px-4 py-1 sm:px-7 sm:py-2 bg-red-400 hover:bg-primary-dull transition rounded-full font-medium cursor-pointer text-white'>Login</button>
                    ) : (
                        <UserButton>
                            <UserButton.MenuItems>
                                <UserButton.Action label='My Bookings' labelIcon={<TicketPlus width={15} />} onClick={() => navigate('/my-bookings')} />
                            </UserButton.MenuItems>
                        </UserButton>
                    )
                }
            </div>

            <MenuIcon className={`max-md:ml-4 md:hidden w-8 h-8 cursor-pointer ${textColor}`} onClick={() => setIsOpen(!isOpen)} />

        </div>
    )
}

export default Navbar