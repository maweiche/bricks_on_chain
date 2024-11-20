import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { PublicKey } from '@solana/web3.js';

// Validation schemas
const CartItemSchema = z.object({
  propertyId: z.string(),
  propertyTitle: z.string(),
  fractionCount: z.number().min(1),
  pricePerFraction: z.number().min(0),
  totalAmount: z.number().min(0),
});

const CheckoutRequestSchema = z.object({
  items: z.array(CartItemSchema),
  wallet: z.string(), // Solana public key
});

// File paths
const PROPERTIES_PATH = path.join(process.cwd(), 'data', 'properties.json');
const USERS_PATH = path.join(process.cwd(), 'data', 'users.json');

// Helper to validate Solana address
function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const { items, wallet } = CheckoutRequestSchema.parse(json);

    // Validate Solana address
    if (!isValidSolanaAddress(wallet)) {
      throw new Error('Invalid Solana wallet address');
    }

    // Read current data
    const [propertiesData, usersData] = await Promise.all([
      fs.readFile(PROPERTIES_PATH, 'utf-8').then(JSON.parse),
      fs.readFile(USERS_PATH, 'utf-8').then(JSON.parse),
    ]);

    // Find user by Solana address
    const user = usersData.find((u: any) => u.address === wallet);
    if (!user) {
      throw new Error('User not found for the provided wallet address');
    }

    // Validate and update each property
    for (const item of items) {
      const propertyIndex = propertiesData.properties.findIndex(
        (p: any) => p.id === item.propertyId
      );

      if (propertyIndex === -1) {
        throw new Error(`Property ${item.propertyId} not found`);
      }

      const property = propertiesData.properties[propertyIndex];

      // Check if property is already funded
      if (property.funded) {
        throw new Error(`Property ${item.propertyTitle} is already fully funded`);
      }

      // Calculate remaining funding needed
      const remainingToFund = property.fundingGoal - property.currentFunding;
      
      // Check if purchase amount exceeds remaining funding needed
      if (item.totalAmount > remainingToFund) {
        throw new Error(
          `Purchase amount exceeds remaining funding needed for ${item.propertyTitle}`
        );
      }

      // Update property funding
      property.currentFunding += item.totalAmount;
      property.funded = property.currentFunding >= property.fundingGoal;
      propertiesData.properties[propertyIndex] = property;
    }

    // Update user investments
    const userIndex = usersData.findIndex((u: any) => u.address === wallet);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Ensure user has investments array
    if (!usersData[userIndex].investments) {
      usersData[userIndex].investments = [];
    }

    // Add new investments with transaction signature (mock for now)
    const timestamp = new Date().toISOString();
    const mockTxSignature = `${Date.now()}_${Math.random().toString(36).substring(7)}`;

    items.forEach(item => {
      usersData[userIndex].investments.push({
        id: `inv_${Date.now()}_${item.propertyId}`,
        propertyId: item.propertyId,
        amount: item.totalAmount,
        fractionCount: item.fractionCount,
        purchaseDate: timestamp,
        status: 'active',
        transactionSignature: mockTxSignature, // Will be replaced with actual Solana tx sig
        wallet: wallet // Store the wallet address used for the purchase
      });
    });

    // Save all updates
    await Promise.all([
      fs.writeFile(PROPERTIES_PATH, JSON.stringify(propertiesData, null, 2)),
      fs.writeFile(USERS_PATH, JSON.stringify(usersData, null, 2))
    ]);

    // Generate transaction summary
    const summary = {
      transactionId: mockTxSignature,
      timestamp,
      wallet,
      totalAmount: items.reduce((sum, item) => sum + item.totalAmount, 0),
      items: items.map(item => ({
        propertyId: item.propertyId,
        fractionCount: item.fractionCount,
        amount: item.totalAmount
      }))
    };

    return NextResponse.json({
      success: true,
      ...summary
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Checkout failed',
        code: error.code || 'CHECKOUT_ERROR'
      },
      { status: error.code ? 400 : 500 }
    );
  }
}