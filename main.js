import { ethers } from 'ethers';
import EthereumProvider from '@walletconnect/ethereum-provider';

const connectBtn = document.getElementById('connectBtn');
const addressEl = document.getElementById('address');
const balanceEl = document.getElementById('balance');

connectBtn.addEventListener('click', async () => {
  console.log("دکمه کلیک شد");

  try {
    const wcProvider = await EthereumProvider.init({
      projectId: '4d08946e6c316bed5e76b450ccbb5256', // ← حتماً جایگزین کن با ID خودت
      chains: [56], // BNB Smart Chain
      showQrModal: false,
      rpcMap: {
        56: 'https://bsc-dataseed.binance.org',
      },
      metadata: {
        name: 'BNB Wallet App',
        description: 'Demo BNB app with WalletConnect V2',
        url: window.location.origin, // ← مشکل خطا حل شد!
        icons: ['https://walletconnect.com/walletconnect-logo.png']
      }
    });

    await wcProvider.connect();

    if (wcProvider.uri) {
      const encoded = encodeURIComponent(wcProvider.uri);
      const wcLink = `https://walletconnect.com/wc?uri=${encoded}`;
      console.log('WalletConnect URI:', wcProvider.uri);
      window.location.href = wcLink;
      return;
    }

    const ethersProvider = new ethers.BrowserProvider(wcProvider);
    const signer = await ethersProvider.getSigner();
    const address = await signer.getAddress();
    const balance = await ethersProvider.getBalance(address);

    addressEl.textContent =` آدرس: ${address}`;
    balanceEl.textContent =` موجودی: ${ethers.formatEther(balance)} BNB`;

  } catch (error) {
    console.error('خطا در اتصال:', error);
    alert('خطا در اتصال به کیف پول');
  }
});