const Splitter = artifacts.require('./Splitter.sol');

contract('Splitter', accounts => {
  const accountSender = accounts[0];
  const accountOne = accounts[1];
  const accountTwo = accounts[2];
  let amount = 10000000000000000000;
  const InitStates = {
    Active: 0,
    Paused: 1,
    Killed: 2
  };

  beforeEach(async () => {
    splitterInstance = await Splitter.new(InitStates["Active"], {from: accountSender});
  })


  it('Deploys successfully', async () => {
    const address = await splitterInstance.address;
    assert.notEqual(address, 0x0);
    assert.notEqual(address, '');
    assert.notEqual(address, null);
    assert.notEqual(address, undefined);
  })


  it('Should set an owner', async () => {
    assert.strictEqual(await splitterInstance.getOwner.call(), accountSender);
  })


  it('Should split ether correctly', async () => {
    await splitterInstance.splitBalance(accountOne, accountTwo, {from: accountSender, value: amount});
    const amountToSend = amount/2;

    let accountOneFunds = await splitterInstance.owedBalances.call(accountOne);

    let accountTwoFunds = await splitterInstance.owedBalances.call(accountTwo);

    assert.strictEqual(accountOneFunds.toString(10), amountToSend.toString(10), "Half wasn't in the first account");
    assert.strictEqual(accountTwoFunds.toString(10), amountToSend.toString(10), "Half wasn't in the second account");
  })


  it('Should emit event LogSplit correctly', async() => {
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


  it('Does not allow to send 0 ether', async () => {
    try {
      await splitterInstance.splitBalance(accountOne, accountTwo, {from: accountSender, value: 0});
      assert.fail();
    } 
    catch(err) {
      assert.ok(/revert/.test(err.message));
    }
  })


  it('Should check the owed balances', async() => {
    await splitterInstance.splitBalance(accountOne, accountTwo, {from: accountSender, value: amount});
    const amountToSend = amount/2;

    assert.equal(await splitterInstance.owedBalances.call(accountOne), amountToSend);
    assert.equal(await splitterInstance.owedBalances.call(accountTwo), amountToSend);   
  })


  it('Should retrieve the owed balances', async () => {
    await splitterInstance.splitBalance(accountOne, accountTwo, {from: accountSender, value: 500});

    let accountOneFunds = await splitterInstance.owedBalances.call(accountOne);
    let accountTwoFunds = await splitterInstance.owedBalances.call(accountTwo);
    
    assert.strictEqual(accountOneFunds.toString(10), '250');
    assert.strictEqual(accountTwoFunds.toString(10), '250');

    await splitterInstance.retrieve({from: accountOne});
    await splitterInstance.retrieve({from: accountTwo});

    let accountOneFundsReset = await splitterInstance.owedBalances.call(accountOne);
    let accountTwoFundsReset = await splitterInstance.owedBalances.call(accountTwo);

    assert.strictEqual(accountOneFundsReset.toString(10), '0');
    assert.strictEqual(accountTwoFundsReset.toString(10), '0');
  })


  it('Should confirm that the msg.sender got the money', async() => {
    await splitterInstance.splitBalance(accountOne, accountTwo, {from: accountSender, value: amount});
    const amountToSend = amount/2;

    const initialBalance = await web3.eth.getBalance(accountOne);

    assert.equal(await splitterInstance.owedBalances(accountOne), amountToSend);

    let tx = await splitterInstance.retrieve({from: accountOne});

    let amountRetrieved = await tx.receipt.logs[0].args.amount;

    let amountGasUsed = await tx.receipt.gasUsed;

    let price = await web3.eth.getTransaction(tx.receipt.logs[0].transactionHash);

    let gasCost = -1 * amountGasUsed * price.gasPrice;

    let finalBalance = await web3.eth.getBalance(accountOne);

    let expectedFinalBalance = web3.utils.toBN(initialBalance).add(web3.utils.toBN(gasCost)).add(web3.utils.toBN(amountToSend));

    assert.strictEqual(expectedFinalBalance.toString(10), finalBalance.toString(10));
  })


  it('Should emit event LogEtherRetrieved correctly', async() => {
    await splitterInstance.splitBalance(accountOne, accountTwo, {from: accountSender, value: 500});

    let retrieved = await splitterInstance.retrieve({from: accountOne});

    assert.strictEqual(retrieved.logs.length, 1);
    assert.strictEqual(retrieved.receipt.logs.length, 1);

    let logEtherRetrievedEvent = retrieved.receipt.logs[0];

    assert.strictEqual(logEtherRetrievedEvent.event, 'LogEtherRetrieved');
    assert.strictEqual(logEtherRetrievedEvent.args.caller, accountOne);
    assert.strictEqual(logEtherRetrievedEvent.args.amount.toString(10), '250');
  })
});