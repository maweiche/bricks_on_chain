import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  },
}

export function CTASection() {
  return (
    <section className="relative min-h-[80vh] w-full overflow-hidden bg-gradient-to-r from-secondary/50 to-primary/50 overflow-hidden">
      {/* Background decoration */}
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        className="absolute inset-0 overflow-hidden"
      >
        <div className="absolute right-0 top-0 h-1/3 w-1/3 -translate-y-1/2 translate-x-1/2 transform rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-1/3 w-1/3 -translate-x-1/2 translate-y-1/2 transform rounded-full bg-white/5 blur-3xl" />
      </motion.div>

      {/* Slanted Overlay Top */}
      <div
        className="hidden md:block absolute -top-[50px] left-0 right-0 h-[50px] bg-background "
        style={{
          transform: 'skewY(2deg)',
          transformOrigin: 'bottom left',
        }}
      />

      {/* Slanted Overlay Bottom */}
      <div
        className="hidden md:block absolute -bottom-[50px] left-0 right-0 h-[125px] bg-background "
        style={{
          transform: 'skewY(2deg)',
          transformOrigin: 'bottom left',
        }}
      />

      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        className="container mx-auto h-full"
      >
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          className="grid min-h-[80vh] grid-cols-1 items-center gap-12 py-20 lg:grid-cols-2"
        >
          {/* Left column - Content */}
          <motion.div
            className="space-y-6 text-white"
            initial="initial"
            animate="animate"
            variants={{
              initial: {},
              animate: {
                transition: {
                  staggerChildren: 0.2,
                },
              },
            }}
          >
            <motion.h1
              className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl"
              variants={fadeInUp}
            >
              Invest in properties from the{' '}
              <span className="text-secondary">comfort of home</span>
            </motion.h1>

            <motion.p
              className="max-w-xl text-lg text-white dark:text-blue-100/90 md:text-xl"
              variants={fadeInUp}
            >
              Our platform gives you the opportunity to own real estate in just
              a few clicks, all without having to go through the traditional
              process.
            </motion.p>

            <motion.div className="flex flex-wrap gap-4" variants={fadeInUp}>
              <Button
                size="lg"
                className="group transform bg-white text-indigo-600 transition-all hover:scale-105 hover:bg-blue-50"
                onClick={() => console.log('Explore Properties')}
              >
                Explore Properties
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>

            <motion.div className="flex gap-8 pt-8" variants={fadeInUp}>
              {[
                { value: '$50M+', label: 'Assets Under Management' },
                { value: '1000+', label: 'Active Investors' },
                { value: '15%', label: 'Avg. Annual Returns' },
              ].map((stat, index) => (
                <div key={index} className="space-y-1">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-blue-100/80">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right column - Animated Illustration */}
          <motion.div
            className="relative flex h-full items-center justify-center"
            initial="initial"
            animate="animate"
          >
            <motion.div
              className="relative w-full max-w-2xl"
              variants={floatingAnimation}
            >
              <div className="relative aspect-[4/3] rounded-2xl bg-white/10 p-8 backdrop-blur-lg">
                <svg
                  viewBox="0 0 400 300"
                  className="h-full w-full"
                  style={{ overflow: 'visible' }}
                >
                  {/* Desk */}
                  <motion.g
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <rect
                      x="40"
                      y="180"
                      width="320"
                      height="12"
                      rx="2"
                      fill="white"
                      opacity="0.9"
                    />
                    <rect
                      x="50"
                      y="192"
                      width="20"
                      height="80"
                      rx="2"
                      fill="white"
                      opacity="0.8"
                    />
                    <rect
                      x="330"
                      y="192"
                      width="20"
                      height="80"
                      rx="2"
                      fill="white"
                      opacity="0.8"
                    />
                  </motion.g>

                  {/* Laptop */}
                  <motion.g
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {/* Base */}
                    <rect
                      x="140"
                      y="170"
                      width="160"
                      height="10"
                      rx="2"
                      fill="#1D4ED8"
                    />
                    {/* Screen */}
                    <g transform="translate(150, 90)">
                      <rect width="140" height="80" rx="4" fill="#2563EB" />
                      <rect
                        x="10"
                        y="10"
                        width="120"
                        height="50"
                        rx="2"
                        fill="white"
                        opacity="0.1"
                      />
                      <circle
                        cx="70"
                        cy="70"
                        r="2"
                        fill="white"
                        opacity="0.5"
                      />
                    </g>
                  </motion.g>

                  {/* Coffee Cup */}
                  <motion.g
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <g transform="translate(80, 150)">
                      <rect
                        width="24"
                        height="30"
                        rx="3"
                        fill="white"
                        opacity="0.9"
                      />
                      <rect
                        x="6"
                        y="-5"
                        width="12"
                        height="4"
                        rx="1"
                        fill="white"
                        opacity="0.7"
                      />
                      <path
                        d="M8,10 Q12,15 16,10"
                        stroke="white"
                        opacity="0.5"
                        fill="none"
                      />
                    </g>
                  </motion.g>

                  {/* Plant */}
                  <motion.g
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <g transform="translate(320, 120)">
                      <rect
                        x="0"
                        y="30"
                        width="30"
                        height="30"
                        rx="4"
                        fill="white"
                        opacity="0.8"
                      />
                      <path
                        d="M15,30 Q5,15 15,5 Q25,15 15,30"
                        fill="#4ADE80"
                        opacity="0.9"
                      />
                      <path
                        d="M15,25 Q25,10 15,0 Q5,10 15,25"
                        fill="#4ADE80"
                        opacity="0.9"
                      />
                    </g>
                  </motion.g>

                  {/* Decorative Elements */}
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <circle cx="50" cy="50" r="20" fill="white" opacity="0.1" />
                    <circle
                      cx="350"
                      cy="100"
                      r="15"
                      fill="white"
                      opacity="0.1"
                    />
                    <rect
                      x="80"
                      y="80"
                      width="30"
                      height="30"
                      rx="8"
                      fill="white"
                      opacity="0.1"
                    />
                  </motion.g>
                </svg>

                {/* Floating UI Elements */}
                <motion.div
                  animate={{
                    y: [-10, 10],
                    transition: {
                      duration: 2,
                      repeat: Infinity,
                      repeatType: 'reverse',
                    },
                  }}
                  className="absolute right-1/4 top-1/4"
                >
                  <div className="h-12 w-12 rounded-xl bg-blue-400/20 backdrop-blur-sm" />
                </motion.div>

                <motion.div
                  animate={{
                    y: [10, -10],
                    transition: {
                      duration: 3,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      delay: 0.5,
                    },
                  }}
                  className="absolute bottom-1/3 left-1/4"
                >
                  <div className="h-16 w-16 rounded-full bg-indigo-400/20 backdrop-blur-sm" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
