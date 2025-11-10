'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { TIMELOCK_ADVANCED_ADDRESS, TIMELOCK_ADVANCED_ABI } from '../utils/contracts'

export function CreateVaultForm() {
  const { address } = useAccount()
  const [receiver, setReceiver] = useState('')
  const [authority, setAuthority] = useState('')
  const [amount, setAmount] = useState('')
  const [lockDays, setLockDays] = useState('')
  const [authorityRights, setAuthorityRights] = useState<number>(0)

  const { data: hash, writeContract, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!receiver || !amount || !lockDays) {
      alert('Please fill all required fields')
      return
    }

    const unlockTime = Math.floor(Date.now() / 1000) + (parseInt(lockDays) * 24 * 60 * 60)

    writeContract({
      address: TIMELOCK_ADVANCED_ADDRESS,
      abi: TIMELOCK_ADVANCED_ABI,
      functionName: 'createVault',
      args: [
        receiver as `0x${string}`,
        authority && authority !== '' ? authority as `0x${string}` : '0x0000000000000000000000000000000000000000' as `0x${string}`,
        BigInt(unlockTime),
        authorityRights
      ],
      value: parseEther(amount),
    })
  }

  if (!address) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg">
        <p className="text-gray-400">Connect your wallet to create a vault</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-gray-800 rounded-lg space-y-4">
      <h2 className="text-2xl font-bold mb-4">Create Time-Locked Vault</h2>

      <div>
        <label className="block text-sm font-medium mb-2">
          Receiver Address *
        </label>
        <input
          type="text"
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
          placeholder="0x..."
          className="w-full px-4 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Amount (ETH) *
        </label>
        <input
          type="number"
          step="0.001"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.1"
          className="w-full px-4 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Lock Duration (days) *
        </label>
        <input
          type="number"
          value={lockDays}
          onChange={(e) => setLockDays(e.target.value)}
          placeholder="30"
          className="w-full px-4 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Authority Address (optional)
        </label>
        <input
          type="text"
          value={authority}
          onChange={(e) => setAuthority(e.target.value)}
          placeholder="0x... (leave empty for no authority)"
          className="w-full px-4 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {authority && authority !== '' && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Authority Rights
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={(authorityRights & 0x01) !== 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setAuthorityRights(authorityRights | 0x01)
                  } else {
                    setAuthorityRights(authorityRights & ~0x01)
                  }
                }}
                className="mr-2"
              />
              Can change receiver
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={(authorityRights & 0x02) !== 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setAuthorityRights(authorityRights | 0x02)
                  } else {
                    setAuthorityRights(authorityRights & ~0x02)
                  }
                }}
                className="mr-2"
              />
              Can change unlock time
            </label>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || isConfirming}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-md font-semibold transition-colors"
      >
        {isPending ? 'Waiting for approval...' : isConfirming ? 'Creating vault...' : 'Create Vault'}
      </button>

      {isSuccess && (
        <div className="p-4 bg-green-900/30 border border-green-500 rounded-md">
          <p className="text-green-400">Vault created successfully!</p>
          <p className="text-sm text-gray-400 mt-1">Tx: {hash}</p>
        </div>
      )}
    </form>
  )
}
