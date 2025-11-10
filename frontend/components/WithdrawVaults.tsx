'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { formatCountdown } from '../utils/timeUtils'

interface Vault {
  address: string
  amount: string
  receiver: string
  authority: string
  unlockTime: number
  claimed: boolean
}

export function WithdrawVaults() {
  const { address, isConnected } = useAccount()
  const [vaults, setVaults] = useState<Vault[]>([])
  const [loading, setLoading] = useState(false)
  const [nowSec, setNowSec] = useState(Math.floor(Date.now() / 1000))
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null)

  // Update current time every second for countdown
  useEffect(() => {
    const id = setInterval(() => setNowSec(Math.floor(Date.now() / 1000)), 1000)
    return () => clearInterval(id)
  }, [])

  const fetchVaults = async () => {
    if (!address) return
    setLoading(true)
    try {
      // TODO: Fetch vaults where user is receiver from contract
      // This is a placeholder - implement actual contract reading
      setVaults([])
    } catch (error) {
      console.error('Failed to fetch vaults:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    const now = Date.now()
    if (cooldownUntil && now < cooldownUntil) return

    setCooldownUntil(now + 5000)
    setTimeout(() => setCooldownUntil(null), 5000)
    await fetchVaults()
  }

  const handleWithdraw = async (vault: Vault) => {
    if (!address) return
    try {
      // TODO: Implement withdrawal transaction
      console.log('Withdrawing from vault:', vault.address)
    } catch (error) {
      console.error('Withdrawal failed:', error)
      alert('Withdrawal failed: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  if (!isConnected) {
    return (
      <div className="border rounded-lg p-6 text-center text-muted">
        <p>Connect your wallet to view withdrawable vaults</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center justify-center">
        <button
          disabled={cooldownUntil ? Date.now() < cooldownUntil : false}
          onClick={handleRefresh}
          className="btn disabled:opacity-50"
        >
          Refresh
        </button>
        {loading && <span className="text-muted">Loading…</span>}
      </div>

      <div className="grid gap-3">
        {vaults.map((vault) => {
          const remainingSeconds = vault.unlockTime - nowSec
          const isUnlocked = remainingSeconds <= 0
          const canWithdraw = isUnlocked && !vault.claimed

          return (
            <div key={vault.address} className="border rounded-lg p-4 space-y-2">
              <div>
                <label className="text-xs text-muted">Vault Address</label>
                <div className="break-all text-sm text-foreground">{vault.address}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted">Amount</label>
                  <div className="text-sm font-semibold">{parseFloat(vault.amount).toFixed(4)} ETH</div>
                </div>
                <div>
                  <label className="text-xs text-muted">Status</label>
                  <div className="text-sm font-semibold">
                    {vault.claimed ? (
                      <span className="text-gray-500">Withdrawn</span>
                    ) : isUnlocked ? (
                      <span className="text-emerald-500">Ready</span>
                    ) : (
                      <span className="text-yellow-500">Locked</span>
                    )}
                  </div>
                </div>
              </div>

              {!isUnlocked && (
                <div>
                  <label className="text-xs text-muted">Time Remaining</label>
                  <div className="text-sm font-mono">{formatCountdown(remainingSeconds)}</div>
                </div>
              )}

              <div>
                <label className="text-xs text-muted">Unlock Time</label>
                <div className="text-sm">
                  {new Date(vault.unlockTime * 1000).toLocaleString()}
                </div>
              </div>

              <button
                onClick={() => handleWithdraw(vault)}
                disabled={!canWithdraw}
                className="btn btn--solid w-full disabled:opacity-50"
              >
                {vault.claimed ? 'Already Withdrawn' : isUnlocked ? 'Withdraw' : 'Locked'}
              </button>
            </div>
          )
        })}

        {vaults.length === 0 && !loading && (
          <div className="text-sm text-muted text-center py-8">
            No vaults found where you are the receiver
          </div>
        )}
      </div>
    </div>
  )
}
