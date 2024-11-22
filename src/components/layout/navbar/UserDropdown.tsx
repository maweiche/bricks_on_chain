import { toast } from "@/hooks/use-toast";
import { User, useStore } from "@/lib/store";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ChevronDown, Copy, LogOut, Settings, IdCard, Vote, LockKeyhole } from "lucide-react";
import { IconCurrencyDollar, IconCurrencySolana } from '@tabler/icons-react';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSolanaPrice } from "@/hooks/use-solana-price";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "@/components/providers";
import { USDC_MINT } from "@/components/solana"
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { rpcManager } from '@/lib/rpc/rpc-manager';

const UserDropdown = ({ user }: { user: User }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { publicKey, disconnect } = useWallet();
    const [userBalance, setUserBalance] = useState({ sol: 0, usdc: 0 });
    const router = useRouter();
    const logout = useStore(state => state.disconnect)
    const {
      solToUsd,
      formatUsd,
      formatSol,
    } = useSolanaPrice();

    useEffect(() => {
      const getBalances = async(pubKey: PublicKey) => {
        try {
          const connection = rpcManager.getConnection()
          const balance = await connection.getBalance(pubKey)
          const usdcAta = await getAssociatedTokenAddress(new PublicKey(USDC_MINT), pubKey)
          const usdcBalance = await connection.getBalance(usdcAta)

          setUserBalance({
            sol: (balance / LAMPORTS_PER_SOL),
            usdc: usdcBalance
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
      navigator.clipboard.writeText(text);
      toast({
        title: 'Copied to clipboard',
        description: text,
      });
    };

    const handleLogout = async() => {
      await disconnect(),
      logout(),
      router.push('/');
      toast({
        title: "Logged out",
        description: "Successfully logged out"
      });
    };
  

    if (!user) return null;
  
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <Avatar>
              <AvatarFallback>
                <div className="w-16 h-16 rounded-3xl dark:bg-white bg-black"></div>
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="text-secondary" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-screen md:w-[340px] p-4 bg-white dark:bg-white rounded-3xl border border-zinc-300 dark:border-zinc-700 flex flex-col items-center"
        >
          {/* User Profile Section */}
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
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
                  onClick={() => copyToClipboard(user?.address)}
                />
              </div>
            </div>
          </div>

          {/* Site Navigation */}
          <div className="w-full grid grid-cols-2 items-center mt-2 mb-2 border border-zinc-300 dark:border-zinc-600 p-2 rounded-2xl">
            <DropdownMenuItem 
              className="flex flex-row items-center cursor-pointer text-secondary w-fit px-4 rounded-full gap-2 hover:bg-slate-200" 
              onClick={() => router.push('/dashboard/settings')}
            >
              <Settings size={24} />
              <span className="text-lg font-semibold">Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex flex-row items-center cursor-pointer text-secondary w-fit px-4 rounded-full gap-2 hover:bg-slate-200" 
              onClick={() => router.push('/dashboard')}
            >
              <IdCard size={24} />
              <span className="text-lg font-semibold">Dashboard</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex flex-row items-center cursor-pointer text-secondary w-fit px-4 rounded-full gap-2 hover:bg-slate-200" 
              onClick={() => router.push('/union')}
            >
              <Vote size={24} />
              <span className="text-lg font-semibold">Governance</span>
            </DropdownMenuItem>
            {user.role === 'admin' && (
              <DropdownMenuItem 
                className="flex flex-row items-center cursor-pointer text-secondary w-fit px-4 rounded-full gap-2 hover:bg-slate-200" 
                onClick={() => router.push('/admin')}
              >
                <LockKeyhole size={24} />
                <span className="text-lg font-semibold">Admin</span>
              </DropdownMenuItem>
            )}
          </div>

          {/* Wallet Balance / Buying Power */}
          <div className="p-4 bg-transparent border border-zinc-300 dark:border-zinc-600 rounded-3xl w-full">
            <div className="flex justify-between items-center">
              <div className="text-secondary">Buying power</div>
              <div className="text-xl text-secondary font-bold">
                ${userBalance.sol ? (solToUsd(userBalance.sol) + userBalance.usdc).toFixed(2) : '0.00'}
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <div className="flex-1 flex items-center gap-2 text-secondary">
                <div className="w-4 h-4 rounded-full bg-bg border border-solid border-[#D4D4D8]">
                  <IconCurrencySolana className="w-4 h-4" />
                </div>
                <span>{userBalance.sol.toFixed(4)} SOL</span>
              </div>
              <div className="text-zinc-500">${solToUsd(userBalance.sol).toFixed(2)}</div>
            </div>
            <div className="mt-2 flex items-center">
              <div className="flex-1 flex items-center gap-2 text-secondary">
                <div className="w-4 h-4 rounded-full bg-bg border border-solid border-[#D4D4D8]">
                  <IconCurrencyDollar className="w-full h-full" />
                </div>
                <span>{userBalance.usdc} USDC</span>
              </div>
            </div>
            <div className='flex flex-col items-center justify-center mt-2'>
              <WalletButton />
            </div>
          </div>
          
          {/* Logout Button */}
          <Button 
            variant="destructive" 
            className="w-full mt-4"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

export default UserDropdown;