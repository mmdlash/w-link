import { ethers } from 'ethers';
import EthereumProvider from '@walletconnect/ethereum-provider';

document.addEventListener('DOMContentLoaded', () => {
  const connectBtn = document.getElementById('connectBtn');
  const addressEl = document.getElementById('address');
  const balanceEl = document.getElementById('balance');
  const walletLinks = document.getElementById('wallet-links');
  const trustBtn = document.getElementById('trust');
  const metamaskBtn = document.getElementById('metamask');

  let wcUri = '';

  connectBtn.addEventListener('click', async () => {
    try {
      const wcProvider = await EthereumProvider.init({
        projectId: 'YOUR_PROJECT_ID', // ← Project ID واقعی‌تو بذار
        chains: [56],
        showQrModal: false,
        rpcMap: {
          56: 'https://bsc-dataseed.binance.org',
        },
        metadata: {
          name: 'BNB Wallet App',
          description: 'Demo BNB app with WalletConnect V2',
          url: window.location.origin,
          icons: ['https://walletconnect.com/walletconnect-logo.png']
        }
      });

      await wcProvider.connect();
      wcUri = encodeURIComponent(wcProvider.uri);

      // نمایش گزینه‌های کیف پول
      walletLinks.style.display = 'block';

      // Listener اتصال واقعی بعد از اتصال کیف پول
      wcProvider.on("connect", async () => {
        const ethersProvider = new ethers.BrowserProvider(wcProvider);
        const signer = await ethersProvider.getSigner();
        const address = await signer.getAddress();
        const balance = await ethersProvider.getBalance(address);

        addressEl.textContent =` آدرس: ${address}`;
        balanceEl.textContent =` موجودی: ${ethers.formatEther(balance)} BNB`;
      });

    } catch (error) {
      console.error('خطا در اتصال:', error);
      alert('خطا در اتصال به کیف پول');
    }
  });

  trustBtn.onclick = () => {
    window.location.href = `trust://wc?uri=${wcUri}`;
  };

  metamaskBtn.onclick = () => {
    window.location.href = `metamask://wc?uri=${wcUri}`;
  };
});