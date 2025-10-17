// client/src/components/Register.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { register, clearError } from '../redux/slices/authSlice';
import type { AppDispatch, RootState } from '../redux/store';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      // Redirect based on user role
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    }
  }, [user, navigate]);

  // Separate effect for clearing errors
  useEffect(() => {
    // Clear error when component mounts or when user changes
    dispatch(clearError());
    
    // Optional: Clear error on unmount
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(register({ name, email, password }));
  };

  return (
    <div className="min-h-screen flex bg-gray-900 overflow-hidden">
      {/* Left Side - 50% width with design elements */}
      <div className="w-1/2 relative bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white p-8 flex items-center justify-center overflow-hidden">
        {/* Mesh Grid Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-32 h-32 opacity-10 rounded-lg"
              style={{
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
              className="absolute w-24 h-24 opacity-10 rounded-full"
              style={{
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

        {/* Animated Task Icons */}
        <motion.div
          className="absolute top-1/4 left-16 w-16 h-16 bg-blue-600/20 backdrop-blur-sm rounded-xl shadow-2xl flex items-center justify-center transform rotate-12 z-10 border border-blue-500/30"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          whileHover={{ scale: 1.1, rotate: 0 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </motion.div>

        <motion.div
          className="absolute bottom-1/4 right-16 w-16 h-16 bg-green-600/20 backdrop-blur-sm rounded-xl shadow-2xl flex items-center justify-center transform -rotate-6 z-10 border border-green-500/30"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          whileHover={{ scale: 1.1, rotate: 0 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </motion.div>

        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-purple-600/20 backdrop-blur-sm rounded-xl shadow-2xl flex items-center justify-center z-10 border border-purple-500/30"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          whileHover={{ scale: 1.1 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </motion.div>

        {/* Welcome Card */}
        <motion.div
          className="bg-gray-800/70 backdrop-blur-md border border-gray-700/50 rounded-2xl p-8 max-w-xs text-center shadow-2xl z-10"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Join TaskSlide</h3>
          <p className="text-sm leading-relaxed text-gray-300">
            Create your account and start organizing your tasks efficiently with our powerful productivity tools.
          </p>
        </motion.div>
      </div>

      <div className="w-1/2 flex items-center justify-center p-8 bg-gray-50 relative z-10">
  <motion.div
    className="w-full max-w-md"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  >
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
      {/* Logo/Icon */}
      <div className="flex justify-center mb-6">
        <img 
          src="/logo.svg" 
          alt="Company Logo" 
          className="h-10 w-auto" 
        />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-semibold text-gray-900 text-center">Create your account</h2>
      <p className="text-sm text-gray-600 text-center mt-2 mb-6">
        Already have an account?{" "}
        <Link to="/login" className="text-gray-600 hover:text-blue-700 font-medium">
          Sign in
        </Link>
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
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
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 
                       placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       transition-colors"
            placeholder="••••••••"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-black hover:bg-indigo-800   text-white font-medium 
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