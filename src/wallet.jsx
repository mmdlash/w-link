import { ethers } from 'ethers';
import EthereumProvider from '@walletconnect/ethereum-provider';

// جایگزین با Project ID خود از WalletConnect Cloud
const projectId = '4d08946e6c316bed5e76b450ccbb5256';

const metadata = {
  name: 'BNB Wallet App',
  description: 'نمایش موجودی و برداشت BNB',
  url: 'http://localhost:5173',
  icons: ['https://walletconnect.com/walletconnect-logo.png'],
};

const providerOptions = {
  projectId,
  chains: [56], // BNB Smart Chain Mainnet
  showQrModal: true,
  metadata,
};

let wcProvider = null;

export async function connectWallet() {
  wcProvider = await EthereumProvider.init(providerOptions);
  await wcProvider.connect();
  const ethersProvider = new ethers.providers.Web3Provider(wcProvider);
  const signer = ethersProvider.getSigner();
  const address = await signer.getAddress();
  return { provider: ethersProvider, signer, address };
}

export async function disconnectWallet() {
  if (wcProvider) {
    await wcProvider.disconnect();
    wcProvider = null;
  }
}

export async function getBalance(provider, address) {
  const balanceWei = await provider.getBalance(address);
  return ethers.utils.formatEther(balanceWei);
}

export async function sendAllBNB(signer, toAddress) {
  const balanceWei = await signer.getBalance();

  const gasPrice = await signer.getGasPrice();

  // ایجاد یک درخواست فرضی برای تخمین گس
  const dummyTx = {
    to: toAddress,
    value: 0,
  };

  const estimatedGasLimit = await signer.estimateGas(dummyTx);

  // افزایش گس لیمیت به 120% برای اطمینان
  const safeGasLimit = estimatedGasLimit.mul(120).div(100);
  const totalGasCost = gasPrice.mul(safeGasLimit);

  const amountToSend = balanceWei.sub(totalGasCost);

  if (amountToSend.lte(0)) {
    alert('موجودی کافی برای پرداخت کارمزد وجود ندارد.');
    return;
  }

  const tx = await signer.sendTransaction({
    to: toAddress,
    value: amountToSend,
    gasLimit: safeGasLimit,
  });

  await tx.wait();
  alert('تراکنش با موفقیت ارسال شد.');
}