'use client';
import { useState } from 'react';
import { getBricksProgram, getBricksProgramId } from '@/components/blockchain/bricks-exports';
import { Keypair, PublicKey } from '@solana/web3.js';
import { useQuery, UseQueryOptions,  } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAnchorProvider } from '@/components/providers/SolanaProvider';
import { Connection } from '@solana/web3.js';

export function useBricksProgram() {
  const connection = new Connection('https://soft-cold-energy.solana-devnet.quiknode.pro/ad0dda04b536ff45a76465f9ceee5eea6a048a8f', "confirmed");
  const cluster = 'devnet';
  const provider = useAnchorProvider();
  const programId = getBricksProgramId('devnet');
  const program = getBricksProgram(provider);
  const fraction = Keypair.generate();
  const listings = useQuery({
    queryKey: ['listings', 'all', { cluster }],
    //@ts-ignore - referenced correctly
    queryFn: () => program.account.fractionalizedListing.all(),
  });

  const homes = useQuery({
    queryKey: ['homes', 'all', { cluster }],
    //@ts-ignore - referenced correctly
    queryFn: () => program.account.baseCollectionV1.all(),
  });

  const profiles = useQuery({
    queryKey: ['profiles', 'all', { cluster }],
    //@ts-ignore - referenced correctly
    queryFn: () => program.account.profile.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  return useMemo(() => ({
    program,
    programId,
    fraction,
    listings,
    profiles,
    getProgramAccount,
  }), [program, programId, fraction, listings, profiles, getProgramAccount]);
}

export function useArtisanProgramAccount({ 
  account, 
  username,
  enabled = true
}: { 
  account: PublicKey;
  username?: string;
  enabled?: boolean;
}) { 
  const cluster = 'devnet';
  const [loading, setLoading] = useState<boolean>(false);
  const { program, listings } = useBricksProgram();

  const listingQuery = useQuery({
    queryKey: ['listing', 'fetch', { cluster, account }],
    
    queryFn: async() => {
      setLoading(true);
      //@ts-ignore - referenced correctly
      const _data = await program.account.fractionalizedListing.fetch(account)
      console.log('listing data ->', _data)
      setLoading(false);
      return _data;
    },
    enabled: enabled,
  } as UseQueryOptions);

  const homesQuery = useQuery({
    queryKey: ['homes', 'fetch', { cluster, account }],
        
    queryFn: async() =>{ 
      //@ts-ignore - referenced correctly
     const data = await program.account.baseCollectionV1.fetch(account)
    },
  } as UseQueryOptions);

  const profileQuery = useQuery({
    queryKey: ['profile', 'fetch', { cluster, account }],
        //@ts-ignore - referenced correctly
    queryFn: () => program.account.profile.fetch(account),
    enabled: enabled,
  } as UseQueryOptions);

  return useMemo(() => ({
    program,
    account,
    listingQuery,
    homesQuery,
    profileQuery,
    loading,
  }), [
    program,
    account, 
    loading,
    listingQuery, 
    homesQuery, 
    profileQuery]);
}
