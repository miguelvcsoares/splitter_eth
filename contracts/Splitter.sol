pragma solidity >=0.4.22 <0.6.0;

import "./SafeMath.sol";
import "./Ownable.sol";
import "./States.sol";


contract Splitter is Ownable, States {

	using SafeMath for uint;

	mapping (address => uint) public owedBalances;

	event LogSplit(address indexed caller, address indexed address1, address indexed address2, uint amount);
	event LogEtherRetrieved(address indexed caller, uint amount);
	
	function splitBalance(address addr1, address addr2) onlyIfActive public payable {
		require(addr1 != address(0));
		require(addr2 != address(0));

		uint amountToSend = msg.value/2;

		owedBalances[addr1] = owedBalances[addr1].add(msg.value - amountToSend);
		owedBalances[addr2] = owedBalances[addr2].add(amountToSend);

		emit LogSplit(msg.sender, addr1, addr2, msg.value);
	}
	
	function retrieve() onlyIfActive public {
		uint amount = owedBalances[msg.sender];

		owedBalances[msg.sender] = 0;
		emit LogEtherRetrieved(msg.sender, amount);
 
		msg.sender.transfer(amount);
	}
}