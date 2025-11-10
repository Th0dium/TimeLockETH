import { WalletButton } from '../components/WalletButton'
import { CreateVaultForm } from '../components/CreateVaultForm'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">TimeLock ETH</h1>
          <WalletButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Time-Lock Your Ethereum</h2>
          <p className="text-gray-400">
            Lock ETH in a smart contract vault on Sepolia testnet.
            Set unlock time and optional authority permissions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <CreateVaultForm />
          </div>

          <div className="p-6 bg-gray-800 rounded-lg">
            <h3 className="text-xl font-bold mb-4">How it works</h3>
            <ol className="space-y-3 text-gray-300">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm">1</span>
                <span>Connect your wallet with MetaMask or other Web3 wallet</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm">2</span>
                <span>Specify receiver address and lock duration</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm">3</span>
                <span>Optionally set authority with permissions to modify vault</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm">4</span>
                <span>Send ETH to create the time-locked vault</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm">5</span>
                <span>Receiver can withdraw after unlock time</span>
              </li>
            </ol>

            <div className="mt-6 p-4 bg-gray-900 rounded-md">
              <h4 className="font-semibold mb-2">Contract Info</h4>
              <p className="text-sm text-gray-400 break-all">
                Address: 0x52F6e2fF2EA20BC0AE819CF9b579AF29e49d53d6
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Network: Sepolia Testnet
              </p>
              <a
                href="https://sepolia.etherscan.io/address/0x52F6e2fF2EA20BC0AE819CF9b579AF29e49d53d6"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300 mt-2 inline-block"
              >
                View on Etherscan →
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
