const Splitter = artifacts.require('./Splitter.sol')

contract('Splitter', (accounts) => {

  beforeEach(async () => {
    this.Splitter = await Splitter.new()
  })

  it('Deploys successfully', async () => {
    const address = await this.Splitter.address;
    assert.notEqual(address, 0x0);
    assert.notEqual(address, '');
    assert.notEqual(address, null);
    assert.notEqual(address, undefined);
  })

  it('Should split ether correctly', async () => {
    const splitterInstance = await Splitter.deployed();
    const accountSender = accounts[0];
    const accountOne = accounts[1];
    const accountTwo = accounts[2];
    const amount = 100;

    await splitterInstance.splitBalance(accountOne, accountTwo, {from: accountSender, value: amount});

    const accountOneFunds = await splitterInstance.owedBalances.call(accountOne);
    const accountTwoFunds = await splitterInstance.owedBalances.call(accountTwo);

    const amountToSend = amount/2;

    assert.equal(accountOneFunds.valueOf(), amountToSend, "Half wasn't in the first account");
    assert.equal(accountTwoFunds.valueOf(), amountToSend, "Half wasn't in the second account");
  })

  it('Should retrieve the owed balances', async () => {
    const splitterInstance = await Splitter.deployed();
    const accountSender = accounts[0];
    const accountOne = accounts[1];
    const accountTwo = accounts[2];
    const amount = 100;

    await splitterInstance.splitBalance(accountOne, accountTwo, {from: accounts[0], value: amount});

    await splitterInstance.retrieve({from: accounts[1]});
    await splitterInstance.retrieve({from: accounts[2]});

    const accountOneFunds = await splitterInstance.owedBalances.call(accountOne);
    const accountTwoFunds = await splitterInstance.owedBalances.call(accountTwo);

    assert.equal(accountOneFunds, 0, 'Account one funds were not correctly retrieved');
    assert.equal(accountTwoFunds, 0, 'Account two funds were not correctly retrieved');
  })
});