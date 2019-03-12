pragma solidity >=0.4.22 <0.6.0;

import "./Ownable.sol";

contract States is Ownable {
    
    enum State {Active, Paused, Killed}
    State private state;

    modifier onlyIfActive {
        require(state == State.Active, "Error: contract paused or killed");
        _;
    }

    modifier onlyIfPaused {
        require(state == State.Paused, "Error: contract not paused");
        _;
    }

    constructor() public {
        state = State.Active;
    }

    function pauseContract() public onlyIfActive onlyOwner returns(bool) {
        state = State.Paused;
        return true;
    }

    function resumeContract() public onlyOwner onlyIfPaused returns(bool) {
        state = State.Active;
        return true;
    }

    function killContract() public onlyOwner onlyIfPaused returns (bool) {
        state = State.Killed;
        return true;
    }

}
