"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, Settings, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme"
import { WalletButton } from "@/components/providers"

const navItems = [
  { name: "Properties", path: "/properties" },
  { name: "Dashboard", path: "/dashboard" },
  { name: "Admin", path: "/admin" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false)
  const pathname = usePathname()
  
  const toggleMenu = () => setIsOpen(!isOpen)

  const navVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 }
  }

  return (
    <React.Suspense fallback={null}>
        <motion.nav 
            className="fixed top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            initial="hidden"
            animate="visible"
            variants={navVariants}
        >
            <div className="container flex h-16 items-center justify-between">
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                <Link href="/" className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-primary">BricksOnChain</span>
                </Link>
                </motion.div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex md:items-center md:space-x-6">
                    {navItems.map((item) => (
                        <motion.div
                            key={item.path}
                            variants={itemVariants}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                        <Link
                            href={item.path}
                            className={cn(
                            "text-sm font-medium transition-colors hover:text-primary",
                            pathname === item.path 
                                ? "text-primary" 
                                : "text-muted-foreground"
                            )}
                        >
                            {item.name}
                        </Link>
                        </motion.div>
                    ))}
                    <ThemeToggle />
                    <motion.div variants={itemVariants}>
                        <Button 
                            variant="outline" 
                            size="icon"
                            className="relative w-10 h-10 hover:bg-background"
                            asChild
                        >
                            <Link href="/dashboard/settings">
                                <Settings size={24} />
                            </Link>
                        </Button>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <WalletButton />
                    </motion.div>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center space-x-4">
                    <ThemeToggle />
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={toggleMenu}
                    >
                        <AnimatePresence mode="wait">
                            {isOpen ? (
                                <motion.div
                                    key="close"
                                    initial={{ rotate: -90 }}
                                    animate={{ rotate: 0 }}
                                    exit={{ rotate: 90 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <X className="w-6 h-6" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="menu"
                                    initial={{ rotate: 90 }}
                                    animate={{ rotate: 0 }}
                                    exit={{ rotate: -90 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Menu className="w-6 h-6" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="md:hidden border-t"
                >
                    <div className="container py-4 space-y-4">
                    {navItems.map((item) => (
                        <motion.div
                        key={item.path}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        >
                        <Link
                            href={item.path}
                            className={cn(
                            "block py-2 text-base font-medium transition-colors hover:text-primary",
                            pathname === item.path 
                                ? "text-primary" 
                                : "text-muted-foreground"
                            )}
                            onClick={() => setIsOpen(false)}
                        >
                            {item.name}
                        </Link>
                        </motion.div>
                    ))}
                    <motion.div
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="pt-4"
                    >
                        <Button className="w-full bg-primary hover:bg-primary/90">
                        Connect Wallet
                        </Button>
                    </motion.div>
                    </div>
                </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    </React.Suspense>
  )
}