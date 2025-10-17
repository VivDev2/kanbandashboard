import { motion } from "framer-motion";
import { Calendar, GitBranch, CheckCircle2, Circle, Clock } from "lucide-react";
import { useState } from "react";

interface TimelineNode {
  id: string;
  title: string;
  date: string;
  status: "completed" | "in-progress" | "pending";
  branches?: TimelineNode[]; // This is optional, so we need to handle it carefully
}

const timelineData: TimelineNode[] = [
  {
    id: "1",
    title: "Project Kickoff",
    date: "Jan 2024",
    status: "completed",
    branches: [
      {
        id: "1a",
        title: "Design Phase",
        date: "Feb 2024",
        status: "completed",
        branches: [
          {
            id: "1a1",
            title: "Wireframes",
            date: "Feb 5",
            status: "completed",
          },
          {
            id: "1a2",
            title: "UI Design",
            date: "Feb 15",
            status: "completed",
          },
        ],
      },
      {
        id: "1b",
        title: "Development Setup",
        date: "Feb 2024",
        status: "completed",
      },
    ],
  },
  {
    id: "2",
    title: "Development Sprint 1",
    date: "Mar 2024",
    status: "in-progress",
    branches: [
      {
        id: "2a",
        title: "Frontend Components",
        date: "Mar 10",
        status: "in-progress",
        branches: [
          {
            id: "2a1",
            title: "Navigation",
            date: "Mar 12",
            status: "completed",
          },
          {
            id: "2a2",
            title: "Dashboard",
            date: "Mar 18",
            status: "in-progress",
          },
        ],
      },
      {
        id: "2b",
        title: "Backend APIs",
        date: "Mar 15",
        status: "pending",
      },
    ],
  },
  {
    id: "3",
    title: "Testing & QA",
    date: "Apr 2024",
    status: "pending",
    branches: [
      {
        id: "3a",
        title: "Unit Tests",
        date: "Apr 5",
        status: "pending",
      },
      {
        id: "3b",
        title: "Integration Tests",
        date: "Apr 12",
        status: "pending",
      },
    ],
  },
  {
    id: "4",
    title: "Launch",
    date: "May 2024",
    status: "pending",
  },
];

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    case "in-progress":
      return <Clock className="w-5 h-5 text-blue-500" />;
    default:
      return <Circle className="w-5 h-5 text-gray-400" />;
  }
};

const TimelineNode = ({
  node,
  depth = 0,
  index = 0,
}: {
  node: TimelineNode;
  depth?: number;
  index?: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasBranches = node.branches && node.branches.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 + depth * 0.05 }}
      className="relative"
    >
      {/* Main Node */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        onClick={() => hasBranches && setIsExpanded(!isExpanded)}
        className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
          node.status === "completed"
            ? "border-green-500/30 bg-green-500/5"
            : node.status === "in-progress"
            ? "border-blue-500/30 bg-blue-500/5"
            : "border-gray-300/30 bg-gray-100/5 dark:bg-gray-800/5"
        }`}
        style={{ marginLeft: `${depth * 40}px` }}
      >
        {/* Branch Icon */}
        {depth > 0 && (
          <motion.div
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            className="absolute -left-5 top-6"
          >
            <GitBranch className="w-4 h-4 text-purple-500" />
          </motion.div>
        )}

        {/* Status Icon */}
        <div className="mt-1">
          <StatusIcon status={node.status} />
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{node.title}</h3>
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {node.date}
            </span>
          </div>

          {/* Progress Badge */}
          <div className="mt-2">
            <span
              className={`text-xs px-3 py-1 rounded-full font-medium ${
                node.status === "completed"
                  ? "bg-green-500/20 text-green-700 dark:text-green-400"
                  : node.status === "in-progress"
                  ? "bg-blue-500/20 text-blue-700 dark:text-blue-400"
                  : "bg-gray-500/20 text-gray-700 dark:text-gray-400"
              }`}
            >
              {node.status === "completed"
                ? "✓ Completed"
                : node.status === "in-progress"
                ? "◐ In Progress"
                : "○ Pending"}
            </span>
          </div>
        </div>

        {/* Expand Icon */}
        {hasBranches && (
          <motion.div
            animate={{ rotate: isExpanded ? 0 : -90 }}
            transition={{ duration: 0.3 }}
          >
            <GitBranch className="w-5 h-5 text-purple-500" />
          </motion.div>
        )}
      </motion.div>

      {/* Connecting Line to Branches */}
      {hasBranches && isExpanded && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          className="relative ml-6"
        >
          {/* Vertical line */}
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/50 to-transparent" />

          {/* Branch Nodes */}
          <div className="space-y-4 py-4">
            {node.branches!.map ((branch, idx) => ( // Use non-null assertion operator
              <div key={branch.id} className="relative">
                {/* Horizontal connecting line */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "20px" }}
                  transition={{ delay: 0.2 }}
                  className="absolute left-0 top-6 h-0.5 bg-purple-500/50"
                />
                <TimelineNode node={branch} depth={depth + 1} index={idx} />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default function ProjectTimeline() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900/20" />
      
      {/* Animated Background Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6"
          >
            <GitBranch className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-400">
              Project Timeline
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Track Projects with Timeline
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Visualize your project milestones with beautiful tree-like branch timelines.
            Track progress, manage dependencies, and never miss a deadline.
          </p>
        </motion.div>

        {/* Timeline Tree */}
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-xl"
          >
            <div className="space-y-6">
              {timelineData.map((node, idx) => (
                <TimelineNode key={node.id} node={node} index={idx} />
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
          >
            {[
              { label: "Total Milestones", value: "12", icon: Calendar },
              { label: "Completed", value: "6", icon: CheckCircle2 },
              { label: "In Progress", value: "3", icon: Clock },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center shadow-lg"
              >
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-purple-500" />
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}