"use client";

import React from 'react';
import { motion, Variants, Transition } from 'framer-motion';
import { WalletButton } from '../providers';
import { Building2, Users, Coins, ChevronRight, BarChart3, LucideIcon } from 'lucide-react';

// Types
interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
  color: 'blue' | 'emerald' | 'purple' | 'rose';
}

interface FeatureCardProps extends FeatureItem {
  index: number;
}

// Animation variants
const fadeIn: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

const containerVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

// Transition configurations
const springTransition: Transition = {
  type: "spring",
  damping: 20,
  stiffness: 300
};

const defaultTransition: Transition = {
  duration: 0.5
};

// Features data
const features: FeatureItem[] = [
  {
    icon: Building2,
    title: "Fractional Ownership",
    description: "Own a piece of premium real estate properties through tokenization",
    color: "blue"
  },
  {
    icon: Coins,
    title: "Low Entry Barrier",
    description: "Start investing with any amount and grow your portfolio gradually",
    color: "emerald"
  },
  {
    icon: Users,
    title: "Community Governance",
    description: "Participate in property decisions through decentralized voting",
    color: "purple"
  },
  {
    icon: BarChart3,
    title: "Track Performance",
    description: "Monitor your investments and returns in real-time",
    color: "rose"
  }
];

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, color, index }) => (
  <motion.div
    initial="initial"
    whileInView="animate"
    variants={fadeIn}
    transition={{
      ...defaultTransition,
      delay: index * 0.1
    }}
    viewport={{ once: true }}
    whileHover={{ scale: 1.02 }}
    className="p-6 rounded-xl bg-slate-700/30 backdrop-blur hover:bg-slate-700/40 transition-colors"
  >
    <div className={`w-12 h-12 mb-4 rounded-lg bg-${color}-500/20 flex items-center justify-center`}>
      <Icon className={`text-${color}-400`} />
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-slate-300">{description}</p>
  </motion.div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-32">
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          transition={defaultTransition}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.h1
            variants={fadeIn}
            initial="initial"
            animate="animate"
            transition={{
              ...defaultTransition,
              delay: 0.2
            }}
            className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400"
          >
            Invest in Real Estate,
            <br />Token by Token
          </motion.h1>
          
          <motion.p
            variants={fadeIn}
            initial="initial"
            animate="animate"
            transition={{
              ...defaultTransition,
              delay: 0.4
            }}
            className="text-xl text-slate-300 mb-8"
          >
            Join the future of property investment through blockchain-powered fractional ownership.
            Start building your real estate portfolio with as little as you want.
          </motion.p>
          
          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            transition={{
              ...defaultTransition,
              delay: 0.6
            }}
            className="flex justify-center gap-4"
          >
            <WalletButton />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={springTransition}
              className="flex items-center gap-2 px-6 py-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Learn More <ChevronRight size={20} />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section */}
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={containerVariants}
        className="bg-slate-800/50 py-24"
      >
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} index={index} />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}