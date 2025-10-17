
import { motion } from "framer-motion";
import { CheckCircle2, Users, Calendar, TrendingUp, Zap, ListChecks } from "lucide-react";
import { useState } from "react";

export default function BentoGrid() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const cards = [
    {
      id: 1,
      title: "Create Tasks Instantly",
      description: "Add tasks with a single click. Set priorities, deadlines, and tags effortlessly.",
      icon: ListChecks,
      color: "from-blue-500 to-cyan-500",
      span: "md:col-span-2",
      interactive: (
        <TaskCreationDemo />
      ),
    },
    {
      id: 2,
      title: "Smart Assignment",
      description: "AI-powered task assignment based on team capacity and skills.",
      icon: Zap,
      color: "from-purple-500 to-pink-500",
      span: "md:col-span-1",
      interactive: (
        <AssignmentDemo />
      ),
    },
    {
      id: 3,
      title: "Team Collaboration",
      description: "Real-time updates, comments, and file sharing keep everyone in sync.",
      icon: Users,
      color: "from-orange-500 to-red-500",
      span: "md:col-span-1",
      interactive: (
        <TeamCollabDemo />
      ),
    },
    {
      id: 4,
      title: "Leave Management",
      description: "Request and approve time off with automated calendar sync.",
      icon: Calendar,
      color: "from-green-500 to-emerald-500",
      span: "md:col-span-2",
      interactive: (
        <LeaveManagementDemo />
      ),
    },
    {
      id: 5,
      title: "Progress Tracking",
      description: "Visual dashboards and analytics to monitor team performance.",
      icon: TrendingUp,
      color: "from-indigo-500 to-blue-500",
      span: "md:col-span-2",
      interactive: (
        <ProgressTrackingDemo />
      ),
    },
  ];

  return (
    <section className="py-24 px-4 bg-white dark:bg-gray-900">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            Everything You Need to
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Succeed Together
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features that transform how your team works, all in one intuitive platform.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 auto-rows-[300px]">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onHoverStart={() => setHoveredCard(card.id)}
              onHoverEnd={() => setHoveredCard(null)}
              className={`${card.span} relative group`}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 overflow-hidden relative"
              >
                {/* Animated gradient overlay */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                />

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <motion.div
                      animate={{
                        rotate: hoveredCard === card.id ? 360 : 0,
                      }}
                      transition={{ duration: 0.6 }}
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}
                    >
                      <card.icon className="h-7 w-7 text-white" />
                    </motion.div>
                  </div>

                  <h3 className="text-2xl font-bold mb-2">{card.title}</h3>
                  <p className="text-muted-foreground mb-6">{card.description}</p>

                  {/* Interactive demo */}
                  <div className="flex-1 flex items-end">
                    {card.interactive}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Interactive component demos
function TaskCreationDemo() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Design mockups", checked: true },
    { id: 2, text: "Code review", checked: false },
  ]);

  return (
    <div className="w-full space-y-2">
      {tasks.map((task) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: 5 }}
          className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm cursor-pointer"
          onClick={() => {
            setTasks(tasks.map(t => 
              t.id === task.id ? { ...t, checked: !t.checked } : t
            ));
          }}
        >
          <motion.div
            animate={{
              backgroundColor: task.checked ? "#10b981" : "#e5e7eb",
            }}
            className="w-5 h-5 rounded-md flex items-center justify-center"
          >
            {task.checked && <CheckCircle2 className="h-4 w-4 text-white" />}
          </motion.div>
          <span className={`text-sm ${task.checked ? "line-through text-muted-foreground" : ""}`}>
            {task.text}
          </span>
        </motion.div>
      ))}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm text-muted-foreground hover:border-blue-500 hover:text-blue-500 transition-colors"
        onClick={() => {
          setTasks([...tasks, { id: tasks.length + 1, text: "New task", checked: false }]);
        }}
      >
        + Add Task
      </motion.button>
    </div>
  );
}

function AssignmentDemo() {
  const [assigned, setAssigned] = useState(false);

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg cursor-pointer"
        onClick={() => setAssigned(!assigned)}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
            {assigned ? "S" : "?"}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Website Redesign</p>
            <p className="text-xs text-muted-foreground">
              {assigned ? "Assigned to Sarah" : "Unassigned"}
            </p>
          </div>
        </div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: assigned ? "100%" : "0%" }}
          className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
        />
      </motion.div>
    </motion.div>
  );
}

function TeamCollabDemo() {
  const avatars = [
    { name: "A", color: "from-blue-400 to-cyan-400" },
    { name: "B", color: "from-green-400 to-emerald-400" },
    { name: "C", color: "from-orange-400 to-red-400" },
  ];

  return (
    <div className="flex items-center gap-2">
      {avatars.map((avatar, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.1 }}
          whileHover={{ scale: 1.2, y: -5 }}
          className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatar.color} flex items-center justify-center text-white font-bold shadow-lg cursor-pointer`}
        >
          {avatar.name}
        </motion.div>
      ))}
      <motion.div
        whileHover={{ scale: 1.1 }}
        className="w-12 h-12 rounded-full border-2 border-dashed border-gray-400 dark:border-gray-600 flex items-center justify-center text-gray-400 text-xl cursor-pointer"
      >
        +
      </motion.div>
    </div>
  );
}

function LeaveManagementDemo() {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const dates = [15, 16, 17, 18, 19];

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-3">
        {dates.map((date) => (
          <motion.div
            key={date}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedDate(date)}
            animate={{
              backgroundColor: selectedDate === date ? "#10b981" : "#ffffff",
              color: selectedDate === date ? "#ffffff" : "#000000",
            }}
            className="flex-1 aspect-square rounded-xl flex items-center justify-center font-bold cursor-pointer shadow-md dark:bg-gray-800"
          >
            {date}
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: selectedDate ? 1 : 0 }}
        className="text-xs text-center text-green-600 dark:text-green-400 font-medium"
      >
        {selectedDate && "Leave requested for Jan " + selectedDate}
      </motion.div>
    </div>
  );
}

function ProgressTrackingDemo() {
  const metrics = [
    { label: "Tasks", value: 45, color: "bg-blue-500" },
    { label: "Done", value: 32, color: "bg-green-500" },
    { label: "Team", value: 8, color: "bg-purple-500" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 w-full">
      {metrics.map((metric, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-md cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: idx * 0.1 + 0.2, type: "spring" }}
            className={`${metric.color} text-white text-2xl font-bold mb-1`}
          >
            {metric.value}
          </motion.div>
          <p className="text-xs text-muted-foreground">{metric.label}</p>
        </motion.div>
      ))}
    </div>
  );
}