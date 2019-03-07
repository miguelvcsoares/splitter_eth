pragma solidity ^0.4.19;

/**
 * The Splitter contract does this and that...
 */
contract Splitter {

	uint public totalBalance;
	address public owner;
    
	struct Person {
		address person;
		string name;
		uint balance;
	}

	mapping (address => uint) public personId;
    	Person[] public people;


	event EthSent(address recipient, uint amount, bool sent);
	
	constructor() public {
		addPerson(owner,"Alice");
		addPerson(address(0),"Bob");
		addPerson(address(1),"Carol");
	}

// 	modifier onlyOwner() { 
// 		require(owner = msg.sender); 
// 		_; 
// 	}
	
	function addPerson(address _personAddr, string memory _personName) public {
        uint id = personId[_personAddr];
        if (id == 0) {
            personId[_personAddr] = people.length;
            id = people.length++;
        }
        people[id] = Person({person: _personAddr, name: _personName, balance: 0});
    }

	function sendEth(uint _value) payable public {
		require (msg.sender.balance >= msg.value);
		
		uint amount = msg.value;
        msg.sender.balance  -= amount;
		totalBalance += amount;
       	emit EthSent(msg.sender, amount, true);  
	}
	
	
	function balanceOf() public returns(uint) {
		return msg.sender.balance; 
	}	

	function splitBalance() public {
		totalBalance = address(this).balance;
		uint valueToSplit = totalBalance/(people.length);
	}	
}
