'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { motion, Variants } from 'framer-motion'

import Cursor from '../../ui/cursor'
import { FeaturesSection } from './FeaturesSection'
import HeroSection from './HeroSection'
import FAQSection from './FAQSection'
import { CTASection } from './CTASection'

const PropertiesFeatured = dynamic(
  () => import('../../properties/PropertiesFeatured')
)

const containerVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

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

      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={containerVariants}
        className="mt-12 flex flex-col items-center justify-center py-2"
        id="features"
      >
        <CTASection />
      </motion.div>

      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={containerVariants}
        className="mt-12 flex flex-col items-center justify-center py-2"
        id="features"
      >
        <FAQSection />
      </motion.div>
    </div>
  )
}
