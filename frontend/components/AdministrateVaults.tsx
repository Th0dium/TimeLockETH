'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { TZ_OFFSETS, formatTzLabel, msToDateTimeFields, fieldsToEpoch } from '../utils/timeUtils'

interface Vault {
  address: string
  receiver: string
  authority: string
  amount: string
  unlockTime: number
  claimed: boolean
}

export function AdministrateVaults() {
  const { address, isConnected } = useAccount()
  const [vaults, setVaults] = useState<Vault[]>([])
  const [loading, setLoading] = useState(false)
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null)

  // State for editing
  const [editingVault, setEditingVault] = useState<string | null>(null)
  const [newReceiver, setNewReceiver] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [newTzOffset, setNewTzOffset] = useState(7 * 60) // Default GMT+7

  const fetchVaults = async () => {
    if (!address) return
    setLoading(true)
    try {
      // TODO: Fetch vaults where user is authority from contract
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

  const handleEditVault = (vault: Vault) => {
    setEditingVault(vault.address)
    setNewReceiver(vault.receiver)
    const defaultOffset = 7 * 60
    const { date, time } = msToDateTimeFields(vault.unlockTime * 1000, defaultOffset)
    setNewDate(date)
    setNewTime(time)
    setNewTzOffset(defaultOffset)
  }

  const handleUpdateReceiver = async (vault: Vault) => {
    if (!newReceiver) {
      alert('Enter new receiver address')
      return
    }

    try {
      // TODO: Implement setReceiver transaction
      console.log('Updating receiver for vault:', vault.address, 'to', newReceiver)
      await fetchVaults()
      setEditingVault(null)
    } catch (error) {
      console.error('Update failed:', error)
      alert('Update failed: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  const handleUpdateUnlockTime = async (vault: Vault) => {
    const ts = fieldsToEpoch(newDate, newTime, newTzOffset)
    const nowNum = Math.floor(Date.now() / 1000)

    if (!Number.isFinite(ts) || ts <= nowNum) {
      alert('New unlock time must be in the future')
      return
    }

    try {
      // TODO: Implement setDuration transaction
      console.log('Updating unlock time for vault:', vault.address, 'to', ts)
      await fetchVaults()
      setEditingVault(null)
    } catch (error) {
      console.error('Update failed:', error)
      alert('Update failed: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  if (!isConnected) {
    return (
      <div className="border rounded-lg p-6 text-center text-muted">
        <p>Connect your wallet to manage vaults</p>
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
        {vaults.map((vault) => (
          <div key={vault.address} className="border rounded-lg p-4 space-y-3">
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
                  ) : (
                    <span className="text-yellow-500">Active</span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted">Current Receiver</label>
              <div className="break-all text-sm text-foreground">{vault.receiver}</div>
            </div>

            <div>
              <label className="text-xs text-muted">Unlock Time</label>
              <div className="text-sm">{new Date(vault.unlockTime * 1000).toLocaleString()}</div>
            </div>

            {editingVault === vault.address && (
              <div className="border-t pt-3 space-y-3">
                <div className="space-y-2">
                  <label className="text-xs text-muted">New Receiver Address</label>
                  <input
                    type="text"
                    value={newReceiver}
                    onChange={(e) => setNewReceiver(e.target.value)}
                    placeholder="0x..."
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() => handleUpdateReceiver(vault)}
                    className="btn btn--solid w-full text-sm"
                  >
                    Update Receiver
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted">New Unlock Time</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="border rounded-md px-2 py-1 text-sm col-span-2"
                    />
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      step="60"
                      className="border rounded-md px-2 py-1 text-sm"
                    />
                  </div>
                  <select
                    value={newTzOffset}
                    onChange={(e) => setNewTzOffset(parseInt(e.target.value))}
                    className="w-full border rounded-md px-2 py-1 text-sm"
                  >
                    {TZ_OFFSETS.map((o) => (
                      <option key={o} value={o}>
                        {formatTzLabel(o)}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleUpdateUnlockTime(vault)}
                    className="btn btn--solid w-full text-sm"
                  >
                    Update Unlock Time
                  </button>
                </div>

                <button
                  onClick={() => setEditingVault(null)}
                  className="btn w-full text-sm"
                >
                  Cancel
                </button>
              </div>
            )}

            {editingVault !== vault.address && (
              <button
                onClick={() => handleEditVault(vault)}
                className="btn w-full"
              >
                Edit Vault
              </button>
            )}
          </div>
        ))}

        {vaults.length === 0 && !loading && (
          <div className="text-sm text-muted text-center py-8">
            No vaults found where you are the authority
          </div>
        )}
      </div>
    </div>
  )
}
