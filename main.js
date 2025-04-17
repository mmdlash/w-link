import { WalletConnectModalSign } from "@walletconnect/modal-sign-html";
import { ethers } from "ethers";

// جایگزین کن با Project ID خودت از WalletConnect
const projectId = "4d08946e6c316bed5e76b450ccbb5256";

const provider = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org/");

let userAddress = null;
let session = null;

const modal = new WalletConnectModalSign({
  projectId,
  metadata: {
    name: "BNB Wallet App",
    description: "Direct connect to Trust and MetaMask",
    url: "https://yourdomain.com",
    icons: ["https://walletconnect.com/walletconnect-logo.png"]
  }
});

document.getElementById("connectTrust").addEventListener("click", async () => {
  await connectWithWallet("trust");
});

document.getElementById("connectMetaMask").addEventListener("click", async () => {
  await connectWithWallet("metamask");
});

async function connectWithWallet(walletType) {
  try {
    const { uri, approval } = await modal.signClient.connect({
      requiredNamespaces: {
        eip155: {
          methods: ["eth_sendTransaction"],
          chains: ["eip155:56"],
          events: ["accountsChanged", "chainChanged"]
        }
      }
    });

    if (uri) {
      const encodedUri = encodeURIComponent(uri);
      let deepLink = "";

      if (walletType === "trust") {
        deepLink = `https://link.trustwallet.com/wc?uri=${encodedUri}`;
      } else if (walletType === "metamask") {
        deepLink = `https://metamask.app.link/wc?uri=${encodedUri}`;
      }

      window.location.href = deepLink;
    }

    session = await approval();
    const address = session.namespaces.eip155.accounts[0].split(":")[2];
    userAddress = address;
    document.getElementById("address").textContent = address;

    const balance = await provider.getBalance(address);
    const bnb = ethers.formatEther(balance);
    document.getElementById("balance").textContent = `${bnb} BNB`;

  } catch (err) {
    console.error("Connection error:", err);
    alert("Connection failed: " + (err?.message || err));
  }
}