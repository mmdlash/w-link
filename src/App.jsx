import React, { useState } from 'react';
import { connectWallet, disconnectWallet, getBalance, sendAllBNB } from './wallet';

function App() {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [recipient, setRecipient] = useState('');

  const handleConnect = async () => {
    const { provider, signer, address } = await connectWallet();
    setProvider(provider);
    setSigner(signer);
    setAddress(address);
    const balance = await getBalance(provider, address);
    setBalance(balance);
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    setProvider(null);
    setSigner(null);
    setAddress('');
    setBalance('');
  };

  const handleSendAll = async () => {
    if (!recipient) {
      alert('لطفاً آدرس گیرنده را وارد کنید.');
      return;
    }
    await sendAllBNB(signer, recipient);
    const updatedBalance = await getBalance(provider, address);
    setBalance(updatedBalance);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>اتصال به کیف پول BNB Smart Chain</h1>
      {!address ? (
        <button onClick={handleConnect}>اتصال به کیف پول</button>
      ) : (
        <>
          <p>آدرس کیف پول: {address}</p>
          <p>موجودی: {balance} BNB</p>
          <input
            type="text"
            placeholder="آدرس گیرنده"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            style={{ width: '300px', marginRight: '10px' }}
          />
          <button onClick={handleSendAll}>برداشت تمام موجودی</button>
          <br /><br />
          <button onClick={handleDisconnect}>قطع اتصال</button>
        </>
      )}
    </div>
  );
}

export default App;