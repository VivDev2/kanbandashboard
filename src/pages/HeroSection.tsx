import { motion } from "framer-motion";

// Define the type for floating cards
interface FloatingCard {
  id: number;
  title: string;
  status: 'in-progress' | 'completed' | 'pending';
  assignee: string;
  time: string;
  x: number;
  y: number;
  delay: number;
}

// Define the type for progress items
interface ProgressItem {
  progress: number;
  label: string;
  count: number;
}

const HeroSection = () => {
  const floatingCards: FloatingCard[] = [
    {
      id: 1,
      title: "Design Review",
      status: "in-progress",
      assignee: "Sarah",
      time: "2h",
      x: -50,
      y: -30,
      delay: 0,
    },
    {
      id: 2,
      title: "Team Standup",
      status: "completed",
      assignee: "Mike",
      time: "Done",
      x: 50,
      y: 20,
      delay: 0.2,
    },
    {
      id: 3,
      title: "Client Meeting",
      status: "pending",
      assignee: "Alex",
      time: "4h",
      x: -30,
      y: 50,
      delay: 0.4,
    },
  ];

  // Simple Button component
  const Button = ({
    children,
    variant = "default",
    size = "default",
    className = "",
    ...props
  }: {
    children: React.ReactNode;
    variant?: "default" | "outline";
    size?: "default" | "sm" | "lg";
    className?: string;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    
    const variantClasses = 
      variant === "outline"
        ? "border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
        : "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500";
    
    const sizeClasses = 
      size === "sm" 
        ? "h-9 px-3 text-sm" 
        : size === "lg" 
          ? "h-12 px-8 text-lg" 
          : "h-10 px-4 py-2";
    
    return (
      <button
        className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  };

  // Icons as SVG components
  const ArrowRightIcon = ({ className }: { className?: string }) => (
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
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </svg>
  );

  const CheckCircle2Icon = ({ className }: { className?: string }) => (
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
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );

  const ClockIcon = ({ className }: { className?: string }) => (
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
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );

  const UsersIcon = ({ className }: { className?: string }) => (
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Animated background gradient orbs */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-blue-400/30 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-block"
              >
                <span className="px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium">
                  ✨ The Future of Task Management
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-5xl md:text-7xl font-bold leading-tight"
              >
                Manage Tasks,
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Empower Teams
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-xl text-gray-600 dark:text-gray-300 max-w-xl"
              >
                Streamline your workflow with intelligent task management, seamless team collaboration, and effortless leave tracking. All in one place.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex flex-wrap gap-4"
              >
                <Button size="lg" className="group">
                  Get Started Free
                  <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button size="lg" variant="outline">
                  Watch Demo
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex items-center gap-8 pt-4"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2Icon className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2Icon className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">14-day free trial</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right side - Floating task cards */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative h-[600px] hidden lg:block"
            >
              {floatingCards.map((card) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{
                    opacity: 1,
                    y: [0, -10, 0],
                    x: card.x,
                  }}
                  transition={{
                    opacity: { delay: card.delay + 0.5, duration: 0.5 },
                    y: {
                      delay: card.delay + 0.5,
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    top: `calc(50% + ${card.y}px)`,
                    left: `calc(50% + ${card.x}px)`,
                  }}
                >
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-72 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{card.title}</h3>
                        <div className="flex items-center gap-2">
                          {card.status === "completed" ? (
                            <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                              <CheckCircle2Icon className="h-4 w-4" />
                              Completed
                            </span>
                          ) : card.status === "in-progress" ? (
                            <span className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400">
                              <ClockIcon className="h-4 w-4" />
                              In Progress
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                              <ClockIcon className="h-4 w-4" />
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-sm font-medium">
                          {card.assignee[0]}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{card.assignee}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.time}</span>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Center card - Main task board preview */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
              >
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl p-8 w-80">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white font-bold text-xl">Today's Tasks</h3>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                    >
                      <UsersIcon className="h-5 w-5 text-white" />
                    </motion.div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { progress: 100, label: "Completed", count: 8 },
                      { progress: 60, label: "In Progress", count: 5 },
                      { progress: 30, label: "Pending", count: 3 },
                    ].map((item: ProgressItem, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 1 + idx * 0.2, duration: 0.8 }}
                        className="bg-white/10 backdrop-blur-sm rounded-lg p-3"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white text-sm font-medium">{item.label}</span>
                          <span className="text-white/80 text-xs">{item.count} tasks</span>
                        </div>
                        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.progress}%` }}
                            transition={{ delay: 1.2 + idx * 0.2, duration: 1 }}
                            className="h-full bg-white rounded-full"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;