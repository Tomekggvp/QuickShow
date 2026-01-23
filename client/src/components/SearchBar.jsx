import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, XIcon } from 'lucide-react';

const SearchBar = ({ isDark, showSearch, setShowSearch }) => {
    const [searchQuery, setSearchQuery] = React.useState('');
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
    }, [showSearch, setShowSearch]);

    return (
        <div ref={searchRef} className='relative flex items-center justify-end h-10 w-10 flex-shrink-0'>
            
            {/* Форма поиска */}
            <form 
                onSubmit={handleSearch}
                className={`
                    absolute right-0 flex items-center transition-all duration-500 ease-in-out overflow-hidden
                    bg-transparent border-b border-red-400
                    ${showSearch 
                        
                        ? 'opacity-100 pr-10 w-[calc(100vw-100px)] md:w-64' 
                        : 'w-0 opacity-0 pointer-events-none'}
                `}
            >
                <input 
                    type="text"
                    placeholder="Поиск..."
                    autoFocus={showSearch}
                    className={`bg-transparent outline-none text-base w-full py-1 font-medium
                        ${isDark ? 'text-white' : 'text-black'} 
                        placeholder-gray-400`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </form>

    
            <div 
                className='relative z-10 cursor-pointer flex items-center justify-center w-10 h-10' 
                onClick={() => setShowSearch(!showSearch)}
            >
                {showSearch ? (
                    <XIcon className="w-6 h-6 text-red-400" />
                ) : (
                    <SearchIcon className={`w-6 h-6 transition-colors duration-300 ${isDark ? 'text-white' : 'text-black'}`} />
                )}
            </div>
        </div>
    );
};

export default SearchBar;