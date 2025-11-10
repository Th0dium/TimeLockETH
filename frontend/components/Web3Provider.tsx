'use client'

import { useEffect, useState } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { sepolia } from '@reown/appkit/networks'
import { wagmiAdapter, projectId } from '../utils/wagmi'

const queryClient = new QueryClient()

// Set up metadata for the app
const appUrl = typeof window !== 'undefined'
  ? `${window.location.protocol}//${window.location.host}`
  : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

const metadata = {
  name: 'TimeLock ETH',
  description: 'Time-lock your ETH with smart contracts on Sepolia testnet',
  url: appUrl,
  icons: [`${appUrl}/icon.png`]
}

// Detect dark mode preference
const getDarkModePreference = () => {
  if (typeof window === 'undefined') return 'light'

  // Check if user has dark mode enabled in browser/OS
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

// Create the AppKit modal with dark mode support
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [sepolia],
  defaultNetwork: sepolia,
  metadata,
  themeMode: getDarkModePreference(),
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
