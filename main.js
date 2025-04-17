import SignClient from "@walletconnect/sign-client";
import { ethers } from "ethers";

// جایگزین کن با Project ID واقعی از WalletConnect Cloud
const projectId = "4d08946e6c316bed5e76b450ccbb5256";
const provider = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org/");

let client;
let session;
let userAddress = null;

document.getElementById("connectTrust").addEventListener("click", () => {
  connectWithWallet("trust");
});

document.getElementById("connectMetaMask").addEventListener("click", () => {
  connectWithWallet("metamask");
});

async function connectWithWallet(wallet) {
  try {
    if (!client) {
      client = await SignClient.init({
        projectId,
        metadata: {
          name: "BNB Sender App",
          description: "Send BNB to an address",
          url: "https://yourdomain.com",
          icons: ["https://walletconnect.com/walletconnect-logo.png"]
        }
      });
    }

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
      const encoded = encodeURIComponent(uri);
      let link = "";

      if (wallet === "trust") {
        link = `https://link.trustwallet.com/wc?uri=${encoded}`;
      } else if (wallet === "metamask") {
        link = `metamask://wc?uri=${encoded}`; // استفاده از native link
      }

      window.location.href = link;
    }

    session = await approval();
    const address = session.namespaces.eip155.accounts[0].split(":")[2];
    userAddress = address;
    document.getElementById("address").textContent = address;

    const balance = await provider.getBalance(address);
    document.getElementById("balance").textContent = `${ethers.formatEther(balance)} BNB`;

  } catch (err) {
    console.error("Connection error:", err);
    alert("Connection failed: " + (err?.message || err));
  }
}