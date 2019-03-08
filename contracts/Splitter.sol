pragma solidity ^0.4.25;

/**
 * The Splitter contract does this and that...
 */
contract Splitter {

	uint public totalBalance;
	address public owner;
    
// 	struct Person {
// 		address person;
// 		string name;
// 	}

	// mapping (address => uint) public personId;
	// Person[] public people;
	uint peopleCount;
	address[2] public addr;


	event LogEthSent(address recipient, uint amount, bool sent);
	event LogPersonAdded(address _address, bool isAdded);

	
	constructor(address _address1) public {
		owner = msg.sender;
		addr[0] = owner;
		addr[1] = _address1;
	}

	modifier onlyOwner() { 
		require (msg.sender == owner); 
		_; 
	}
	
	// function addPerson(address _personAddr, string memory _personName) public {
	// 	uint id = personId[_personAddr];
	// 	if (id == 0) {
	// 		personId[_personAddr] = people.length;
	// 		id = people.length++;
	// 	}
	// 	people[id] = Person({person: _personAddr, name: _personName});
	// 	emit LogPersonAdded(_personAddr, true);
	// }

	function sendEth() payable public onlyOwner {
		require (msg.sender.balance >= msg.value);

		totalBalance += msg.value;
		emit LogEthSent(msg.sender, msg.value, true);  
	}
	
	function splitBalance() public onlyOwner {
	
		uint valueToSplit = totalBalance/(addr.length - 1);
		
		for (uint i = 1; i < addr.length; i++) {
			addr[i].transfer(valueToSplit);
		}
		totalBalance = 0;
	}
	
    function() {
        revert();
    }
}