"use client";

import { motion } from 'framer-motion';
import { Suspense } from 'react';
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Building2, Mail, MessageSquare } from 'lucide-react';

const footerAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemAnimation = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export default function Footer() {
  const handleCopy = (email: string) => {
    navigator.clipboard.writeText(email);
    // You might want to add a toast notification here
  };

  return (
    <Suspense fallback={<div />}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={footerAnimation}
        className='w-full h-full flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur'
      >
        <Card className="w-full self-center overflow-hidden rounded-none flex flex-row justify-center md:justify-between md:py-14 items-start w-full bg-slate-900/50 backdrop-blur md:px-12">
          <CardContent className="flex flex-col py-4 gap-4 items-center w-1/2">
            <motion.image
              className="flex flex-row md:gap-6 items-center"
              variants={itemAnimation}
            >
              <Image
                src="/logo.svg"
                alt="Logo"
                width={120}
                height={120}
              />
            </motion.image>
            
            {/* <motion.div 
              className="flex flex-row gap-14 items-center justify-center align-center"
              variants={itemAnimation}
            >
              <Image
                src="/assets/footer/solana-icon.webp"
                alt="Solana"
                width={60}
                height={60}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
              <div className="h-14 w-[1px] bg-slate-600" />
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 bg-blue-500/20 rounded-lg text-blue-400 font-medium"
              >
                Built on Solana
              </motion.div>
            </motion.div> */}
          </CardContent>

          <CardFooter className="flex-row items-center w-1/2 md:w-3/4 md:gap-16 justify-evenly items-start">
            <motion.div 
              className="flex flex-col justify-start mt-4"
              variants={itemAnimation}
            >
              <h2 className="font-bold text-white mb-4">Platform</h2>
              <ul className="space-y-3">
                <motion.li variants={itemAnimation}>
                  <a href="/marketplace" className="text-slate-300 hover:text-white transition-colors">
                    Browse Properties
                  </a>
                </motion.li>
                <motion.li variants={itemAnimation}>
                  <a href="/dashboard" className="text-slate-300 hover:text-white transition-colors">
                    My Investments
                  </a>
                </motion.li>
                <motion.li variants={itemAnimation}>
                  <a href="/governance" className="text-slate-300 hover:text-white transition-colors">
                    Governance
                  </a>
                </motion.li>
                <motion.li variants={itemAnimation}>
                  <a href="/about" className="text-slate-300 hover:text-white transition-colors">
                    About Us
                  </a>
                </motion.li>
              </ul>
            </motion.div>

            <motion.div 
              className="flex flex-col justify-start mt-4"
              variants={itemAnimation}
            >
              <h2 className="font-bold text-white mb-4">Connect</h2>
              <ul className="space-y-3">
                <motion.li variants={itemAnimation}>
                  <a href="https://twitter.com/BricksOnChain" 
                     className="text-slate-300 hover:text-white transition-colors"
                     target="_blank"
                     rel="noopener noreferrer"
                  >
                    Twitter
                  </a>
                </motion.li>
                <motion.li variants={itemAnimation}>
                  <a href="https://discord.gg/bricksonchain" 
                     className="text-slate-300 hover:text-white transition-colors"
                     target="_blank"
                     rel="noopener noreferrer"
                  >
                    Discord
                  </a>
                </motion.li>
                <motion.li variants={itemAnimation}>
                  <a 
                    onClick={() => handleCopy('contact@bricksonchain.com')}
                    className="text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Email Us
                  </a>
                </motion.li>
                <motion.li variants={itemAnimation}>
                  <a href="https://docs.bricksonchain.com"
                     className="text-slate-300 hover:text-white transition-colors"
                     target="_blank"
                     rel="noopener noreferrer"
                  >
                    Documentation
                  </a>
                </motion.li>
              </ul>
            </motion.div>

            <motion.div 
              className="flex flex-col justify-start mt-4"
              variants={itemAnimation}
            >
              <h2 className="font-bold text-white mb-4">Legal</h2>
              <ul className="space-y-3">
                <motion.li variants={itemAnimation}>
                  <a href="/terms" className="text-slate-300 hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </motion.li>
                <motion.li variants={itemAnimation}>
                  <a href="/privacy" className="text-slate-300 hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </motion.li>
                <motion.li variants={itemAnimation}>
                  <a href="/disclaimer" className="text-slate-300 hover:text-white transition-colors">
                    Risk Disclaimer
                  </a>
                </motion.li>
              </ul>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </Suspense>
  );
}