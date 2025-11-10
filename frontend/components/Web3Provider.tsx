'use client'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { sepolia } from '@reown/appkit/networks'
import { wagmiAdapter, projectId } from '../utils/wagmi'

const queryClient = new QueryClient()

// Set up metadata for the app
const metadata = {
  name: 'TimeLock ETH',
  description: 'Time-lock your ETH with smart contracts on Sepolia testnet',
  url: 'https://timelocketh.app', // Replace with your actual domain
  icons: ['https://timelocketh.app/icon.png'] // Replace with your actual icon
}

// Create the AppKit modal
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [sepolia],
  defaultNetwork: sepolia,
  metadata,
  features: {
    analytics: false
  }
})

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
