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
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-3">
      <h2 className="text-xl font-bold mb-3">Create Time-Locked Vault</h2>

      <div>
        <label className="block text-sm font-medium mb-1">
          Receiver Address *
        </label>
        <input
          type="text"
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
          placeholder="0x..."
          className="w-full border px-3 py-2 rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Amount (ETH) *
        </label>
        <input
          type="number"
          step="0.001"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.1"
          className="w-full border px-3 py-2 rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Lock Duration (days) *
        </label>
        <input
          type="number"
          value={lockDays}
          onChange={(e) => setLockDays(e.target.value)}
          placeholder="30"
          className="w-full border px-3 py-2 rounded-md"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Authority Address (optional)
        </label>
        <input
          type="text"
          value={authority}
          onChange={(e) => setAuthority(e.target.value)}
          placeholder="0x... (leave empty for no authority)"
          className="w-full border px-3 py-2 rounded-md"
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
        className="btn btn--solid w-full"
      >
        {isPending ? 'Waiting for approval...' : isConfirming ? 'Creating vault...' : 'Create Vault'}
      </button>

      {isSuccess && (
        <div className="p-3 border border-emerald-500 rounded-md bg-emerald-500/10">
          <p className="text-emerald-500 font-medium">Vault created successfully!</p>
          <p className="text-sm text-muted mt-1 break-all">Tx: {hash}</p>
        </div>
      )}
    </form>
  )
}
