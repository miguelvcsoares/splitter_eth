pragma solidity >=0.4.25;

/**
 * The Splitter contract does this and that...
 */
contract Splitter {

	uint public totalBalance;
	address public owner;
    
	address[2] public addr;
	mapping (address => bool) withdraw;


	event LogEthSent(address recipient, uint amount, bool sent);
	event LogPersonAdded(address _address, bool isAdded);
	
	constructor(address[2] memory addrs) public {
	    owner = msg.sender;
	    require (addrs[0] != address(0));
		require(addrs[1] != address(0));
		addr = addrs;
	}

	modifier onlyOwner() { 
		require (msg.sender == owner); 
		_; 
	}

	function sendEth() payable public onlyOwner {
		require (msg.sender.balance >= msg.value);

		totalBalance += msg.value;
		emit LogEthSent(msg.sender, msg.value, true);  
	}
	
	function splitBalance() public {
	    require(msg.sender != owner);
	    require(!withdraw[msg.sender], "Already withdrawn");
		
		uint valueToSplit = totalBalance/addr.length;
		
		if(totalBalance > 0) {
            totalBalance -= valueToSplit;
	        msg.sender.transfer(valueToSplit);
	        withdraw[msg.sender] = true;
		}
	}
}