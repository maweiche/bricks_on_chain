import { publicKey } from '@metaplex-foundation/umi'
import { Connection, GetProgramAccountsConfig, Keypair, PublicKey } from '@solana/web3.js'
import { fetchAssetsByOwner, AssetV1, fetchCollectionV1, CollectionV1 } from '@metaplex-foundation/mpl-core'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { Bricks, PROTOCOL } from '@/components/blockchain/bricks-exports';
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { rpcManager } from '@/lib/rpc/rpc-manager';
const IDL = require('@/components/blockchain/idl/artisan.json');
const RPC = rpcManager.getConnection();
// Create Umi Instance
const umi = rpcManager.getUmi();

interface ListingResult {
  listing: string;
  price: number;
  shares: number;
  sharesSold: number;
}

export const fetchAssets = async (owner: string): Promise<AssetV1[]> => {
    try {
      console.log('fetching assets for ->', owner);
      const assetsByOwner = await fetchAssetsByOwner(umi, owner, {
        skipDerivePlugins: false,
      });
      console.log('assetsByOwner', assetsByOwner);
  
      const filteredAccounts = assetsByOwner.filter((asset) => {
        if (asset.oracles && asset.oracles[0] && asset.oracles[0].baseAddress === "3x6mnnQgVpY6k48DXyECpQprS6LEUS4wCDmVeJgGEYAV") {
          console.log('asset match ->', asset);
          console.log('oracle base ->', asset.oracles[0].baseAddress);
          console.log("3x6mnnQgVpY6k48DXyECpQprS6LEUS4wCDmVeJgGEYAV" === asset.oracles[0].baseAddress);
          return true;
        }
        return false;
      });
  
      console.log('filteredAccounts', filteredAccounts);
      return filteredAccounts;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

export const fetchProducts = async (productList: any[]): Promise<{ 
    availableApartments: CollectionV1[],
    comingSoonApartments: CollectionV1[]
  } | 
    undefined
> => {
    const formatDateToDddMmm = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        const day = date.getDate();
        const minute = date.getMinutes();
    
        const paddedDay = day.toString().padStart(2, '0');
        const paddedMinute = minute.toString().padStart(2, '0');
        
        return `${paddedDay}::${paddedMinute}`;
    };

    try {
        const currentTime = Math.floor(Date.now() / 1000);
        const availableProducts = productList.filter(product => product.startingTime < currentTime);
        const comingSoonProducts = productList.filter(product => product.startingTime >= currentTime);
        const detailedAvailableProducts = [];

        for( let i = 0; i < availableProducts.length; i++){
            const nft = availableProducts[i];
            const watch = await fetchCollectionV1(umi, availableProducts[i].object);

            detailedAvailableProducts.push({
                ...nft,
                watch: watch.attributes!.attributeList
            })
        };

        const detailedComingSoonProducts = [];

        for( let i = 0; i < comingSoonProducts.length; i++){
            const nft = comingSoonProducts[i];
            const watch = await fetchCollectionV1(umi, comingSoonProducts[i].object);

            detailedComingSoonProducts.push({
                ...nft,
                watch: watch.attributes!.attributeList
            })
        };

        console.log('detailedAvailableProducts', detailedAvailableProducts[0].objectType)

        // filter the products by type
        const availableApartments = detailedAvailableProducts.filter(product => product.objectType.apartment);
        const comingSoonApartments = detailedComingSoonProducts.filter(product => product.objectType.apartment);

        const products = {
            availableApartments: availableApartments as CollectionV1[],
            comingSoonApartments: comingSoonApartments as CollectionV1[],
        };
        console.log('products', products)
        return products 
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return undefined;
    }
};

export const fetchObjectDetails = async (object: PublicKey): Promise<CollectionV1 | undefined> => {
    try {
        const objectKey = publicKey(object);
        const _obj = await fetchCollectionV1(umi, objectKey);
        
        return _obj as CollectionV1;
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return undefined;
    }
};

export async function getListingByWatch(key: string, maxRetries = 3): Promise<ListingResult | null> {
  let attempts = 0;
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  while (attempts < maxRetries) {
    try {
      const memcmp_filter = {
        memcmp: {
          offset: 17,
          bytes: new PublicKey(key).toBase58(),
        },
      };
      
      const get_accounts_config: GetProgramAccountsConfig = {
        commitment: "confirmed",
        filters: [
          memcmp_filter,
          { dataSize: 70 }
        ]
      };
      
      // const connection = new Connection(
      //   'https://devnet.helius-rpc.com/?api-key=b7faf1b9-5b70-4085-bf8e-a7be3e3b78c2',
      //   'confirmed'
      // );

      // const connection = new Connection(RPC, 'confirmed');
      
      const wallet = Keypair.generate();
      //@ts-expect-error - we are not signing
      const provider = new AnchorProvider(RPC, wallet, {commitment: "confirmed"});
      const program: Program<Bricks> = new Program(IDL, provider);
      
      const nft = await RPC.getProgramAccounts(
        program.programId,
        get_accounts_config 
      );

      // Check if we got any results
      if (!nft || nft.length === 0) {
        return null;
      }

      const nft_decoded = program.coder.accounts.decode(
        "fractionalizedListing",
        nft[0].account.data
      );

      return {
        listing: nft[0].pubkey.toBase58(),
        price: Number(nft_decoded.price),
        shares: Number(nft_decoded.share),
        sharesSold: Number(nft_decoded.shareSold),
      };
      
    } catch (error: any) {
      attempts++;
      
      // Handle rate limiting specifically
      if (error?.response?.status === 429 || error?.message?.includes('429')) {
        console.log(`Rate limited, attempt ${attempts} of ${maxRetries}`);
        
        // Calculate exponential backoff delay
        const backoffDelay = Math.min(1000 * Math.pow(2, attempts), 10000);
        
        // If we have more retries left, wait and try again
        if (attempts < maxRetries) {
          await delay(backoffDelay);
          continue;
        }
      }
      
      // If we've exhausted retries or it's not a rate limit error
      if (attempts === maxRetries) {
        console.error('Max retries reached when fetching listing:', error);
        return null;
      }
      
      // Handle other errors
      console.error('Error fetching listing:', error);
      return null;
    }
  }
  
  return null;
}