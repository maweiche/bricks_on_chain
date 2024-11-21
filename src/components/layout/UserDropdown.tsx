import { toast } from "@/hooks/use-toast";
import { User } from "@/lib/store";
import Link from "next/link"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { ChevronDown, Copy, Settings2, ListOrdered, LogOut, Settings, IdCard, Vote, LockKeyhole } from "lucide-react";
import { IconCurrencyDollar, IconCurrencySolana } from '@tabler/icons-react';
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useSolanaPrice } from "@/hooks/use-solana-price";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "../providers";

const UserDropdown = ({ user, userBalance }: { user: User, userBalance: any }) => {
    console.log('USER DROPDOWN ->', user);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { publicKey, disconnect } = useWallet();
    const router = useRouter();
    const copyToClipboard = (text: any) => {
      navigator.clipboard.writeText(text);
      toast({
        title: 'Copied to clipboard',
        description: text,
      });
    };

    const handleLogout = async () => {
        disconnect()
    }
        
    const {
        currentPrice,
        priceChange,
        dayRange,
        solToUsd,
        usdToSol,
        formatUsd,
        formatSol,
        isLoading,
        error,
        lastUpdate
      } = useSolanaPrice();
  
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <Avatar>
              {/* <AvatarImage src={user?.baseProfile.photoUrl || ''} alt="Profile picture" /> */}
              <AvatarFallback>
                <div className="w-16 h-16 rounded-3xl dark:bg-white bg-black"></div>
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="text-secondary" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-screen md:w-80 p-4 bg-white dark:bg-white rounded-3xl border border-zinc-300 dark:border-zinc-700 flex flex-col items-center"
        >

          {/* User Profile Snippet */}
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              {/* <AvatarImage src={user?.baseProfile.photoUrl} alt="Profile picture" /> */}
              <AvatarFallback>
                <div className="w-16 h-16 rounded-3xl dark:bg-white bg-black"></div>
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-3xl text-secondary font-semibold">{user?.name|| `User_${user?.address.slice(-4)}`}</h2>
              <div className="text-gray-500 flex items-center">
                <span className="truncate mr-1">
                  {user?.address?.slice(0, 4)}...{user?.address.slice(-4)}
                </span>
                <Copy
                  className="cursor-pointer ml-2"
                  onClick={() => copyToClipboard(user?.address.toString())}
                />
              </div>
            </div>
          </div>

          {/* Site Navigation */}
          <div className="w-full grid grid-cols-2 items-center mt-2 mb-2">
            <DropdownMenuItem className="flex flex-row items-center cursor-pointer text-secondary w-fit px-4 rounded-full gap-2 hover:bg-slate-200" onClick={()=> {router.push('/dashboard/settings')}}>
              <Settings size={24} />
              <span className="text-lg font-semibold">Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-row items-center cursor-pointer text-secondary w-fit px-4 rounded-full gap-2 hover:bg-slate-200" onClick={()=> {router.push('/dashboard')}}>
                <IdCard size={24} />
                <span className="text-lg font-semibold">Dashboard</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-row items-center cursor-pointer text-secondary w-fit px-4 rounded-full gap-2 hover:bg-slate-200" onClick={()=> {router.push('/union')}}>
                <Vote size={24} />
                <span className="text-lg font-semibold">Governance</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-row items-center cursor-pointer text-secondary w-fit px-4 rounded-full gap-2 hover:bg-slate-200" onClick={()=> {router.push('/admin')}}>
                <LockKeyhole size={24} />
                <span className="text-lg font-semibold">Admin</span>
            </DropdownMenuItem>
          </div>

          {/* Wallet Balance / Buying Power */}
          <div className="p-4 bg-transparent border border-zinc-300 dark:border-zinc-600 rounded-3xl w-full">
            <div className="flex justify-between items-center">
              <div className="text-secondary">Buying power</div>
              <div className="text-xl text-secondary font-bold">${userBalance && userBalance.sol ? (solToUsd(userBalance.sol) + userBalance.usdc).toFixed(2) : ''}</div>
            </div>
            <div className="mt-2 flex items-center">
              <div className="flex-1 flex items-center gap-2 text-secondary">
                <div className="w-4 h-4 rounded-full bg-bg border border-solid border-[#D4D4D8]">
                  <IconCurrencySolana className="w-4 h-4" />
                </div>
                <span>{userBalance ? (userBalance?.sol).toFixed(4) : ''} SOL</span>
              </div>
              <div className="text-zinc-500">=${solToUsd(userBalance?.sol).toFixed(2)}</div>
            </div>
            <div className="mt-2 flex items-center">
              <div className="flex-1 flex items-center gap-2 text-secondary">
                <div className="w-4 h-4 rounded-full bg-bg border border-solid border-[#D4D4D8]">
                  <IconCurrencyDollar className="w-full h-full" />
                </div>
                <span>{userBalance?.usdc} USDC</span>
              </div>
              {/* <div className="text-zinc-500">=$124</div> */}
            </div>
            <div className='flex flex-col items-center justify-center mt-2'>
              <WalletButton />
            </div>
          </div>
          
          {/* Test Funds */}
          <div className='flex flex-col w-full items-center justify-center mt-2 bg-slate-500/20 p-2 rounded-2xl'>
              <p>Need Test Funds?</p>
              <div className='flex flex-row justify-center items-center gap-2 w-full h-fit'>
                <Link href='https://faucet.circle.com/' target='_blank'>
                  <Button variant='outline' className='mt-4 w-full'>Get USDC</Button>
                </Link>
                <Link href='https://faucet.solana.com/' target='_blank'>
                  <Button variant='outline' className='mt-4 w-full'>Get SOL</Button>
                </Link>
              </div>
            </div>
        </DropdownMenuContent>
        
      </DropdownMenu>
    );
  }

export default UserDropdown;