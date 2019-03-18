pragma solidity >=0.4.22 <0.6.0;

import "./Ownable.sol";

contract States is Ownable {
    
    enum State {Active, Paused, Killed}
    State private state;

    event LogPausedContract(address indexed caller);
    event LogResumeContract(address indexed caller);
    event LogKilledContract(address indexed caller);
    

    modifier onlyIfActive {
        require(state == State.Active, "Error: contract paused or killed");
        _;
    }

    modifier onlyIfPaused {
        require(state == State.Paused, "Error: contract not paused");
        _;
    }

    constructor(State initState) public {
        require (State(initState) != State.Killed);
        state = State(initState);
    }

    function getState() public view returns (State) {
        return State(state);
    }
    

    function pauseContract() public onlyIfActive onlyOwner returns(bool) {
        state = State.Paused;

        emit LogPausedContract(msg.sender);
        return true;
    }

    function resumeContract() public onlyOwner onlyIfPaused returns(bool) {
        state = State.Active;

        emit LogResumeContract(msg.sender);
        return true;
    }

    function killContract() public onlyOwner onlyIfPaused returns (bool) {
        state = State.Killed;

        emit LogKilledContract(msg.sender);
        return true;
    }

}
