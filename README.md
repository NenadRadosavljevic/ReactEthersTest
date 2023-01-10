# ReactEthersTest

## Getting started
* Copy project to your directory ( `git clone https://github.com/NenadRadosavljevic/ReactEthersTest` )
* Install Hardhat and project packages (`npm install --save-dev @nomiclabs/hardhat-ethers ethers @nomiclabs/hardhat-waffle ethereum-waffle chai`)
* Compile the project (`npx hardhat compile`)

Other required project packages
```bash
npm install hardhat-helpers
npm install hardhat-tracer
npm install react-bootstrap bootstrap
npm install react-hot-toast
```

## Description
This is simple React app that test communication with smart contract using ethers.js library and signing transactions with Metamask.
Sending transactions, calling smart contract functions, and listening to contract events and logs.

## Deployment scripts and hardhat configuration
* Deployment script for the ReactEthersTest is in `/scripts/deploy.js`.
* Configuration for the local blockchain (Hardhat network), ABI path are in `hardhat.config.js`.
Note: the chainID must be 1337 to be able to metamask interacts with the local host.

## Run project
```bash
npx hardhat clean
npx hardhat compile
npx hardhat node (leave it running)
npx hardhat run scripts/deploy.js --network localhost
run npm start
```
