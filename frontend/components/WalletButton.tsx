'use client'

import { useAppKit } from '@reown/appkit/react'

export function WalletButton() {
  const { open } = useAppKit()

  return (
    <button
      onClick={() => open()}
      className="btn btn--solid"
    >
      <appkit-button />
    </button>
  )
}
