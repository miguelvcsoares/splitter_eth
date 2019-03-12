const Splitter = artifacts.require('./Splitter.sol');


contract('Splitter', accounts => {
  var accountSender = accounts[0];
  var accountOne = accounts[1];
  var accountTwo = accounts[2];
  var amount = 100;

  beforeEach(async () => {
    this.Splitter = await Splitter.new()
  })

  it('Deploys successfully', async () => {
    let address = await this.Splitter.address;
    assert.notEqual(address, 0x0);
    assert.notEqual(address, '');
    assert.notEqual(address, null);
    assert.notEqual(address, undefined);
  })

  it('Should set an owner', async () => {
    let splitterInstance = await Splitter.new();
    assert.strictEqual(await splitterInstance.owner.call(), accountSender);
  }) 

  it('Should split ether correctly', async () => {
    let splitterInstance = await Splitter.new();
    let amountToSend = amount/2;

    await splitterInstance.splitBalance(accountOne, accountTwo, {from: accountSender, value: amount});

    let accountOneFunds = await splitterInstance.owedBalances.call(accountOne);

    let accountTwoFunds = await splitterInstance.owedBalances.call(accountTwo);

    assert.strictEqual(accountOneFunds.toString(10), amountToSend.toString(10), "Half wasn't in the first account");
    assert.strictEqual(accountTwoFunds.toString(10), amountToSend.toString(10), "Half wasn't in the second account");
  })


  it('Should emit event LogSplit correctly', async() => {
    let splitterInstance = await Splitter.new();

    let split = await splitterInstance.splitBalance(accountOne, accountTwo, {from: accountSender, value: amount});

    assert.strictEqual(split.logs.length, 1);
    assert.strictEqual(split.receipt.logs.length, 1);

    let logSplitEvent = split.receipt.logs[0];

    assert.strictEqual(logSplitEvent.event, 'LogSplit');
    assert.strictEqual(logSplitEvent.args.caller, accountSender);
    assert.strictEqual(logSplitEvent.args.address1, accountOne);
    assert.strictEqual(logSplitEvent.args.address2, accountTwo);
    assert.strictEqual(logSplitEvent.args.amount.toString(), amount.toString());
  })

  it('Value sent was 0', async () => {
    let splitterInstance = await Splitter.new();

    await splitterInstance.splitBalance(accountOne, accountTwo, {from: accountSender, value: 0});

    let accountOneFunds = await splitterInstance.owedBalances.call(accountOne);

    let accountTwoFunds = await splitterInstance.owedBalances.call(accountTwo);

    let amountToSend = amount/2;

    assert.strictEqual(accountOneFunds.toString(10),'0');
    assert.strictEqual(accountTwoFunds.toString(10),'0');
  })


  it('Should retrieve the owed balances', async () => {
    let splitterInstance = await Splitter.new();

    let accountOneFunds = await splitterInstance.owedBalances.call(accountOne);
    let accountTwoFunds = await splitterInstance.owedBalances.call(accountTwo);

    assert.strictEqual(accountOneFunds.toString(10),'0', 'Account one funds were not correctly retrieved');
    assert.strictEqual(accountTwoFunds.toString(10),'0', 'Account two funds were not correctly retrieved');
  })


  it('Should emit event LogEtherRetrieved correctly', async() => {
    let splitterInstance = await Splitter.new();

    let retrieved = await splitterInstance.retrieve({from: accountOne});

    assert.strictEqual(retrieved.logs.length, 1);
    assert.strictEqual(retrieved.receipt.logs.length, 1);

    let logEtherRetrievedEvent = retrieved.receipt.logs[0];

    assert.strictEqual(logEtherRetrievedEvent.event, 'LogEtherRetrieved');
    assert.strictEqual(logEtherRetrievedEvent.args.caller, accountOne);
    assert.strictEqual(logEtherRetrievedEvent.args.amount.toString(10), '0');
  })
});