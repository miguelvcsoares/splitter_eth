pragma solidity >=0.4.25;

/**
 * The Splitter contract does this and that...
 */
contract Splitter {

	address public owner;
    
	mapping (address => uint) splitAmount;
	mapping (address => bool) retrieveDone;

	event LogSplit(address _address1, address _address2, uint amount);
	
	constructor() public {
	    owner = msg.sender;
	}

	modifier onlyOwner() { 
		require(msg.sender == owner); 
		_; 
	}
	
	function splitBalance(address addr1, address addr2) onlyOwner public payable {
	    require(msg.value > 0);
		require(addr1 != address(0));
		require(addr2 != address(0));

        uint amountToSend1 = msg.value/2;
        uint amountToSend2 = msg.value/2;
        splitAmount[addr1] = amountToSend1;
        splitAmount[addr2] = amountToSend2;
        
        emit LogSplit(addr1, addr2, msg.value);
	}
	
	function retrieve() public payable returns (bool) {
	    require(msg.sender != owner);
	    require(!retrieveDone[msg.sender], "Already withdrawn");

    	uint amount = splitAmount[msg.sender];
        splitAmount[msg.sender] = 0; 
        msg.sender.transfer(amount);
        retrieveDone[msg.sender] = true;
        
        return true;
	}

	function kill() onlyOwner public returns (bool) {
    	selfdestruct(msg.sender);
    	return true;
    }
}