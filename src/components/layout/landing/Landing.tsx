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
      <Cursor className="hidden md:block" />
      {/* Hero Section */}
      <div className="container mx-auto h-[70vh] px-4 pb-32 pt-20">
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          transition={defaultTransition}
          className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-8 text-center"
        >
          <motion.image
            variants={fadeIn}
            initial="initial"
            animate="animate"
            transition={{
              ...defaultTransition,
              delay: 0.2,
            }}
          >
            <Image src="/logo.svg" alt="Logo" width={360} height={360} />
          </motion.image>

          <motion.p
            variants={fadeIn}
            initial="initial"
            animate="animate"
            transition={{
              ...defaultTransition,
              delay: 0.4,
            }}
            className="mb-8 text-xl text-secondary"
          >
            Fractional real estate ownership on Solana
          </motion.p>

          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            transition={{
              ...defaultTransition,
              delay: 0.6,
            }}
            className="flex justify-center gap-4"
          >
            <WalletButton />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={springTransition}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-muted transition-colors hover:bg-slate-600"
              onClick={() => {
                document
                  .getElementById('features')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Learn More <ChevronRight size={20} />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={containerVariants}
        className="mt-12 flex w-full flex-col items-center justify-center pt-24 pb-2"
        id="properties"
      >
        <PropertiesFeatured />
      </motion.div>

      {/* Features Section */}
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
