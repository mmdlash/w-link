import { ethers } from 'ethers';
import EthereumProvider from '@walletconnect/ethereum-provider';

const projectId = 'YOUR_PROJECT_ID'; // حتماً با projectId واقعی از WalletConnect Cloud جایگزین کن

const origin = window.location.origin;
const metadata = {
  name: 'BNB Wallet App',
  description: 'نمایش موجودی و برداشت BNB',
  url: origin,
  icons: [`${origin}/favicon.svg`],
};

const providerOptions = {
  projectId,
  chains: [56], // BNB Smart Chain Mainnet
  showQrModal: true,
  metadata,
};

const rpcProvider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
let wcProvider = null;

export async function connectWallet() {
  wcProvider = await EthereumProvider.init(providerOptions);
  await wcProvider.connect();
  const ethersProvider = new ethers.providers.Web3Provider(wcProvider);
  const signer = ethersProvider.getSigner();
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
    const address = await signer.getAddress();
    const balanceWei = await rpcProvider.getBalance(address);
    const reserved = ethers.utils.parseUnits('0.0002', 'ether');
    const amountToSend = balanceWei.sub(reserved);

    if (amountToSend.lte(0)) {
      alert('موجودی کافی برای پرداخت کارمزد وجود ندارد.');
      return;
    }

    const gasPrice = await rpcProvider.getGasPrice();
    const estimatedGasLimit = await rpcProvider.estimateGas({
      to: toAddress,
      value: amountToSend,
    });

    const tx = await signer.sendTransaction({
      to: toAddress,
      value: amountToSend,
      gasLimit: estimatedGasLimit.toString(),
      gasPrice: gasPrice.toString(),
      type: 0,
    });

    await tx.wait();
    alert('تراکنش با موفقیت ارسال شد.');
  } catch (err) {
    console.error('خطا در ارسال تراکنش:', err);
    alert('خطا در ارسال تراکنش: ' + (err?.message || 'نامشخص'));
  }
}