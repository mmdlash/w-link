import { ethers } from 'ethers';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { WalletConnectModal } from '@walletconnect/modal';

let wcProvider;

// راه‌اندازی Modal
const modal = new WalletConnectModal({
  projectId: '4d08946e6c316bed5e76b450ccbb5256', // ← حتماً جایگزین کن
  standaloneChains: ['eip155:56'],
  themeMode: 'light'
});

document.getElementById('connectBtn').addEventListener('click', async () => {
  try {
    wcProvider = await EthereumProvider.init({
      projectId: '4d08946e6c316bed5e76b450ccbb5256',
      chains: [56],
      showQrModal: false,
      rpcMap: {
        56: 'https://bsc-dataseed.binance.org',
      },
      metadata: {
        name: 'My BNB App',
        description: 'Demo WalletConnect Modal + ethers.js',
        url: window.location.origin,
        icons: ['https://walletconnect.com/walletconnect-logo.png'],
      }
    });

    // باز کردن Modal
    modal.openModal({ uri: wcProvider.uri });

    // اتصال به کیف پول
    await wcProvider.connect();

    const ethersProvider = new ethers.BrowserProvider(wcProvider);
    const signer = await ethersProvider.getSigner();
    const address = await signer.getAddress();
    const balance = await ethersProvider.getBalance(address);

    // نمایش اطلاعات
    document.getElementById('address').textContent =` آدرس: ${address}`;
    document.getElementById('balance').textContent =` موجودی: ${ethers.formatEther(balance)} BNB`;

    modal.closeModal();

  } catch (err) {
    console.error('خطا در اتصال:', err);
    alert('اتصال انجام نشد');
  }
});