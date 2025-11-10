import { cookieStorage, createStorage } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

// Get WalletConnect project ID from env
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

// Set up wagmi adapter with Reown
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks: [sepolia]
})

export const config = wagmiAdapter.wagmiConfig

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
