'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const isExternalLink = (href: string) => {
  return href.startsWith('http') || href.startsWith('https')
}

const FooterLink = ({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) => {
  if (isExternalLink(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block py-2 text-white"
      >
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className="block py-2 text-white">
      {children}
    </Link>
  )
}

export default function Footer() {
  const [openSection, setOpenSection] = useState<string | null>(null)

  return (
    <Card className="flex w-full flex-row items-center rounded-none bg-slate-900 backdrop-blur">
      {/* Logo */}
      <CardContent className="w-1/2 py-8 md:w-1/4">
        <Image
          src="/horizontal-logo.svg"
          alt="Logo"
          width={120}
          height={120}
          className="h-[120px] w-auto"
        />
      </CardContent>

      {/* Mobile Links */}
      <div className="w-1/2 px-4 md:hidden">
        {/* Platform Section */}
        <div className="border-b border-slate-800">
          <Button
            variant="ghost"
            className="flex w-full items-center justify-between py-4"
            onClick={() =>
              setOpenSection(openSection === 'platform' ? null : 'platform')
            }
          >
            <span className="text-white">Platform</span>
            <ChevronDown className="h-5 w-5" />
          </Button>
          {openSection === 'platform' && (
            <div className="bg-slate-800 p-4">
              <FooterLink href="/properties">Browse Properties</FooterLink>
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
            className="flex w-full items-center justify-between py-4"
            onClick={() =>
              setOpenSection(openSection === 'connect' ? null : 'connect')
            }
          >
            <span className="text-white">Connect</span>
            <ChevronDown className="h-5 w-5" />
          </Button>
          {openSection === 'connect' && (
            <div className="bg-slate-800 p-4">
              <FooterLink href="https://twitter.com/BricksOnChain">
                Twitter
              </FooterLink>
              <FooterLink href="https://discord.gg/bricksonchain">
                Discord
              </FooterLink>
              <FooterLink href="https://docs.bricksonchain.com">
                Documentation
              </FooterLink>
            </div>
          )}
        </div>

        {/* Legal Section */}
        <div className="border-b border-slate-800">
          <Button
            variant="ghost"
            className="flex w-full items-center justify-between py-4"
            onClick={() =>
              setOpenSection(openSection === 'legal' ? null : 'legal')
            }
          >
            <span className="text-white">Legal</span>
            <ChevronDown className="h-5 w-5" />
          </Button>
          {openSection === 'legal' && (
            <div className="bg-slate-800 p-4">
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/disclaimer">Risk Disclaimer</FooterLink>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Links - Hidden on Mobile */}
      <div className="hidden w-3/4 justify-evenly px-12 py-14 md:flex">
        {/* Platform */}
        <div>
          <h2 className="mb-4 font-bold text-white">Platform</h2>
          <div className="flex flex-col gap-2">
            <FooterLink href="/properties">Browse Properties</FooterLink>
            <FooterLink href="/dashboard">My Investments</FooterLink>
            <FooterLink href="/governance">Governance</FooterLink>
            <FooterLink href="/about">About Us</FooterLink>
          </div>
        </div>

        {/* Connect */}
        <div>
          <h2 className="mb-4 font-bold text-white">Connect</h2>
          <div className="flex flex-col gap-2">
            <FooterLink href="https://twitter.com/BricksOnChain">
              Twitter
            </FooterLink>
            <FooterLink href="https://discord.gg/bricksonchain">
              Discord
            </FooterLink>
            <FooterLink href="https://docs.bricksonchain.com">
              Documentation
            </FooterLink>
          </div>
        </div>

        {/* Legal */}
        <div>
          <h2 className="mb-4 font-bold text-white">Legal</h2>
          <div className="flex flex-col gap-2">
            <FooterLink href="/terms">Terms of Service</FooterLink>
            <FooterLink href="/privacy">Privacy Policy</FooterLink>
            <FooterLink href="/disclaimer">Risk Disclaimer</FooterLink>
          </div>
        </div>
      </div>
    </Card>
  )
}
