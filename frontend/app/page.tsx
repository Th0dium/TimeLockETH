'use client'

import { useState } from 'react'
import { WalletButton } from '../components/WalletButton'
import { CreateVaultForm } from '../components/CreateVaultForm'
import { WithdrawVaults } from '../components/WithdrawVaults'
import { AdministrateVaults } from '../components/AdministrateVaults'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'create' | 'withdraw' | 'administrate'>('create')

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <header className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row gap-3 sm:gap-0 items-stretch sm:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">TimeLock ETH</h1>
        <WalletButton />
      </header>

      <nav className="w-full max-w-4xl mx-auto flex flex-wrap gap-2 mb-6 justify-center sm:justify-start">
        <button
          className={`btn ${activeTab === 'create' ? 'btn--solid' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Create Vault
        </button>
        <button
          className={`btn ${activeTab === 'withdraw' ? 'btn--solid' : ''}`}
          onClick={() => setActiveTab('withdraw')}
        >
          Withdraw
        </button>
        <button
          className={`btn ${activeTab === 'administrate' ? 'btn--solid' : ''}`}
          onClick={() => setActiveTab('administrate')}
        >
          Administrate
        </button>
      </nav>

      <main className="w-full max-w-4xl mx-auto">
        {activeTab === 'create' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Time-Lock Your Ethereum</h2>
              <p className="text-muted">
                Lock ETH in a smart contract vault on Sepolia testnet.
                Set unlock time and optional authority permissions.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <CreateVaultForm />
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-bold mb-3">How it works</h3>
                <ol className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-bold">1</span>
                    <span>Connect wallet (MetaMask or other Web3 wallet)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-bold">2</span>
                    <span>Specify receiver address and lock duration</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-bold">3</span>
                    <span>Optionally set authority with permissions</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-bold">4</span>
                    <span>Send ETH to create the time-locked vault</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-bold">5</span>
                    <span>Receiver can withdraw after unlock time</span>
                  </li>
                </ol>

                <div className="mt-4 p-3 border rounded-md">
                  <h4 className="font-semibold mb-2 text-sm">Contract Info</h4>
                  <p className="text-xs text-muted break-all">
                    <span className="text-gray-500">Address:</span> 0x52F6e2fF2EA20BC0AE819CF9b579AF29e49d53d6
                  </p>
                  <p className="text-xs text-muted mt-1">
                    <span className="text-gray-500">Network:</span> Sepolia Testnet
                  </p>
                  <a
                    href="https://sepolia.etherscan.io/address/0x52F6e2fF2EA20BC0AE819CF9b579AF29e49d53d6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs mt-2 inline-block"
                    style={{ color: 'var(--link)' }}
                  >
                    View on Etherscan →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'withdraw' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Withdraw Your Funds</h2>
              <p className="text-muted">
                View vaults where you are the receiver and withdraw funds after the unlock time.
              </p>
            </div>
            <WithdrawVaults />
          </div>
        )}

        {activeTab === 'administrate' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Administrate Vaults</h2>
              <p className="text-muted">
                Manage vaults where you are set as the authority. Update receiver address and unlock times.
              </p>
            </div>
            <AdministrateVaults />
          </div>
        )}
      </main>
    </div>
  );
}
