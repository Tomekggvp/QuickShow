import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { MenuIcon, XIcon, TicketPlus } from 'lucide-react'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'
import { IconButton } from '@mui/material'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import { useTheme } from '@mui/material/styles'
import { useColorMode } from '../ThemeContext'
import SearchBar from './SearchBar' 

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    
    const { user } = useUser()
    const { openSignIn } = useClerk()
    const navigate = useNavigate()

    const theme = useTheme()
    const { toggleColorMode } = useColorMode()

    const isDark = theme.palette.mode === 'dark';
    const textColor = isDark ? 'text-white' : 'text-black';

    return (
        <nav className='fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-5 bg-transparent'>

           
            <Link 
                to='/' 
                className={`flex-shrink-0 transition-all duration-300 
                ${isSearchOpen ? 'max-md:w-0 max-md:opacity-0 overflow-hidden' : 'w-auto opacity-100 mr-4'}`}
            >
                <img 
                    src={assets.logo} 
                    alt="Logo" 
                    className={`w-32 md:w-36 h-auto ${!isDark ? 'brightness-0' : ''}`} 
                />
            </Link>

            {/* Навигационные ссылки (Desktop) */}
            <div className={`
                max-md:absolute max-md:top-0 max-md:left-0 max-md:font-medium max-md:text-lg z-50 
                flex flex-col md:flex-row items-center max-md:justify-center gap-8 px-8 py-3 
                max-md:h-screen transition-all duration-300
                backdrop-blur-md border md:rounded-full
                ${isDark 
                    ? 'bg-black/70 md:bg-white/10 border-gray-300/20' 
                    : 'bg-white/60 md:bg-gray-200/40 border-gray-400/30 shadow-sm'}
                ${isOpen ? 'max-md:w-full opacity-100' : 'max-md:w-0 opacity-0 max-md:pointer-events-none md:opacity-100'}
            `}>
                <XIcon className={`md:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer ${textColor}`} onClick={() => setIsOpen(false)} />

                <Link className={`${textColor} hover:text-red-400 transition-colors`} onClick={() => { window.scrollTo(0, 0); setIsOpen(false) }} to='/'>Главная</Link>
                <Link className={`${textColor} hover:text-red-400 transition-colors`} onClick={() => { window.scrollTo(0, 0); setIsOpen(false) }} to='/movies'>Фильмы</Link>
                <Link className={`${textColor} hover:text-red-400 transition-colors`} onClick={() => { window.scrollTo(0, 0); setIsOpen(false) }} to='/favorite'>Избранное</Link>
                <Link className={`${textColor} hover:text-red-400 transition-colors`} onClick={() => { window.scrollTo(0, 0); setIsOpen(false) }} to='/my-bookings'>Бронирования</Link>
            </div>

            {/* Правая часть: Поиск, Тема, Профиль */}
            <div className={`flex items-center justify-end flex-1 md:flex-none transition-all ${isSearchOpen ? 'gap-0' : 'gap-1 md:gap-4'}`}>
                
                <SearchBar 
                    isDark={isDark} 
                    showSearch={isSearchOpen} 
                    setShowSearch={setIsSearchOpen} 
                />

           
                {!isSearchOpen && (
                    <div className='flex items-center gap-1 md:gap-4'>
                        <IconButton 
                            onClick={toggleColorMode} 
                            sx={{ color: 'inherit' }} 
                            className="hidden sm:inline-flex"
                        >
                            {isDark ? <Brightness7Icon className="text-yellow-400" /> : <Brightness4Icon className="text-slate-600" />}
                        </IconButton>
                        
                        <div className='flex items-center gap-2'>
                            {!user ? (
                                <button 
                                    onClick={openSignIn} 
                                    className="px-4 py-1.5 sm:px-7 sm:py-2 bg-red-400 hover:bg-red-500 transition-all rounded-full font-medium text-white shadow-md active:scale-95 text-sm"
                                >
                                    Login
                                </button>
                            ) : (
                                <div className='flex items-center flex-shrink-0'>
                                    <UserButton afterSignOutUrl="/">
                                        <UserButton.MenuItems>
                                            <UserButton.Action label='My Bookings' labelIcon={<TicketPlus width={15} />} onClick={() => navigate('/my-bookings')} />
                                        </UserButton.MenuItems>
                                    </UserButton>
                                </div>
                            )}
                            
                            <MenuIcon className={`md:hidden w-8 h-8 cursor-pointer flex-shrink-0 ${textColor}`} onClick={() => setIsOpen(true)} />
                        </div>
                    </div>
                )}
                
                
            </div>
        </nav>
    )
}

export default Navbar