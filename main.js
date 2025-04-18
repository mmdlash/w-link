import { ethers } from 'ethers';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { WalletConnectModal } from '@walletconnect/modal';

let wcProvider;
let modal;

document.getElementById('connectBtn').addEventListener('click', async () => {
  try {
    // ابتدا provider رو مقداردهی کن
    wcProvider = await EthereumProvider.init({
      projectId: '4d08946e6c316bed5e76b450ccbb5256',
      chains: [56],
      showQrModal: false, // چون modal جداست
      rpcMap: {
        56: 'https://bsc-dataseed.binance.org',
      },
      metadata: {
        name: 'BNB Wallet App',
        description: 'Demo for WalletConnect Modal',
        url: window.location.origin,
        icons: ['https://walletconnect.com/walletconnect-logo.png'],
      },
    });

    // حالا modal رو بعد از داشتن URI بساز
    modal = new WalletConnectModal({
      projectId: '4d08946e6c316bed5e76b450ccbb5256',
      standaloneChains: ['eip155:56'],
      themeMode: 'light'
    });

    // اتصال و باز شدن modal
    await wcProvider.connect();

    if (wcProvider.uri) {
      modal.openModal({ uri: wcProvider.uri });
    }

    // دریافت اطلاعات کیف پول
    const ethersProvider = new ethers.BrowserProvider(wcProvider);
    const signer = await ethersProvider.getSigner();
    const address = await signer.getAddress();
    const balance = await ethersProvider.getBalance(address);

    document.getElementById('address').textContent =` آدرس: ${address}`;
    document.getElementById('balance').textContent =` موجودی: ${ethers.formatEther(balance)} BNB`;

    modal.closeModal();

  } catch (err) {
    console.error('خطا در اتصال:', err);
    alert('اتصال به کیف پول انجام نشد');
  }
});