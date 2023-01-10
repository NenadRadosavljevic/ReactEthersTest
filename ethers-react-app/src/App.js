import * as React from "react";
import {ethers} from 'ethers';
import toast, { Toaster } from "react-hot-toast";
import MyTestContract from './artifacts/contracts/MyTestContract.sol/MyTestContract.json';

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";



export class App extends React.Component {

  constructor(props) {
      super(props);
      this.state = {contract_storage_text: ""}
      this.state = {contract_balance: ""}
      this.state = {contract_balance_from_provider: ""}
      this.state = {account_balance: ""}
      this.state = {events: []}
  }
 
  // Smart contract events watcher.
  // componentDidMount() is a hook that gets invoked right after 
  // a React component has been mounted.
  componentDidMount() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, MyTestContract.abi, provider);

    // Watch for events
    contract.on("EthReceived", (from, amount, time, event) => {
      console.log("New event triggered by the smart contract !!!");
      // console.log("from ", from);
      // console.log("amount ", ethers.utils.formatEther(amount));
      const date = new Date(time*1000);
      this.setState(state => ({
        events: [
            ...state.events, 
            { 
                from, 
                amount: ethers.utils.formatEther(amount), 
                time: date.toString(), 
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash
            }]
      }));
    /*
      return () => {
        contract.removeAllListeners();
      };
    */
    });
  }

  async fetchText() {
    if (typeof window.ethereum !== "undefined") {
      //ethereum is usable get reference to the contract
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MyTestContract.abi, provider);

      //try to get the text from the contract
      try {
          const data = await contract.getText();
          this.setState({contract_storage_text: data});
          console.log("Data: ", data);
        } catch (e) {
            console.log("Err: ", e)
        }
      }
    }

  async setText(newText) {
      if (newText && typeof window.ethereum !== "undefined") {
          //ethereum is usable, get reference to the contract
          await this.requestAccount();
          const provider = new ethers.providers.Web3Provider(window.ethereum);

          //signer needed for transaction that changes state
          const signer = provider.getSigner();
          const contract = new ethers.Contract(CONTRACT_ADDRESS, MyTestContract.abi, signer);

          // perform transaction
          const transaction = await contract.setText(newText);
          await transaction.wait();
         // this.fetchText();

         try {
            const receipt = await provider.getTransactionReceipt(transaction.hash);
            // console.log('Data: ', receipt.logs);
            let eventLog = receipt.logs[0] 
            // Use the contracts interface
            let log = contract.interface.parseLog(eventLog); 
            console.log('Data: ', log);
            let oldText = log.args[1];
            let newText  = log.args[2];
            let textToDisplay = "Text is successfully changed from  " + oldText + " to " + newText;
            toast.success(textToDisplay, {duration: 7000, style: {maxWidth: 450}});
        } catch (e) {
            console.log("Err: ", e)
        }
      }
  }

  async fetchBalance() {
    if (typeof window.ethereum !== "undefined") {
      //ethereum is usable get reference to the contract
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MyTestContract.abi, provider);

      //try to fetch the ethers balance from the contract
      try {
          const data = await contract.getBalance();
          const balanceInEther = ethers.utils.formatEther(data);     
          this.setState({contract_balance: balanceInEther});
          console.log("Data: ", data);
      } catch (e) {
          console.log("Err: ", e)
      }
    }
}

async fetchBalanceFromProvider() {
    if (typeof window.ethereum !== "undefined") {
      //ethereum is usable get reference to the contract
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      //try to fetch the contract balance from the provider
      try {
        const data = await provider.getBalance(CONTRACT_ADDRESS);
        const balanceInEther = ethers.utils.formatEther(data); 

          this.setState({contract_balance_from_provider: balanceInEther});
          console.log("Data: ", data);
      } catch (e) {
          console.log("Err: ", e)
      }
    }
}

async getAccountBalance(address) {
    if (address && typeof window.ethereum !== "undefined") {
      //ethereum is usable get reference to the contract
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MyTestContract.abi, provider);

      //try to fetch the specific ethereum account balance from the contract function
      try {
          const data = await contract.getAccountBalance(address);
          const balanceInEther = ethers.utils.formatEther(data);     
          this.setState({account_balance: balanceInEther});
          console.log("Data: ", data);
      } catch (e) {
          console.log("Err: ", e)
      }
    }
}

