"use client"

import { Shield, Target, Users2, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export function About() {
  const stats = [
    { label: 'Students Supported', value: '10,000+' },
    { label: 'Partner NGOs', value: '50+' },
    { label: 'Monthly Events', value: '200+' },
    { label: 'Success Rate', value: '95%' },
  ]

  const values = [
    {
      icon: Shield,
      title: 'Confidential & Safe',
      description: 'Your privacy is our priority. All conversations and data are encrypted and secure.',
    },
    {
      icon: Target,
      title: 'Accessible Support',
      description: 'Mental health resources available 24/7, wherever you are.',
    },
    {
      icon: Users2,
      title: 'Community Driven',
      description: 'Connect with peers and professionals who understand your journey.',
    },
    {
      icon: Sparkles,
      title: 'Evidence-Based',
      description: 'Our programs are backed by research and proven therapeutic approaches.',
    },
  ]

  return (
    <section id="about" className="py-20 px-4 bg-white dark:bg-gray-900">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            About MindConnect
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            We're dedicated to breaking down barriers to mental health support for students.
            Our platform connects you with verified resources, supportive communities, and professional help.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {values.map((value, index) => {
            const Icon = value.icon
            return (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {value.description}
                </p>
              </div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
