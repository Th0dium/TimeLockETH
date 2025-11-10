import { http, createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

// Get WalletConnect project ID from env
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected(),
    ...(projectId ? [walletConnect({ projectId })] : []),
  ],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
