'use client'

import { useAccount } from 'wagmi'

export function WithdrawVaults() {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="border rounded-lg p-6 text-center text-muted">
        <p>Connect your wallet to view withdrawable vaults</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-6 space-y-4">
        <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-2">Coming Soon</h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
            To enable finding vaults where you are the receiver, this feature requires event indexing infrastructure.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold">How it will work:</h4>
          <ol className="space-y-2 text-sm text-muted list-decimal list-inside">
            <li>Contract emits <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">VaultCreated</code> events with indexed fields</li>
            <li>Events are indexed by The Graph or similar service</li>
            <li>Frontend queries the subgraph to find all vaults where you are the receiver</li>
            <li>You can then withdraw funds after unlock time</li>
          </ol>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold">Current Workaround:</h4>
          <p className="text-sm text-muted">
            If someone creates a vault with you as the receiver, ask them to provide the vault ID or check the transaction hash on Etherscan to find the vault details.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold">Technical Details:</h4>
          <p className="text-sm text-muted">
            Unlike Solana, Ethereum doesn't provide a native way to query contract storage by value. Instead, we rely on events:
          </p>
          <ul className="space-y-1 text-sm text-muted list-disc list-inside">
            <li>Solana: PDAs + <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">getProgramAccounts</code> with memcmp filters</li>
            <li>Ethereum: Events + The Graph indexing</li>
          </ul>
        </div>

        <a
          href="https://thegraph.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-link hover:underline text-sm inline-block mt-2"
        >
          Learn more about The Graph →
        </a>
      </div>
    </div>
  )
}
