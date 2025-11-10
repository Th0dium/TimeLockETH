'use client'

import { useAccount } from 'wagmi'

export function AdministrateVaults() {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="border rounded-lg p-6 text-center text-muted">
        <p>Connect your wallet to manage vaults</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-6 space-y-4">
        <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
          <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Coming Soon</h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
            To enable managing vaults where you are the authority, this feature requires event indexing infrastructure.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold">What you'll be able to do:</h4>
          <ul className="space-y-2 text-sm text-muted list-disc list-inside">
            <li>View all vaults where you set as the authority</li>
            <li>Change the receiver address (if you have that right)</li>
            <li>Update the unlock time (if you have that right)</li>
            <li>Monitor vault status and unlock countdown</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold">How it will work:</h4>
          <ol className="space-y-2 text-sm text-muted list-decimal list-inside">
            <li>Contract emits <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">VaultCreated</code> events with your authority address</li>
            <li>Events are indexed by The Graph or similar service</li>
            <li>Frontend queries the subgraph to find all vaults where you are the authority</li>
            <li>You can then update vault parameters (receiver, unlock time)</li>
          </ol>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold">Current Workaround:</h4>
          <p className="text-sm text-muted">
            If you are set as the authority on a vault, you'll need the vault ID to manage it directly. You can call the contract functions <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">setReceiver</code> and <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">setUnlockTime</code> using Etherscan or another tool.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold">Why this limitation?</h4>
          <p className="text-sm text-muted">
            Ethereum's contract storage is not queryable by value like Solana's account model. Instead, we need to index contract events (VaultCreated, ReceiverChanged, UnlockTimeChanged) using a service like The Graph to enable efficient lookups.
          </p>
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
