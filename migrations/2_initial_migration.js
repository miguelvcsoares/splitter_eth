const Splitter = artifacts.require("Splitter");
const initState = 0;

module.exports = function(deployer, network, accounts) {
  deployer.deploy(Splitter, initState, { from: accounts[0]});
};
