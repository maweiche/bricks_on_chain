import { toast } from '@/hooks/use-toast'
import { User, useStore } from '@/lib/store'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  ChevronDown,
  Copy,
  LogOut,
  Settings,
  IdCard,
  Vote,
  LockKeyhole,
} from 'lucide-react'
import { IconCurrencyDollar, IconCurrencySolana } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSolanaPrice } from '@/hooks/use-solana-price'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '@/components/providers'
import { USDC_MINT } from '@/components/solana'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { rpcManager } from '@/lib/rpc/rpc-manager'

const UserDropdown = ({ user }: { user: User }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { publicKey, disconnect } = useWallet()
  const [userBalance, setUserBalance] = useState({ sol: 0, usdc: 0 })
  const router = useRouter()
  const logout = useStore((state) => state.disconnect)
  const { solToUsd } = useSolanaPrice()

  useEffect(() => {
    const getBalances = async (pubKey: PublicKey) => {
      try {
        const connection = rpcManager.getConnection()
        const balance = await connection.getBalance(pubKey)
        const usdcAta = await getAssociatedTokenAddress(
          new PublicKey(USDC_MINT),
          pubKey
        )
        const usdcBalance = await connection.getBalance(usdcAta)

        setUserBalance({
          sol: balance / LAMPORTS_PER_SOL,
          usdc: usdcBalance,
        })
      } catch (error) {
        console.error('Failed to fetch balances:', error)
      }
    }

    if (publicKey) {
      getBalances(publicKey)
    }
  }, [publicKey])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied to clipboard',
      description: text,
    })
  }

  const handleLogout = async () => {
    await disconnect(), logout(), router.push('/')
    toast({
      title: 'Logged out',
      description: 'Successfully logged out',
    })
  }

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div
          className="flex cursor-pointer items-center gap-2"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <Avatar>
            <AvatarImage src={user.pfp} alt={user.name} />
            <AvatarFallback>
              <div className="h-16 w-16 rounded-3xl bg-black dark:bg-white"></div>
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="text-secondary" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="flex w-screen flex-col items-center rounded-3xl border border-zinc-300 bg-white p-4 dark:border-zinc-700 dark:bg-white md:w-[340px]"
      >
        {/* User Profile Section */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.pfp} alt={user.name} />
            <AvatarFallback>
              <div className="h-16 w-16 rounded-3xl bg-black dark:bg-white"></div>
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-3xl font-semibold text-secondary">
              {user?.name || `User_${user?.address.slice(-4)}`}
            </h2>
            <div className="flex items-center text-gray-500">
              <span className="mr-1 truncate">
                {user?.address?.slice(0, 4)}...{user?.address.slice(-4)}
              </span>
              <Copy
                className="ml-2 cursor-pointer"
                onClick={() => copyToClipboard(user?.address)}
              />
            </div>
          </div>
        </div>

        {/* Site Navigation */}
        <div className="mb-2 mt-2 grid w-full grid-cols-2 items-center rounded-2xl border border-zinc-300 p-2 dark:border-zinc-600">
          <DropdownMenuItem
            className="flex w-fit cursor-pointer flex-row items-center gap-2 rounded-full px-4 text-secondary hover:bg-slate-200"
            onClick={() => router.push('/dashboard/settings')}
          >
            <Settings size={24} />
            <span className="text-lg font-semibold">Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex w-fit cursor-pointer flex-row items-center gap-2 rounded-full px-4 text-secondary hover:bg-slate-200"
            onClick={() => router.push('/dashboard')}
          >
            <IdCard size={24} />
            <span className="text-lg font-semibold">Dashboard</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex w-fit cursor-pointer flex-row items-center gap-2 rounded-full px-4 text-secondary hover:bg-slate-200"
            onClick={() => router.push('/union')}
          >
            <Vote size={24} />
            <span className="text-lg font-semibold">Governance</span>
          </DropdownMenuItem>
          {user.role === 'admin' && (
            <DropdownMenuItem
              className="flex w-fit cursor-pointer flex-row items-center gap-2 rounded-full px-4 text-secondary hover:bg-slate-200"
              onClick={() => router.push('/admin')}
            >
              <LockKeyhole size={24} />
              <span className="text-lg font-semibold">Admin</span>
            </DropdownMenuItem>
          )}
        </div>

        {/* Wallet Balance / Buying Power */}
        <div className="w-full rounded-3xl border border-zinc-300 bg-transparent p-4 dark:border-zinc-600">
          <div className="flex items-center justify-between">
            <div className="text-secondary">Buying power</div>
            <div className="text-xl font-bold text-secondary">
              $
              {userBalance.sol
                ? (solToUsd(userBalance.sol) + userBalance.usdc).toFixed(2)
                : '0.00'}
            </div>
          </div>
          <div className="mt-2 flex items-center">
            <div className="flex flex-1 items-center gap-2 text-secondary">
              <div className="bg-bg h-4 w-4 rounded-full border border-solid border-[#D4D4D8]">
                <IconCurrencySolana className="h-4 w-4" />
              </div>
              <span>{userBalance.sol.toFixed(4)} SOL</span>
            </div>
            <div className="text-zinc-500">
              ${solToUsd(userBalance.sol).toFixed(2)}
            </div>
          </div>
          <div className="mt-2 flex items-center">
            <div className="flex flex-1 items-center gap-2 text-secondary">
              <div className="bg-bg h-4 w-4 rounded-full border border-solid border-[#D4D4D8]">
                <IconCurrencyDollar className="h-full w-full" />
              </div>
              <span>{userBalance.usdc} USDC</span>
            </div>
          </div>
          <div className="mt-2 flex flex-col items-center justify-center">
            <WalletButton />
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="destructive"
          className="mt-4 w-full"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserDropdown
