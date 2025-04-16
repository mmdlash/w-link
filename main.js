import { ethers } from "ethers";
import {
  WalletConnectModalSign
} from "@walletconnect/modal-sign-html";

// جایگزین کن با projectId خودت
const projectId = "4d08946e6c316bed5e76b450ccbb5256"; 

const modal = new WalletConnectModalSign({
  projectId,
  enableExplorer: false, // اختیاری: برای غیرفعال کردن modal wallet explorer
  metadata: {
    name: "BNB Wallet App",
    description: "WalletConnect BNB Example",
    url: "http://localhost",
    icons: ["https://walletconnect.com/walletconnect-logo.png"],
  },
  explorerRecommendedWalletIds: [
    // لیست ولت‌هایی که پشتیبانی کنیم (فقط موبایل)
    "trust",
    "metamask"
  ],
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
const addressSpan = document.getElementById("address");
const balanceSpan = document.getElementById("balance");

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

    const provider = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org/");
    const balance = await provider.getBalance(address);
    const bnb = ethers.formatEther(balance);
    balanceSpan.textContent = `${bnb} BNB`;
  } catch (err) {
    console.error("Connection failed", err);
  }
});