import { ethers } from 'ethers';
import EthereumProvider from '@walletconnect/ethereum-provider';

// YOUR_PROJECT_ID را با Project ID واقعی‌تان جایگزین کنید
const projectId = '4d08946e6c316bed5e76b450ccbb5256';

// داینامیک کردن آدرس (لوکال یا هر هاست دیگری)
const origin = window.location.origin;

const metadata = {
  name: 'BNB Wallet App',
  description: 'نمایش موجودی و برداشت BNB',
  url: origin,                     // ← اینجا
  icons: [`${origin}/favicon.svg`],// ← و اینجا
};

const providerOptions = {
  projectId,
  chains: [56],    // BNB Smart Chain Mainnet
  showQrModal: true,
  metadata,
};

// یک RPC مستقیم برای خواندن اطلاعات (balance, gas)
const rpcProvider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/');

let wcProvider = null;

export async function connectWallet() {
  wcProvider = await EthereumProvider.init(providerOptions);
  await wcProvider.connect();
  const ethersWalletProvider = new ethers.providers.Web3Provider(wcProvider);
  const signer = ethersWalletProvider.getSigner();
  const address = await signer.getAddress();
  return { signer, address };
}

export async function disconnectWallet() {
  if (wcProvider) {
    await wcProvider.disconnect();
    wcProvider = null;
  }
}

export async function getBalance(_, address) {
  const balanceWei = await rpcProvider.getBalance(address);
  return ethers.utils.formatEther(balanceWei);
}

export async function sendAllBNB(signer, toAddress) {
  try {
    // 1. موجودی را از RPC بخوان
    const address = await signer.getAddress();
    const balanceWei = await rpcProvider.getBalance(address);

    // 2. بافر برای گس بگذار
    const reservedForGas = ethers.utils.parseUnits("0.0002", "ether");
    const amountToSend = balanceWei.sub(reservedForGas);
    if (amountToSend.lte(0)) {
      alert('موجودی کافی برای پرداخت کارمزد وجود ندارد.');
      return;
    }

    // 3. gasPrice و gasLimit را از RPC تخمین بزن
    const gasPrice = await rpcProvider.getGasPrice();
    const estimatedGasLimit = await rpcProvider.estimateGas({
      to: toAddress,
      value: amountToSend,
    });

    // 4. فقط یک eth_sendTransaction به کیف پول بفرست
    const tx = await signer.sendTransaction({
      to: toAddress,
      value: amountToSend,
      gasLimit: estimatedGasLimit.toString(),
      gasPrice: gasPrice.toString(),
      type: 0,  // تراکنش سنتی (بدون EIP‑1559)
    });

    await tx.wait();
    alert('تراکنش با موفقیت ارسال شد.');
  } catch (err) {
    console.error('خطا در ارسال تراکنش:', err);
    alert('خطا در ارسال تراکنش: ' + (err?.message || 'نامشخص'));
  }
}