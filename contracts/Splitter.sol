pragma solidity >=0.4.22 <0.6.0;

import "./SafeMath.sol";

contract Splitter {

	using SafeMath for uint;
	address public owner;

	mapping (address => uint) owedBalances;

	event LogSplit(address indexed caller, address indexed _address1, address indexed _address2, uint amount);
	event LogEtherRetrieved(address caller, uint amount);
	
	
	constructor() public {
		owner = msg.sender;
	}

	modifier onlyOwner() { 
		require(msg.sender == owner); 
		_; 
	}
	
	function splitBalance(address addr1, address addr2) public payable {
		require(addr1 != address(0));
		require(addr2 != address(0));

		uint amountToSend = msg.value/2;

		if(msg.value % 2 == 1) owedBalances[msg.sender] = owedBalances[msg.sender].add(1);
		owedBalances[addr1] = owedBalances[addr1].add(amountToSend);
		owedBalances[addr2] = owedBalances[addr2].add(amountToSend);

		emit LogSplit(msg.sender, addr1, addr2, msg.value);
	}
	
	function retrieve() public payable {

		uint amount = owedBalances[msg.sender];
		owedBalances[msg.sender] = owedBalances[msg.sender].sub(amount); 
		msg.sender.transfer(amount);

		emit LogEtherRetrieved(msg.sender, amount);
	}

	function kill() onlyOwner public returns (bool) {
		selfdestruct(msg.sender);
		return true;
	}
}