pragma solidity ^0.4.25;

/**
 * The Splitter contract does this and that...
 */
contract Splitter {

	uint public totalBalance;
	address public owner;
    
	struct Person {
		address person;
		string name;
	}

	mapping (address => uint) public personId;
    Person[] public people;


	event EthSent(address recipient, uint amount, bool sent);
	event personAdded(address _address, bool isAdded);

	
	constructor() public payable {
	    owner == msg.sender;
	}

	modifier onlyOwner() { 
		require (msg.sender == owner); 
		_; 
	}
	
	function addPerson(address _personAddr, string memory _personName) public {
        uint id = personId[_personAddr];
        if (id == 0) {
            personId[_personAddr] = people.length;
            id = people.length++;
        }
        people[id] = Person({person: _personAddr, name: _personName});
        emit personAdded(_personAddr, true);
    }

	function sendEth(uint _amount) payable public {
		//require (msg.sender.balance >= msg.value);
		require (msg.sender.balance >= _amount);
		
		//uint amount = msg.value;
        //msg.sender.balance  -= _amount;
		totalBalance += _amount;
       	emit EthSent(msg.sender, _amount, true);  
	}
	
	function totalBalance() public view returns (uint) {
	    return totalBalance;
	}
	
	function balanceOf() public view returns(uint) {
		return msg.sender.balance; 
	}	

	function splitBalance() public onlyOwner {
		require (totalBalance > 0);
	
	    uint valueToSplit = totalBalance/(people.length - 1);
		
		for (uint i = 1; i < people.length - 1; i++) {
	        people[i].person.transfer(valueToSplit);
        }
	}
	
}