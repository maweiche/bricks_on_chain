import React from 'react'
import { Users } from 'lucide-react'
import { useStore } from '@/lib/store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { WalletButton } from '@/components/providers'
import { motion } from 'framer-motion'

const DevAuthButton = () => {
  const simulateAuth = useStore(state => state.simulateAuth)
  
  const simulateUser = () => {
    // Simulate logging in as the first user from users.json
    const testUser = {
        address: "7wK3jPMYjpZHZAghjersW6hBNMgi9VAGr75AhYRqR2n",
        name: "Matt",
        email: "maweiche@gmail.com",
        id: "user_1732106067757",
        joinedAt: new Date("2024-11-20T12:34:27.757Z"),
        role: "admin" as "admin",
        settings: {
          notifications: {
            email: false,
            push: false,
            investmentUpdates: false,
            marketingUpdates: false
          },
          theme: "light" as "light",
          display: {
            compactView: true,
            showProfitLoss: false,
            currency: "USD" as "USD"
          }
        },
        investments: [
          {
            id: "inv_1732133421112_prop_1",
            propertyId: "prop_1",
            amount: 100,
            fractionCount: 1,
            purchaseDate: new Date("2024-11-20T20:10:21.112Z"),
            status: "active" as "active",
            transactionSignature: "1732133421112_c4u9c",
            wallet: "7wK3jPMYjpZHZAghjersW6hBNMgi9VAGr75AhYRqR2n"
          },
          {
            id: "inv_1732133464899_prop_1",
            propertyId: "prop_1",
            amount: 100,
            fractionCount: 1,
            purchaseDate: new Date("2024-11-20T20:11:04.899Z"),
            status: "active" as "active",
            transactionSignature: "1732133464899_ug7ffo",
            wallet: "7wK3jPMYjpZHZAghjersW6hBNMgi9VAGr75AhYRqR2n"
          },
        ]
    }
    simulateAuth(testUser)
  }

  // Only show this component in development
  // if (process.env.NODE_ENV !== 'development') {
  //   return <WalletButton />
  // }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span>Connect</span>
          </motion.div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 h-fit py-6 flex flex-col gap-2 items-center justify-center">
        <DropdownMenuItem className="cursor-pointer text-sm" onClick={simulateUser}>
          <Users className="w-4 h-4 mr-2" />
          Connect as Test User
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer h-24 overflow hidden" asChild>
          <WalletButton className="w-full justify-start" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DevAuthButton