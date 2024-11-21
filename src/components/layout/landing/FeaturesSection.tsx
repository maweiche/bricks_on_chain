import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { 
    Link,
  Replace,
  UsersIcon, 
  VoteIcon, 
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Feature {
  title: string
  description: string
  icon: React.ReactNode
  gradient: string
}

const features: Feature[] = [
  {
    title: "Property Tokenization",
    description: "Real estate assets are converted into digital tokens on the blockchain",
    icon: <Link className="h-6 w-6" />,
    gradient: "from-purple-500 to-indigo-500"
  },
  {
    title: "Fractional Ownership",
    description: "Invest in properties with minimal capital through token ownership",
    icon: <UsersIcon className="h-6 w-6" />,
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    title: "Governance Rights",
    description: "Token holders participate in property decisions through voting",
    icon: <VoteIcon className="h-6 w-6" />,
    gradient: "from-emerald-500 to-green-500"
  },
  {
    title: "Liquidity",
    description: "Trade property tokens easily on our platform",
    icon: <Replace className="h-6 w-6" />,
    gradient: "from-orange-500 to-yellow-500"
  }
]

const containerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const featureVariants = {
  initial: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      duration: 0.8
    }
  }
}

function FeatureCard({ title, description, icon, gradient, index }: Feature & { index: number }) {
  return (
    <motion.div
      variants={featureVariants}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      className="group relative"
    >
      {/* Animated background gradient */}
      <div 
        className={cn(
          "absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 blur-xl transition-opacity duration-500",
          gradient,
          "group-hover:opacity-30"
        )}
      />

      {/* Card content */}
      <div className="relative rounded-2xl border bg-card p-6 shadow-lg transition-shadow hover:shadow-xl">
        {/* Icon with animated background */}
        <div className="mb-4">
          <div className={cn(
            "inline-flex rounded-lg p-3 bg-gradient-to-br",
            gradient,
            "ring-2 ring-white/20"
          )}>
            {icon}
          </div>
        </div>

        {/* Step indicator */}
        <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
          {index + 1}
        </div>

        {/* Text content */}
        <h3 className="mb-2 font-semibold tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>

        {/* Connecting lines between cards */}
        {index < features.length - 1 && (
          <motion.div
            className="absolute -right-4 top-1/2 hidden h-px w-8 bg-gradient-to-r from-transparent to-border lg:block"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
          />
        )}
      </div>
    </motion.div>
  )
}

export function FeaturesSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-500 opacity-20 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-96 w-96 translate-x-1/2 rounded-full bg-blue-500 opacity-20 blur-3xl" />
      </div>

      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={containerVariants}
        className="container px-4 mx-auto"
      >
        {/* Section header */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block rounded-full bg-primary/10 px-4 py-1.5 mb-4"
          >
            <span className="text-lg font-medium text-primary">
              How it Works
            </span>
          </motion.div>
          <h2 className="text-3xl font-bold sm:text-4xl">
            Revolutionizing Real Estate Investment
          </h2>
        </div>

        {/* Features grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <FeatureCard 
              key={feature.title} 
              {...feature} 
              index={index} 
            />
          ))}
        </div>

        {/* Optional: Add a CTA button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Button variant="default" size="lg">
            Start Investing
          </Button>
        </motion.div>
      </motion.div>
    </section>
  )
}