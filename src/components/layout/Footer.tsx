'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const isExternalLink = (href: string) => {
  return href.startsWith('http') || href.startsWith('https');
};

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  if (isExternalLink(href)) {
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="block text-white py-2"
      >
        {children}
      </a>
    );
  }
  
  return (
    <Link href={href} className="block text-white py-2">
      {children}
    </Link>
  );
};

export default function Footer() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  return (
    <Card className="rounded-none bg-slate-900 backdrop-blur items-center flex flex-row w-full">
      {/* Logo */}
      <CardContent className="w-1/2 md:w-1/4 py-8">
        <Image src="/logo.svg" alt="Logo" width={120} height={120} />
      </CardContent>

      {/* Mobile Links */}
      <div className="w-1/2 px-4 md:hidden">
        {/* Platform Section */}
        <div className="border-b border-slate-800">
          <Button
            variant="ghost"
            className="w-full flex justify-between items-center py-4"
            onClick={() => setOpenSection(openSection === 'platform' ? null : 'platform')}
          >
            <span className="text-white">Platform</span>
            <ChevronDown className="w-5 h-5" />
          </Button>
          {openSection === 'platform' && (
            <div className="p-4 bg-slate-800">
              <FooterLink href="/marketplace">Browse Properties</FooterLink>
              <FooterLink href="/dashboard">My Investments</FooterLink>
              <FooterLink href="/governance">Governance</FooterLink>
              <FooterLink href="/about">About Us</FooterLink>
            </div>
          )}
        </div>

        {/* Connect Section */}
        <div className="border-b border-slate-800">
          <Button
            variant="ghost"
            className="w-full flex justify-between items-center py-4"
            onClick={() => setOpenSection(openSection === 'connect' ? null : 'connect')}
          >
            <span className="text-white">Connect</span>
            <ChevronDown className="w-5 h-5" />
          </Button>
          {openSection === 'connect' && (
            <div className="p-4 bg-slate-800">
              <FooterLink href="https://twitter.com/BricksOnChain">Twitter</FooterLink>
              <FooterLink href="https://discord.gg/bricksonchain">Discord</FooterLink>
              <FooterLink href="https://docs.bricksonchain.com">Documentation</FooterLink>
            </div>
          )}
        </div>

        {/* Legal Section */}
        <div className="border-b border-slate-800">
          <Button
            variant="ghost"
            className="w-full flex justify-between items-center py-4"
            onClick={() => setOpenSection(openSection === 'legal' ? null : 'legal')}
          >
            <span className="text-white">Legal</span>
            <ChevronDown className="w-5 h-5" />
          </Button>
          {openSection === 'legal' && (
            <div className="p-4 bg-slate-800">
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/disclaimer">Risk Disclaimer</FooterLink>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Links - Hidden on Mobile */}
      <div className="hidden md:flex w-3/4 justify-evenly py-14 px-12">
        {/* Platform */}
        <div>
          <h2 className="text-white font-bold mb-4">Platform</h2>
          <div className="flex flex-col gap-2">
            <FooterLink href="/marketplace">Browse Properties</FooterLink>
            <FooterLink href="/dashboard">My Investments</FooterLink>
            <FooterLink href="/governance">Governance</FooterLink>
            <FooterLink href="/about">About Us</FooterLink>
          </div>
        </div>

        {/* Connect */}
        <div>
          <h2 className="text-white font-bold mb-4">Connect</h2>
          <div className="flex flex-col gap-2">
            <FooterLink href="https://twitter.com/BricksOnChain">Twitter</FooterLink>
            <FooterLink href="https://discord.gg/bricksonchain">Discord</FooterLink>
            <FooterLink href="https://docs.bricksonchain.com">Documentation</FooterLink>
          </div>
        </div>

        {/* Legal */}
        <div>
          <h2 className="text-white font-bold mb-4">Legal</h2>
          <div className="flex flex-col gap-2">
            <FooterLink href="/terms">Terms of Service</FooterLink>
            <FooterLink href="/privacy">Privacy Policy</FooterLink>
            <FooterLink href="/disclaimer">Risk Disclaimer</FooterLink>
          </div>
        </div>
      </div>
    </Card>
  );
}