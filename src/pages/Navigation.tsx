import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import logo from "../assets/taskslidelogo.png";

// Define the type for navigation items
interface NavItem {
  label: string;
  href: string;
}

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems: NavItem[] = [
    { label: "Home", href: "/" },
    { label: "Pendulum", href: "/pendulum" },
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
    // Optionally, add Login/Register here if you want them in the main nav
    // { label: "Login", href: "/login" },
    // { label: "Register", href: "/register" },
  ];

  // Simple Button component (replace with your own or a library like shadcn/ui)
  const Button = ({
    children,
    variant = "default",
    className = "",
    to, // Add 'to' prop for Link
    ...props
  }: {
    children: React.ReactNode;
    variant?: "default" | "ghost";
    className?: string;
    to?: string; // Define 'to' prop type
  } & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    const baseClasses = "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
    const variantClasses =
      variant === "ghost"
        ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500"
        : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500";

    // If 'to' prop is provided, render a Link, otherwise render a button
    if (to) {
      return (
        <Link
          to={to}
          className={`${baseClasses} ${variantClasses} ${className}`}
        >
          {children}
        </Link>
      );
    }

    return (
      <button
        className={`${baseClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  };

  // Icons as SVG components
  const MenuIcon = ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );

  const XIcon = ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <img
                src={logo}
                alt="TaskSlide Logo"
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-bold">TaskSlide</span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item, idx) => (
              // Use Link instead of <a> for internal navigation
              <Link
                key={idx}
                to={item.href}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <motion.span whileHover={{ y: -2 }}>
                  {item.label}
                </motion.span>
              </Link>
            ))}
          </div>

          {/* CTA Buttons - Using Link via the Button component */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" to="/login">Sign In</Button> {/* Use 'to' prop */}
            <Button to="/register">Get Started</Button> {/* Use 'to' prop */}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800"
            >
              <div className="flex flex-col gap-4">
                {navItems.map((item, idx) => (
                  // Use Link instead of <a> for internal navigation
                  <Link
                    key={idx}
                    to={item.href}
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors py-2"
                    onClick={() => setIsOpen(false)} // Close menu on click
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="flex flex-col gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                  {/* Use Button component with 'to' prop for mobile */}
                  <Button variant="ghost" className="w-full justify-start" to="/login">
                    Sign In
                  </Button>
                  <Button className="w-full justify-start" to="/register">
                    Get Started
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navigation;