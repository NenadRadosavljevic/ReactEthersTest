//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.11;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "hardhat/console.sol";

error EtherTransferFailed();

contract MyTestContract is ReentrancyGuard {
    string private some_text;

    event TextIsChanged(address indexed from, string oldText, string newText, bytes32 indexed newIndexedText);
    event Withdrawn(address indexed from, uint256 amount, uint256 time);
    event EthReceived(address indexed from, uint256 amount, uint256 time);

    constructor(string memory _some_text) payable {
        console.log("Deploying a MyTestContract with text:", _some_text);
        some_text = _some_text;
    }

    function getText() external view returns (string memory) {
        return some_text;
    }

    function setText(string memory _some_text) external {
        console.log("Changing text from '%s' to '%s'", some_text, _some_text);
        // Note: 
        // Topics are required to be 32 bytes long, so if string exceeds that length,
        // it will be hashed (keccak256) to fit into 32 bytes.
        bytes32 tmp = bytes32(abi.encodePacked(_some_text));
        emit TextIsChanged(msg.sender, some_text, _some_text, tmp);
        // update the contract state
        some_text = _some_text;
    }

    function getBalance() external view returns(uint256){
        return address(this).balance;
    }

    function getAccountBalance(address _account) external view returns(uint256){
        return address(_account).balance;
    }

    function withdrawETH(uint256 amount) external nonReentrant {
        require(address(this).balance >= amount, "Insufficient ETH balance!");
        require(msg.sender != address(0), "Zero address is not allowed.");
        require(msg.sender != address(this), "It's the contract's address.");

        uint256 _amountToWithdraw = amount;
        amount = 0;      

        // transfer ETH to the caller.
        (bool success,) = msg.sender.call{value:_amountToWithdraw}("");
        if (!success) {
            revert EtherTransferFailed(); 
        }  

        emit Withdrawn(msg.sender, _amountToWithdraw, block.timestamp);
    }

    receive() external payable {    
        emit EthReceived(msg.sender, msg.value, block.timestamp); 
    } 

    fallback() external payable {
        revert('Fallback not allowed');
    }
}