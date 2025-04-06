import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Users, Clock, Computer, Mail } from 'lucide-react';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Link } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  useEffect(() => {
    // Check if already logged in

    if (user) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden animate-fadeInDown bg-gray-100">
      {/* Background Images Container */}
      <div className="absolute inset-0 z-0 hidden sm:block">
        <div className="flex flex-wrap justify-center">
          <div className="w-1/2 p-2">
            <img
              src="https://my.amrita.edu/loginimg/Cbe.gif"
              alt="Coimbatore"
              className="opacity-30 mx-auto"
            />
          </div>
          <div className="w-1/2 p-2">
            <img
              src="https://my.amrita.edu/loginimg/Khi.gif"
              alt="Kochi"
              className="opacity-30 mx-auto ml-[80px] mb-[30px]"
            />
          </div>
          <div className="w-1/2 p-2">
            <img
              src="https://my.amrita.edu/loginimg/Blr.gif"
              alt="Bangalore"
              className="opacity-30 mx-auto"
            />
          </div>
          <div className="w-1/2 p-2 mb-[5px]">
            <img
              src="https://my.amrita.edu/loginimg/Fbd.gif"
              alt="Faridabad"
              className="opacity-30 mx-auto"
            />
          </div>
          <div className="w-1/2 p-2 mt-[40px]">
            <img
              src="https://my.amrita.edu/loginimg/Chn.gif"
              alt="Chennai"
              className="opacity-30 mx-auto"
            />
          </div>
          <div className="w-1/2 p-2">
            <img
              src="https://my.amrita.edu/loginimg/Amp.gif"
              alt="Amritapuri"
              className="opacity-30 mx-auto"
            />
          </div>
          <div className="w-1/2 p-2 mt-[5px]">
            <img
              src="https://my.amrita.edu/loginimg/Amv.gif"
              alt="Amaravathi"
              className="opacity-30 mx-auto"
            />
          </div>
          <div className="w-1/2 p-2 mt-[5px]">
            <img
              src="https://my.amrita.edu/loginimg/Mys.gif"
              alt="Mysore"
              className="opacity-30 mx-auto"
            />
          </div>
        </div>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 text-center flex flex-col items-center justify-center">
        {/* Logo */}
        <div className="mb-5">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Amrita-vishwa-vidyapeetham-logo.svg/2560px-Amrita-vishwa-vidyapeetham-logo.svg.png"
            alt="Logo"
            className="mx-auto max-w-[28rem]"
          />
        </div>

        {/* Tagline */}
        <div className="mb-5">
          <span className="hidden sm:block text-2xl md:text-[160%] font-semibold text-gray-800">
            YOUR WINDOW TO NEGCES LAB SYSTEM ACCESS
          </span>
          <span className="block sm:hidden text-xl md:text-[140%] font-semibold text-gray-800 text-center whitespace-nowrap">
            YOUR WINDOW TO <br /> NEGCES LAB SYSTEM ACCESS
          </span>
        </div>

        {/* Decorative Line */}
        <div className="mb-5 ml-[5px]">
          <img
            src="https://my.amrita.edu/loginimg/Line1.gif"
            alt="Line"
            className="mx-auto max-w-full"
          />
        </div>

        {/* Login Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-8 ml-[5px]">
          <Link
            to="/login"
            className="relative inline-block bg-transparent border-2 border-black rounded-none box-border text-black font-bold tracking-[0.05em] py-3 px-7 outline-none overflow-visible transition-all duration-300 ease-in-out select-none text-[13px] hover:bg-black hover:text-white group items-center justify-center">
            <span className="absolute h-[2px] w-[1.5625rem] top-[-2px] left-[0.625rem] bg-[#e8e8e8] transition-all duration-500 ease-out group-hover:left-[-2px] group-hover:w-0" />
            <span className="before:content-[' '] before:absolute before:w-[1.5625rem] before:h-[2px] before:bg-black before:top-1/2 before:left-6 before:-translate-y-1/2 before:transition-all before:duration-300 before:linear group-hover:before:w-[0.9375rem] group-hover:before:bg-white block text-[1.125em] leading-[1.33333em] pl-8 text-left uppercase transition-all duration-300 ease-in-out group-hover:pl-6 group-hover:text-white">
              USER LOGIN
            </span>
            <span className="absolute h-[2px] w-[1.5625rem] right-[1.875rem] bottom-[-2px] bg-[#e8e8e8] transition-all duration-500 ease-out group-hover:right-0 group-hover:w-0" />
            <span className="absolute h-[2px] w-[0.625rem] right-[0.625rem] bottom-[-2px] bg-[#e8e8e8] transition-all duration-500 ease-out group-hover:right-0 group-hover:w-0" />
          </Link>
        </div>
      </div>

      {/* Bottom-Left Element */}
      <div className="absolute bottom-28 left-28 z-20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12">
            <img
              src="https://www.amrita.edu/wp-content/themes/amrita/images/campus-ico.svg"
              alt="Campus Icon"
              className="w-full h-full"
            />
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">Chennai</h1>
        </div>
        <div className="mt-1 text-sm text-gray-600">
          <Link to="/" className="text-gray-600 hover:underline">
            Home
          </Link>
          <span className="mx-1">/</span>
          <span className="text-gray-800">Chennai</span>
        </div>
      </div>
    </div>
  );
};

export default Index;
