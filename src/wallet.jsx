import { ethers } from 'ethers';
import EthereumProvider from '@walletconnect/ethereum-provider';

// -------- تنظیمات --------
const projectId = '4d08946e6c316bed5e76b450ccbb5256'; // از WalletConnect Cloud
const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/'; // RPC عمومی BSC

// یک provider جدا برای خواندن زنجیره (موجودی، estimateGas، gasPrice)
const rpcProvider = new ethers.providers.JsonRpcProvider(BSC_RPC_URL);

// متادیتای کیف برای نمایش در WalletConnect
const metadata = {
  name: 'BNB Wallet App',
  description: 'نمایش موجودی و برداشت BNB',
  url: 'http://localhost:5173',
  icons: ['https://walletconnect.com/walletconnect-logo.png'],
};

const providerOptions = {
  projectId,
  chains: [56],     // BNB Smart Chain Mainnet
  showQrModal: true,
  metadata,
};

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

// فقط با RPC مستقیم خوندنِ موجودی
export async function getBalance(_, address) {
  const balanceWei = await rpcProvider.getBalance(address);
  return ethers.utils.formatEther(balanceWei);
}

export async function sendAllBNB(signer, toAddress) {
  try {
    // 1. موجودی کل رو از RPC بگیر
    const address = await signer.getAddress();
    const balanceWei = await rpcProvider.getBalance(address);

    // 2. یک بافر ثابت برای گس کنار بذار
    const reservedForGas = ethers.utils.parseUnits("0.0002", "ether");
    const amountToSend = balanceWei.sub(reservedForGas);
    if (amountToSend.lte(0)) {
      alert('موجودی کافی برای پرداخت کارمزد وجود ندارد.');
      return;
    }

    // 3. قیمت و حدس گس رو از RPC بگیر
    const gasPrice = await rpcProvider.getGasPrice();
    const estimatedGasLimit = await rpcProvider.estimateGas({
      to: toAddress,
      value: amountToSend,
    });

    // 4. فقط یک درخواست eth_sendTransaction میره به کیف پول
    const tx = await signer.sendTransaction({
      to: toAddress,
      value: amountToSend,
      gasLimit: estimatedGasLimit.toString(),
      gasPrice: gasPrice.toString(),
      type: 0, // تراکنش سنتی (بدون EIP-1559)
    });

    await tx.wait();
    alert('تراکنش با موفقیت ارسال شد.');
  } catch (err) {
    console.error('خطا در ارسال تراکنش:', err);
    alert('خطا در ارسال تراکنش: ' + (err?.message || 'نامشخص'));
  }
}