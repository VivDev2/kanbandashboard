// client/src/components/Register.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { register, clearError } from '../redux/slices/authSlice';
import type { AppDispatch, RootState } from '../redux/store';
import { Eye, EyeOff } from "lucide-react";

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [gridColors, setGridColors] = useState<string[]>([
    "#d1d5db", "#84cc16", "#f97316", "#dc2626", "#a855f7"
  ]);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { loading, error, user } = useSelector((state: RootState) => state.auth);

  // Color rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGridColors(prevColors => {
        const newColors = [...prevColors];
        const firstColor = newColors.shift();
        if (firstColor) newColors.push(firstColor);
        return newColors;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    dispatch(clearError());
    
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(register({ name, email, password }));
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-900 overflow-hidden">
      {/* Left Side - Hidden on mobile, visible on tablet+ */}
      <div className="hidden md:flex md:w-1/2 lg:w-1/2 relative bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white p-4 md:p-6 lg:p-8 items-center justify-center overflow-hidden">
        {/* Mesh Grid Pattern - Smaller on tablet */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute opacity-10 rounded-lg"
              style={{
                width: window.innerWidth < 1024 ? "64px" : "128px",
                height: window.innerWidth < 1024 ? "64px" : "128px",
                top: `${(i * 15) % 100}%`,
                left: `${(i * 20) % 100}%`,
                backgroundColor: gridColors[i % gridColors.length],
                transform: `rotate(${i * 15}deg)`,
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.15, 0.1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i + 20}
              className="absolute opacity-10 rounded-full"
              style={{
                width: window.innerWidth < 1024 ? "48px" : "96px",
                height: window.innerWidth < 1024 ? "48px" : "96px",
                top: `${(i * 18) % 100}%`,
                right: `${(i * 12) % 100}%`,
                backgroundColor: gridColors[(i + 2) % gridColors.length],
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        {/* Animated Task Icons - Smaller on tablet */}
        <motion.div
          className="absolute top-1/4 left-8 md:left-12 lg:left-16 bg-blue-600/20 backdrop-blur-sm rounded-xl shadow-2xl flex items-center justify-center transform rotate-12 z-10 border border-blue-500/30"
          style={{
            width: window.innerWidth < 1024 ? "48px" : "64px",
            height: window.innerWidth < 1024 ? "48px" : "64px",
          }}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          whileHover={{ scale: 1.1, rotate: 0 }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={window.innerWidth < 1024 ? "h-6 w-6" : "h-8 w-8"}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            style={{ color: "#60a5fa" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </motion.div>

        <motion.div
          className="absolute bottom-1/4 right-8 md:right-12 lg:right-16 bg-green-600/20 backdrop-blur-sm rounded-xl shadow-2xl flex items-center justify-center transform -rotate-6 z-10 border border-green-500/30"
          style={{
            width: window.innerWidth < 1024 ? "48px" : "64px",
            height: window.innerWidth < 1024 ? "48px" : "64px",
          }}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          whileHover={{ scale: 1.1, rotate: 0 }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={window.innerWidth < 1024 ? "h-6 w-6" : "h-8 w-8"}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            style={{ color: "#4ade80" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </motion.div>

        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-600/20 backdrop-blur-sm rounded-xl shadow-2xl flex items-center justify-center z-10 border border-purple-500/30"
          style={{
            width: window.innerWidth < 1024 ? "64px" : "80px",
            height: window.innerWidth < 1024 ? "64px" : "80px",
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          whileHover={{ scale: 1.1 }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={window.innerWidth < 1024 ? "h-8 w-8" : "h-10 w-10"}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            style={{ color: "#c084fc" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </motion.div>

        {/* Welcome Card - Smaller on tablet */}
        <motion.div
          className="bg-gray-800/70 backdrop-blur-md border border-gray-700/50 rounded-2xl p-4 md:p-6 lg:p-8 max-w-xs text-center shadow-2xl z-10"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <div className="flex justify-center mb-3 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-white mb-2">Join TaskSlide</h3>
          <p className="text-xs md:text-sm leading-relaxed text-gray-300">
            Create your account and start organizing your tasks efficiently with our powerful productivity tools.
          </p>
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-gray-50 relative z-10 min-h-screen">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sm:p-8">
            {/* Logo/Icon */}
            <div className="flex justify-center mb-4 sm:mb-6">
              <img 
                src="/src/assets/blogo.svg" 
                alt="Company Logo" 
                className="h-8 sm:h-20 w-auto" 
              />
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 text-center">Create your account</h2>
            <p className="text-sm text-gray-600 text-center mt-2 mb-4 sm:mb-6">
              Already have an account?{" "}
              <Link to="/login" className="text-gray-600 hover:text-blue-700 font-medium">
                Sign in
              </Link>
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
                  {error}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 
                            placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                            transition-colors"
                  placeholder="John Doe"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 
                            placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                            transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              {/* Password */}
              <div className='relative'>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}  
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 
                            placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                            transition-colors pr-10"
                  placeholder="••••••••"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-9 sm:top-10 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-black hover:bg-indigo-800 text-white font-medium 
                          rounded-lg shadow-sm transition-colors duration-200 flex items-center 
                          justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;