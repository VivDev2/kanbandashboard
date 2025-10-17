import { motion } from "framer-motion";
import { Sparkles, Shield, Zap, Globe, Clock, BarChart } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Insights",
      description: "Smart suggestions and automated workflows that adapt to your team's patterns.",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption and compliance with SOC 2, GDPR, and HIPAA standards.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Built for speed with real-time sync across all devices and team members.",
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Work from anywhere with offline support and multi-language capabilities.",
    },
    {
      icon: Clock,
      title: "Time Tracking",
      description: "Automatic time tracking with detailed reports and billing integration.",
    },
    {
      icon: BarChart,
      title: "Advanced Analytics",
      description: "Deep insights into productivity, bottlenecks, and team performance metrics.",
    },
  ];

  return (
    <section className="py-24 px-4 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4"
          >
            ✨ Powerful Features
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Built for Modern Teams
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage tasks, collaborate effectively, and scale your operations.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <div className="h-full bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-2xl">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 group-hover:shadow-lg"
                >
                  <feature.icon className="h-7 w-7 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}