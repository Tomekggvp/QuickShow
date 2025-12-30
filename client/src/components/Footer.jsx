import React from "react"; 
import { assets } from "../assets/assets";
import { useTheme } from '@mui/material/styles'; 

const Footer = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const textColor = isDark ? 'text-gray-300' : 'text-black';

    const borderColor = isDark ? 'border-gray-500' : 'border-gray-300';

    return (
      <footer className={`px-6 md:px-16 lg:px-36 mt-40 w-full ${textColor}`}>
            <div className={`flex flex-col md:flex-row justify-between w-full gap-10 border-b ${borderColor} pb-14`}>
                <div className="md:max-w-96">

                    <img alt="" className={`h-11 ${isDark ? '' : 'brightness-0'}`} src={assets.logo} />
                    
                    <p className="mt-6 text-sm">
                        Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                        <img src={assets.googlePlay} alt="google play" className="h-9 w-auto " />
                        <img src={assets.appStore} alt="app store" className="h-9 w-auto " />
                    </div>
                </div>

                <div className="flex-1 flex items-start md:justify-end gap-20 md:gap-40">
                    <div>
                        <h2 className="font-semibold mb-5">Company</h2>
                        <ul className="text-sm space-y-2">
                            <li><a href="#" className="hover:opacity-70 transition">Home</a></li>
                            <li><a href="#" className="hover:opacity-70 transition">About us</a></li>
                            <li><a href="#" className="hover:opacity-70 transition">Contact us</a></li>
                            <li><a href="#" className="hover:opacity-70 transition">Privacy policy</a></li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="font-semibold mb-5">Get in touch</h2>
                        <div className="text-sm space-y-2">
                            <p>+1-234-567-890</p>
                            <p>contact@example.com</p>
                        </div>
                    </div>
                </div>
            </div>
            <p className="pt-4 text-center text-sm pb-5">
                Copyright {new Date().getFullYear()} © <a href="#" className="font-medium">Tomek</a>. All Right Reserved.
            </p>
        </footer>
    )
}

export default Footer;