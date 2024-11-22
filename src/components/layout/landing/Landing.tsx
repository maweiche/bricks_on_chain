'use client'

import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { motion, Transition, Variants } from 'framer-motion'
import {
  BarChart3,
  Building2,
  ChevronRight,
  Coins,
  LucideIcon,
  Users,
} from 'lucide-react'

import { WalletButton } from '../../providers'
import { Badge } from '../../ui/badge'
import Cursor from '../../ui/cursor'
import { ModelLoader } from './ModelLoader'
import { FeaturesSection } from './FeaturesSection'
import HeroSection from './HeroSection'

const PropertiesFeatured = dynamic(
  () => import('../../properties/PropertiesFeatured')
)

interface FeatureItem {
  icon: LucideIcon
  title: string
  description: string
  color: 'blue' | 'emerald' | 'purple' | 'rose'
}

interface FeatureCardProps extends FeatureItem {
  index: number
}

const fadeIn: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const containerVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const springTransition: Transition = {
  type: 'spring',
  damping: 20,
  stiffness: 300,
}

const defaultTransition: Transition = {
  duration: 0.5,
}

const features: FeatureItem[] = [
  {
    icon: Building2,
    title: 'Fractional Ownership',
    description:
      'Own a piece of premium real estate properties through tokenization',
    color: 'blue',
  },
  {
    icon: Coins,
    title: 'Low Entry Barrier',
    description:
      'Start investing with any amount and grow your portfolio gradually',
    color: 'emerald',
  },
  {
    icon: Users,
    title: 'Community Governance',
    description:
      'Participate in property decisions through decentralized voting',
    color: 'purple',
  },
  {
    icon: BarChart3,
    title: 'Track Performance',
    description: 'Monitor your investments and returns in real-time',
    color: 'rose',
  },
]

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  color,
  index,
}) => (
  <motion.div
    initial="initial"
    whileInView="animate"
    variants={fadeIn}
    transition={{
      ...defaultTransition,
      delay: index * 0.1,
    }}
    viewport={{ once: true }}
    whileHover={{ scale: 1.02 }}
    className="rounded-xl bg-slate-700/30 p-6 backdrop-blur transition-colors hover:bg-slate-700/40"
  >
    <div
      className={`mb-4 h-12 w-12 rounded-lg bg-${color}-500/20 flex items-center justify-center`}
    >
      <Icon className={`text-${color}-400`} />
    </div>
    <h3 className="mb-2 text-xl font-semibold">{title}</h3>
    <p className="text-slate-300">{description}</p>
  </motion.div>
)

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Spotlight Effect for Cursor */}
      <Cursor className="hidden md:block" />

      {/* Hero Section */}
      <HeroSection />

      {/* Featured Properties */}
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={containerVariants}
        className="flex w-full flex-col items-center justify-center pb-2"
        id="properties"
      >
        <PropertiesFeatured />
      </motion.div>

      {/* How it Works Feature */}
      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={containerVariants}
        className="mt-12 flex flex-col items-center justify-center py-2"
        id="features"
      >
        <FeaturesSection />
      </motion.div>

      {/* Three JS How it Works Section */}
      {/* <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={containerVariants}
        className="w-full flex flex-col items-center"
        id="features"
      >
        <Suspense fallback={<ModelLoader />}>
          <Badge
            className="rounded-full bg-muted px-4 py-2 text-3xl text-secondary w-fit"
            style={{ transform: 'translateY(-50%)' }}
          >
            How it Works
          </Badge>
          <FeaturesSection />
        </Suspense>
      </motion.div> */}
    </div>
  )
}
