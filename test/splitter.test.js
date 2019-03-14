const Splitter = artifacts.require('./Splitter.sol');

contract('Splitter', accounts => {
  const accountSender = accounts[0];
  const accountOne = accounts[1];
  const accountTwo = accounts[2];
  let amount = 10000000000000000000;
  let initState = 0;

  beforeEach(async () => {
    splitterInstance = await Splitter.new(initState, {from: accountSender});
  })


  it('Deploys successfully', async () => {
    let address = await splitterInstance.address;
    assert.notEqual(address, 0x0);
    assert.notEqual(address, '');
    assert.notEqual(address, null);
    assert.notEqual(address, undefined);
  })


  it('Should set an owner', async () => {
    assert.strictEqual(await splitterInstance._owner.call(), accountSender);
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


  it('Should check the account balance', async() => {
    await splitterInstance.splitBalance(accountOne, accountTwo, {from: accountSender, value: amount});
    const amountToSend = amount/2;

    assert.equal(await splitterInstance.owedBalances.call(accountOne), amountToSend);
    assert.equal(await splitterInstance.owedBalances.call(accountTwo), amountToSend);   
  })


  it('Should retrieve the owed balances', async () => {
    await splitterInstance.splitBalance(accountOne, accountTwo, {from: accountSender, value: amount});
    const amountToSend = amount/2;
    
    assert.equal(await splitterInstance.owedBalances(accountOne), amountToSend);
    assert.equal(await splitterInstance.owedBalances(accountTwo), amountToSend);

    await splitterInstance.retrieve({from: accountOne});
    await splitterInstance.retrieve({from: accountTwo});

    assert.equal(await splitterInstance.owedBalances(accountOne), 0);
    assert.equal(await splitterInstance.owedBalances(accountTwo), 0);
  })


  it('Should confirm that the withdrawn was successful', async() => {
    await splitterInstance.splitBalance(accountOne, accountTwo, {from: accountSender, value: amount});
    const amountToSend = amount/2;

    let initialBalance = await web3.eth.getBalance(accountOne);
    console.log("initialBalance " + initialBalance);

    assert.equal(await splitterInstance.owedBalances(accountOne), amountToSend);

    let retrieved = await splitterInstance.retrieve({from: accountOne});
    console.log("retrieved " + retrieved.receipt);

    let amountRetrieved = await retrieved.receipt.logs[0].args.amount;
    console.log("amountRetrieved " + amountRetrieved.toString(10));

    let amountGasUsed = await retrieved.receipt.gasUsed;

    let price = await web3.eth.getTransaction(retrieved.receipt.logs[0].transactionHash);
    console.log(price.gasPrice.toString(10));

    let gasCost = amountGasUsed * price.gasPrice;
    console.log("gasCost " + gasCost);

    let finalBalance = await web3.eth.getBalance(accountOne);
    console.log("finalBalance " + finalBalance);

    let expected = finalBalance - initialBalance + gasCost;
    console.log(expected);

    assert.strictEqual(expected.toString(10), amountToSend.toString(10));

  })

  it('Should emit event LogEtherRetrieved correctly', async() => {
    let retrieved = await splitterInstance.retrieve({from: accountOne});

    assert.strictEqual(retrieved.logs.length, 1);
    assert.strictEqual(retrieved.receipt.logs.length, 1);

    let logEtherRetrievedEvent = retrieved.receipt.logs[0];

    assert.strictEqual(logEtherRetrievedEvent.event, 'LogEtherRetrieved');
    assert.strictEqual(logEtherRetrievedEvent.args.caller, accountOne);
    assert.strictEqual(logEtherRetrievedEvent.args.amount.toString(10), '0');
  })
});