async sendEth(etherAmount) {
    if (etherAmount && typeof window.ethereum !== "undefined") {
        //ethereum is usable, get reference to the contract
        await this.requestAccount();
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        //signer needed for transaction that changes state
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, MyTestContract.abi, signer);

        // perform transaction and eth to the contract's account
        const params = { to: CONTRACT_ADDRESS, value: ethers.utils.parseEther(etherAmount)};
        // deposit ethers by calling contract's receive function
        const txHash = await signer.sendTransaction(params);            
        await txHash.wait();

        try {
            const receipt = await provider.getTransactionReceipt(txHash.hash);
            // console.log('Data: ', receipt.logs);
            let eventLog = receipt.logs[0] 
            // Use the contracts interface
            let log = contract.interface.parseLog(eventLog); 
            let account  = log.args[0];
            let amountSent = log.args[1];
            let textToDisplay = "Successfully sent " + ethers.utils.formatEther(amountSent) + " ethers from " + account;
            toast.success(textToDisplay, {duration: 7000, style: {maxWidth: 450}});
        } catch (e) {
            console.log("Err: ", e)
        }

    }
}

async withdrawEth(etherAmount) {
    if (etherAmount && typeof window.ethereum !== "undefined") {
        //ethereum is usable, get reference to the contract
        await this.requestAccount();
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        //signer needed for transaction that changes state
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, MyTestContract.abi, signer);
        
        // perform transaction
        // amount to withdraw in ethers, convert it  to wei
        const amount = ethers.utils.parseEther(etherAmount);
        const transaction = await contract.withdrawETH(amount);
        await transaction.wait();

        try {
            const receipt = await provider.getTransactionReceipt(transaction.hash);
            // console.log('Data: ', receipt.logs);
            let eventLog = receipt.logs[0] 
            // Use the contracts interface
            let log = contract.interface.parseLog(eventLog); 
            // console.log('Data: ', log);
            let amountWithdrawn = log.args[1];
            let account  = log.args[0];
            let textToDisplay = "Successfully withdrawn " + ethers.utils.formatEther(amountWithdrawn) + " ethers to " + account;
            toast.success(textToDisplay, {duration: 7000, style: {maxWidth: 450}});
        } catch (e) {
            console.log("Err: ", e)
        }

    }
}

  async requestAccount() {
      await window.ethereum.request({method: 'eth_requestAccounts'});
  }

  render() {
    return (
        <div className="main__wrap" >
            <div>
                <center> <h1> REACT and ethers.js test </h1> </center>
            </div>
            <Toaster />
        <div>
        </div>
            <h1>Text: {this.state.contract_storage_text}</h1>
            <button className="click-btn" onClick={()=>this.fetchText()}>Get Text</button>
            <hr/>
            <input id={"new-text"} placeholder={"New Text"}/>
            <button className="click-btn" onClick={() => {
                const newText = document.getElementById("new-text").value;
                this.setText(newText);
            }}>Update Text</button>

            <div>
                <hr/>
                <h1>Contract balance in eth: {this.state.contract_balance}</h1>
                <button className="click-btn" onClick={()=>this.fetchBalance()}>Get Balance</button>
            </div>

            <div>
                <h1>Contract balance gets from a provider in eth: {this.state.contract_balance_from_provider}</h1>
                <button className="click-btn" onClick={()=>this.fetchBalanceFromProvider()}>Get Balance</button>
            </div>

            <div>
                <hr/>
                <input id={"account-balance"} placeholder={"account address"}/>
                <button className="click-btn" onClick={() => {
                    const address = document.getElementById("account-balance").value;
                    this.getAccountBalance(address);
                }}>Get Account Balance</button>
                <h1>Account Balance: {this.state.account_balance}</h1>
            </div>

            <div>
                <hr/>
                <h1>Deposit eth to the contract</h1>
            </div>
            <div>
                <input id={"eth-amount-deposit"} placeholder={"how many eth"}/>
                <button className="click-btn" onClick={() => {
                    const etherAmount = document.getElementById("eth-amount-deposit").value;
                    this.sendEth(etherAmount);
                }}>Send</button>
            </div>

            <div>
                <hr/>
                <h1>Withdraw eth from the contract</h1>
            </div>
            <div>
                <input id={"eth-amount-withdraw"} placeholder={"how many eth"}/>
                <button className="click-btn" onClick={() => {
                    const etherAmount = document.getElementById("eth-amount-withdraw").value;
                    this.withdrawEth(etherAmount);
                }}>Send</button>
            </div>
            <div>
                <hr/>
                <h1>Events are triggered when the deposit to the contract happens.</h1>
                <h3>Smart contract's receive function will emit the event.</h3>
                {this.state.events.map(event => (
                <div key={event.id}>
                    Block number: {event.blockNumber}<br />
                    Block time: {event.time}<br />
                    Transaction hash: {event.transactionHash}<br />
                    Received from account: {event.from}<br />
                    ETH amount: {event.amount}<br /><br />                   
                </div>
                ))}
            </div>
        </div>
    )
  }
}
