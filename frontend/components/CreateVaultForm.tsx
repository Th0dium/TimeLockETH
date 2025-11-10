'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { TIMELOCK_ADVANCED_ADDRESS, TIMELOCK_ADVANCED_ABI } from '../utils/contracts'
import { TZ_OFFSETS, formatTzLabel, msToDateTimeFields, fieldsToEpoch, defaultUnlockMs } from '../utils/timeUtils'

export function CreateVaultForm() {
  const { address } = useAccount()
  const [receiver, setReceiver] = useState('')
  const [authority, setAuthority] = useState('')
  const [amount, setAmount] = useState('0.1')
  const [unlockDate, setUnlockDate] = useState('')
  const [unlockTime, setUnlockTime] = useState('')
  const [tzOffset, setTzOffset] = useState(7 * 60) // Default GMT+7
  const [authorityRights, setAuthorityRights] = useState<number>(0)
  const [createdVaults, setCreatedVaults] = useState<any[]>([])
  const [loadingVaults, setLoadingVaults] = useState(false)
  const [vaultRefreshCooldown, setVaultRefreshCooldown] = useState<number | null>(null)

  const { data: hash, writeContract, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Initialize default unlock time on mount
  useEffect(() => {
    const defaultOffset = 7 * 60
    const ms = defaultUnlockMs()
    const { date, time } = msToDateTimeFields(ms, defaultOffset)
    setUnlockDate(date)
    setUnlockTime(time)
    setTzOffset(defaultOffset)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!receiver || !amount) {
      alert('Please fill all required fields')
      return
    }

    const tsNum = fieldsToEpoch(unlockDate, unlockTime, tzOffset)
    const nowNum = Math.floor(Date.now() / 1000)

    if (!Number.isFinite(tsNum) || tsNum <= nowNum) {
      alert('Unlock time must be in the future')
      return
    }

    writeContract({
      address: TIMELOCK_ADVANCED_ADDRESS,
      abi: TIMELOCK_ADVANCED_ABI,
      functionName: 'createVault',
      args: [
        receiver as `0x${string}`,
        authority && authority !== '' ? authority as `0x${string}` : '0x0000000000000000000000000000000000000000' as `0x${string}`,
        BigInt(tsNum),
        authorityRights
      ],
      value: parseEther(amount),
    })
  }

  const fetchCreatedVaults = async () => {
    if (!address) return
    setLoadingVaults(true)
    try {
      // TODO: Fetch vaults where user is creator from contract
      setCreatedVaults([])
    } catch (error) {
      console.error('Failed to fetch vaults:', error)
    } finally {
      setLoadingVaults(false)
    }
  }

  const handleRefreshVaults = async () => {
    const now = Date.now()
    if (vaultRefreshCooldown && now < vaultRefreshCooldown) return

    setVaultRefreshCooldown(now + 5000)
    setTimeout(() => setVaultRefreshCooldown(null), 5000)
    await fetchCreatedVaults()
  }

  if (!address) {
    return (
      <div className="border rounded-lg p-6 text-center text-muted">
        <p>Connect your wallet to create a vault</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-3">
        <h2 className="text-xl font-bold mb-3">Create Time-Locked Vault</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              Amount (ETH) *
            </label>
            <input
              type="number"
              step="0.000000001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.1"
              className="w-full border px-3 py-2 rounded-md"
              required
            />
          </div>

          <div className="col-span-1 space-y-1">
            <div className="font-medium text-sm">Unlock Time</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
              <input
                type="date"
                className="border px-2 py-1 rounded-md sm:col-span-2 text-sm"
                value={unlockDate}
                onChange={(e) => setUnlockDate(e.target.value)}
              />
              <input
                type="time"
                className="border px-2 py-1 rounded-md sm:col-span-1 text-sm"
                step={60}
                value={unlockTime}
                onChange={(e) => setUnlockTime(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-muted">Timezone</label>
              <select
                className="w-full border px-2 py-1 rounded-md text-sm"
                value={tzOffset}
                onChange={(e) => setTzOffset(parseInt(e.target.value))}
              >
                {TZ_OFFSETS.map((o) => (
                  <option key={o} value={o}>
                    {formatTzLabel(o)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="col-span-1 sm:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Receiver Address *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                placeholder="0x..."
                className="flex-1 border px-3 py-2 rounded-md text-sm"
                required
              />
              <button
                type="button"
                className="btn text-sm"
                onClick={() => setReceiver(address || '')}
              >
                Self
              </button>
            </div>
          </div>

          <div className="col-span-1 sm:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Authority Address (optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={authority}
                onChange={(e) => setAuthority(e.target.value)}
                placeholder="0x... (leave empty for none)"
                className="flex-1 border px-3 py-2 rounded-md text-sm"
              />
              <button
                type="button"
                className="btn text-sm"
                onClick={() => setAuthority(address || '')}
              >
                Self
              </button>
            </div>
          </div>

          {authority && authority !== '' && (
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Authority Rights
              </label>
              <div className="space-y-2">
                <label className="flex items-center text-sm">
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
                <label className="flex items-center text-sm">
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
        </div>

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

      {/* Created Vaults List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Vaults Created</h3>
          <div className="flex items-center gap-2">
            <button
              disabled={vaultRefreshCooldown ? Date.now() < vaultRefreshCooldown : false}
              onClick={handleRefreshVaults}
              className="btn text-sm disabled:opacity-50"
            >
              Refresh
            </button>
            {loadingVaults && <span className="text-sm text-muted">Loading…</span>}
          </div>
        </div>

        <div className="grid gap-3">
          {createdVaults.length > 0 ? (
            createdVaults.map((vault) => (
              <div key={vault.address} className="border rounded-lg p-3 space-y-2 text-sm">
                <div className="break-all text-muted">{vault.address}</div>
                <div>
                  Amount: <span className="font-semibold">{parseFloat(vault.amount).toFixed(4)} ETH</span>
                </div>
                <div>
                  Unlock: <span>{new Date(vault.unlockTime * 1000).toLocaleString()}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted text-center py-6">
              No vaults found yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
