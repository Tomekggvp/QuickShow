import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, XIcon } from 'lucide-react';

const SearchBar = () => {
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const searchRef = useRef(null);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/movies?search=${searchQuery.trim()}`);
            setSearchQuery('');
            setShowSearch(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
           
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearch(false);
            }
        };

        if (showSearch) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSearch]);

    return (
        <div ref={searchRef} className='flex items-center justify-end relative'>
            <div className="absolute right-0 flex items-center">
                <form 
                    onSubmit={handleSearch}
                    className={`
                        flex items-center transition-all duration-500 ease-in-out overflow-hidden
                        ${showSearch 
                            ? 'w-48 sm:w-56 md:w-64 px-3 py-1.5 border-b border-red-400 opacity-100 mr-10' 
                            : 'w-0 opacity-0 border-b-0 mr-0'}
                    `}
                >
                    <input 
                        type="text"
                        placeholder="Поиск..."
                        autoFocus={showSearch}
                        className="bg-transparent outline-none text-sm w-full dark:text-white text-black"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>
            </div>

            <div 
                className='z-10 cursor-pointer p-1' 
                onClick={() => setShowSearch(!showSearch)}
            >
                {showSearch ? (
                    <XIcon className="w-6 h-6 text-red-400" />
                ) : (
                    <SearchIcon className="w-6 h-6 dark:text-white text-black" />
                )}
            </div>
        </div>
    );
};

export default SearchBar;