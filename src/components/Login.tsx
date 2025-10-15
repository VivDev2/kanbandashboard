// client/src/components/Login.tsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { AppDispatch, RootState } from "../redux/store";
import { login } from "../redux/slices/authSlice";
import socketService from "../services/socketService";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [gridColors, setGridColors] = useState<string[]>([
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"
  ]);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { loading, error, user } = useSelector(
    (state: RootState) => state.auth
  );

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

  // Redirect on login
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resultAction = await dispatch(login({ email, password }));

      if (login.fulfilled.match(resultAction)) {
        const { token } = resultAction.payload;
        socketService.connect(token);
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-900 overflow-hidden">
      {/* Left Side - Dark Gradient with Avatars & Quote */}
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

        {/* Floating Avatar Blocks */}
        <motion.div
          className="absolute top-1/4 left-16 w-16 h-16 bg-gray-700 rounded-lg shadow-2xl flex items-center justify-center transform rotate-12 z-10"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-1/4 right-16 w-16 h-16 bg-gray-700 rounded-lg shadow-2xl flex items-center justify-center transform -rotate-6 z-10"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        </motion.div>

        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gray-700 rounded-lg shadow-2xl flex items-center justify-center z-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        </motion.div>

        {/* Quote Card */}
        <motion.div
          className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl p-6 max-w-xs text-center shadow-xl z-10"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-gray-300 mb-4">
            "Up until now I hope everything works fine.."
          </p>
          <div className="text-left">
            <p className="font-semibold text-white">I Did that</p>
            <p className="text-xs text-gray-400">Coder</p>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-1/2 flex items-center justify-center p-8 bg-white relative z-10">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Taskify</h2>
            <p className="text-sm text-gray-600 mb-6">
              Don't have an account?{" "}
              <Link to="/register" className="text-black hover:text-blue-700 font-medium">
                Click here
              </Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Login</span>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Forgot your password?{" "}
              <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium">
                Click here
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;