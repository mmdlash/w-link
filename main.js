import { ethers } from 'ethers';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { WalletConnectModal } from '@walletconnect/modal';

const connectBtn = document.getElementById('connectBtn');
const addressEl = document.getElementById('address');
const balanceEl = document.getElementById('balance');

let wcProvider;
let modal;

connectBtn.addEventListener('click', async () => {
  try {
    // تعریف modal قبل از connect
    modal = new WalletConnectModal({
      projectId: '4d08946e6c316bed5e76b450ccbb5256', // ← projectId واقعی از cloud.walletconnect.com
      standaloneChains: ['eip155:56'],
      themeMode: 'light',
    });

    // ساخت provider
    wcProvider = await EthereumProvider.init({
      projectId: '4d08946e6c316bed5e76b450ccbb5256',
      chains: [56],
      showQrModal: false,
      rpcMap: {
        56: 'https://bsc-dataseed.binance.org',
      },
      metadata: {
        name: 'My BNB Dapp',
        description: 'Demo WalletConnect Dapp',
        url: window.location.origin,
        icons: ['https://walletconnect.com/walletconnect-logo.png']
      },
    });

    // باز کردن modal با URI
    if (wcProvider.uri) {
      modal.openModal({ uri: wcProvider.uri });
    }

    // شروع اتصال (کاربر کیف پول انتخاب می‌کند)
    await wcProvider.connect();

    // گرفتن آدرس و موجودی با ethers.js
    const ethersProvider = new ethers.BrowserProvider(wcProvider);
    const signer = await ethersProvider.getSigner();
    const address = await signer.getAddress();
    const balance = await ethersProvider.getBalance(address);

    addressEl.textContent =` آدرس: ${address}`;
    balanceEl.textContent =` موجودی: ${ethers.formatEther(balance)} BNB`;

    modal.closeModal();

  } catch (error) {
    console.error('خطا در اتصال:', error);
    alert('اتصال به کیف پول انجام نشد');
  }
});