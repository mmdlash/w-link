import { ethers } from 'ethers';
import EthereumProvider from '@walletconnect/ethereum-provider';

// جایگزین کن با Project ID واقعی از WalletConnect Cloud
const projectId = '4d08946e6c316bed5e76b450ccbb5256';

const metadata = {
  name: 'BNB Wallet App',
  description: 'نمایش موجودی و برداشت BNB',
  url: 'http://localhost:5173',
  icons: ['https://walletconnect.com/walletconnect-logo.png'],
};

const providerOptions = {
  projectId,
  chains: [56], // BNB Smart Chain
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
  try {
    const balanceWei = await signer.getBalance();
    const reservedForGas = ethers.utils.parseUnits("0.0002", "ether");
    const amountToSend = balanceWei.sub(reservedForGas);

    if (amountToSend.lte(0)) {
      alert('موجودی کافی برای پرداخت کارمزد وجود ندارد.');
      return;
    }

    const estimatedGasLimit = await signer.estimateGas({
      to: toAddress,
      value: amountToSend,
    });

    const gasPrice = await signer.getGasPrice();

    const tx = await signer.sendTransaction({
      to: toAddress,
      value: amountToSend,
      gasLimit: estimatedGasLimit.toString(), // تبدیل به string برای سازگاری کامل
      gasPrice: gasPrice.toString(),
      type: 0, // تراکنش سنتی (EIP-1559 خاموش)
    });

    await tx.wait();
    alert('تراکنش با موفقیت انجام شد.');
  } catch (err) {
    console.error('خطا در ارسال تراکنش:', err);
    alert('خطا در ارسال تراکنش: ' + (err?.message || 'نامشخص'));
  }
}