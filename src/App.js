import React, { useState, useEffect } from 'react';
import './App.css';
// index.js or App.js (at the top)
import { ToastContainer, toast } from 'react-custom-alert';
import 'react-custom-alert/dist/index.css'; 

import Logo from './logo.svg';


const { SigningStargateClient } = require("@cosmjs/stargate");

const App = () => {
  const [keplrConnected, setKeplrConnected] = useState(false);
  const [senderAddress, setSenderAddress] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [userbalance, setBalance] = useState(null);
  const [isSendButtonDisabled, setSendButtonDisabled] = useState(true); // Add this state



  

  useEffect(() => {
    const getBalance = async () => {
      try {
        const offlineSigner = window.getOfflineSigner('comdex-1');
        const accounts = await offlineSigner.getAccounts();
        const address = accounts.length > 0 ? accounts[0].address : null;

        if (address) {
          const balance = await getAccountBalance(address);
          setSenderAddress(address);
          setBalance(balance);
        }
      } catch (error) {
        setKeplrConnected(false);

        toast.error("Error connecting to Keplr. Please make sure Keplr is installed and enabled.");
      }
    };

    if (keplrConnected) {
      getBalance();
    }
  }, [keplrConnected]);

  const methodSelection = () => {
    setKeplrConnected(!keplrConnected);
  };
  const getAccountBalance = async (address) => {
    try {
      const chainId = "comdex-1";
      const offlineSigner = window.getOfflineSigner(chainId);
  
      // Use the Keplr wallet provider
      const offlineProvider = offlineSigner;
  
      // Query the account information
      const accountQuery = await offlineProvider.getAccounts();
      const accountInfo = accountQuery[0];
  
      if (accountInfo) {
     
  
        // Initialize the Stargate client
        const stargateClient = await SigningStargateClient.connectWithSigner(
          "https://rpc.comdex.one:443",
          offlineSigner
        );
  

        // Query the balance using the cosmos library
        const ucmdxBalance = await stargateClient.getBalance(
          accountInfo.address,
          "ucmdx"
        );
        
        // Retrieve the balance amount
        const cmdxBalance = Number(ucmdxBalance.amount)/10**6;

        return cmdxBalance;
      }
  
      return "0";
    } catch (error) {
      console.error("Error fetching balance:", error);
      return "0";
    }
  };
  


  const setAmountToMax= async () => {

    setAmount(userbalance);
    updateSendButtonDisabled(recipientAddress, userbalance); 
  
  }
  const handleRecipientChange = (e) => {
    setRecipientAddress(e.target.value);
    updateSendButtonDisabled(e.target.value, amount);
  };
  
  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    updateSendButtonDisabled(recipientAddress, e.target.value);
  };
  
  const updateSendButtonDisabled = (recipient, amount) => {
    setSendButtonDisabled(!recipient || !amount || !senderAddress);
  };
  

  const handleSendTokens = async (e) => {
    e.preventDefault();
    try {
      const chainId = "comdex-1";
  
      await window.keplr.enable(chainId);
  
      const offlineSigner = window.getOfflineSigner(chainId);
  
      const accounts = await offlineSigner.getAccounts();
      console.log(accounts);
  
      // Initialize the gaia api with the offline signer that is injected by Keplr extension.
      const stargateClient = await SigningStargateClient.connectWithSigner(
        "https://rpc.comdex.one:443",
        offlineSigner
      );
  
      const newAmount = ((amount * 10 ** 6) - 100000).toString();
      const denom = "ucmdx";
  
      const sendTokens = await stargateClient.sendTokens(
        accounts[0].address,
        recipientAddress,
        [
          {
            denom: denom,
            amount: newAmount,
          },
        ],
        {
          amount: [{ denom: denom, amount: "100000" }],
          gas: "100000",
        }
      );
      




      // stargateClient.signAndBroadcast(accounts[0].address, sendTokens)
  
      console.log(sendTokens);

      toast.success("Tokens sent successfully!");
      const updatedBalance = await getAccountBalance(accounts[0].address);
      setBalance(updatedBalance);
    } catch (error) {
      const chainId = "comdex-1";
  
      await window.keplr.enable(chainId);
  
      const offlineSigner = window.getOfflineSigner(chainId);
  
      const accounts = await offlineSigner.getAccounts();

      console.error("Error in handleSendTokens:", error);
      toast.success("Tokens sent successfully!");
      const updatedBalance = await getAccountBalance(accounts[0].address);
      setBalance(updatedBalance);
      // Handle the error here, you can log it or show a user-friendly message
    }
  };
  

  return (
    <div>
      <div className='container'>
      <nav className="navbar">
        <img src={Logo} alt="Logo" style={{ width: '150px', height: '50px', marginRight: '10px' }} />
        <button className="btn outside-border" onClick={methodSelection}>
          {keplrConnected ? 'Connected' : 'Connect Wallet'}
        </button>
      </nav>

      </div>

      <main>
        <form>
          <div className='oneliner'>
            <label className='space'>Sender Address:</label>
            <input type="text" value={senderAddress} readOnly />
          </div>

          <div className='oneliner'>
            <label className='space'>Recipient Address:</label>
            <input
  type="text"
  value={recipientAddress}
  onChange={handleRecipientChange}
/>

          </div>

          <div className='oneliner'>
            <div className='internal-flex'>

            <label className='space'>Amount:</label>
            <div className='internal'>
            <p>Balance: {userbalance}</p>
                <button type="button" className="btn-auto max" onClick={setAmountToMax}>
                  Max
                </button>
            </div>
            </div>


          
            <input
  type="number"
  value={amount}
  onChange={handleAmountChange}
/>
    
               


          </div>

          <button type="button"  className='new-btn' onClick={(e) => handleSendTokens(e)} disabled={isSendButtonDisabled}>
  Send Tokens
</button>

        </form>
      </main>
      <ToastContainer />
    </div>
  );
};


export default App;
