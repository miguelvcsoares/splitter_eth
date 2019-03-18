const Splitter = artifacts.require('./Splitter.sol');
const expectedException = require("../utils/expected_exception_testRPC_and_geth.js");

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

  describe("Testing active contract", function() {
    beforeEach('deploy new', async () => {
      splitterInstance = await Splitter.new(InitStates.Active, {from: accountSender});
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


    it('Should split an even number of ether correctly', async () => {
      await splitterInstance.splitBalance(accountOne, accountTwo, {from: accountSender, value: amount});
      const amountToSend = amount/2;

      let accountOneFunds = await splitterInstance.owedBalances.call(accountOne);

      let accountTwoFunds = await splitterInstance.owedBalances.call(accountTwo);

      assert.strictEqual(accountOneFunds.toString(10), amountToSend.toString(10), "Half wasn't in the first account");
      assert.strictEqual(accountTwoFunds.toString(10), amountToSend.toString(10), "Half wasn't in the second account");
    })

    it('Should split an uneven number of ether correctly', async () => {
      await splitterInstance.splitBalance(accountOne, accountTwo, {from: accountSender, value: 5});

      let accountOneFunds = await splitterInstance.owedBalances.call(accountOne);

      let accountTwoFunds = await splitterInstance.owedBalances.call(accountTwo);

      assert.strictEqual(accountOneFunds.toString(10), '3', "Half wasn't in the first account");
      assert.strictEqual(accountTwoFunds.toString(10), '2', "Half wasn't in the second account");
    })

    it('Should reject split to the accountSender', async() => {
      await expectedException(async() => {
        await splitterInstance.splitBalance(accountSender, accountTwo, {from: accountSender, value: 5});
      })
    })

    it('Should reject a split without value', async () => {
      await expectedException(async() => {
        await splitterInstance.splitBalance(accountOne, accountTwo, {from: accountSender, value: 0});
      })
    })

    it('Should emit event LogSplit correctly', async() => {
      let split = await splitterInstance.splitBalance(accountOne, accountTwo, {from: accountSender, value: amount});

      assert.strictEqual(split.logs.length, 1);
      assert.strictEqual(split.logs.length, 1);

      let logSplitEvent = split.logs[0];

      assert.strictEqual(logSplitEvent.event, 'LogSplit');
      assert.strictEqual(logSplitEvent.args.caller, accountSender);
      assert.strictEqual(logSplitEvent.args.address1, accountOne);
      assert.strictEqual(logSplitEvent.args.address2, accountTwo);
      assert.strictEqual(logSplitEvent.args.amount.toString(), amount.toString());
    })

    it('Should check the owed balances', async() => {
      await splitterInstance.splitBalance(accountOne, accountTwo, {from: accountSender, value: amount});
      const amountToSend = amount/2;

      assert.equal(await splitterInstance.owedBalances.call(accountOne), amountToSend);
      assert.equal(await splitterInstance.owedBalances.call(accountTwo), amountToSend);   
    })

    it('Should retrieve the owed balances', async () => {
      await splitterInstance.splitBalance(accountOne, accountTwo, {from: accountSender, value: 500});

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

      const initialBalanceOne = await web3.eth.getBalance(accountOne);
      const initialBalanceTwo = await web3.eth.getBalance(accountTwo);

      const tx1 = await splitterInstance.retrieve({from: accountOne});
      const tx2 = await splitterInstance.retrieve({from: accountTwo});

      let amountRetrievedOne = await tx1.logs[0].args.amount;
      let amountRetrievedTwo = await tx2.logs[0].args.amount;

      let amountGasUsedOne = await tx1.receipt.gasUsed;
      let amountGasUsedTwo = await tx2.receipt.gasUsed;

      let txOne = await web3.eth.getTransaction(tx1.logs[0].transactionHash);
      let txTwo = await web3.eth.getTransaction(tx2.logs[0].transactionHash);

      let gasCostOne = amountGasUsedOne * txOne.gasPrice;
      let gasCostTwo = amountGasUsedTwo * txTwo.gasPrice;

      let finalBalanceOne = await web3.eth.getBalance(accountOne);
      let finalBalanceTwo = await web3.eth.getBalance(accountTwo);

      let expectedFinalBalanceOne = web3.utils.toBN(initialBalanceOne).sub(web3.utils.toBN(gasCostOne)).add(web3.utils.toBN(amountToSend));
      let expectedFinalBalanceTwo = web3.utils.toBN(initialBalanceTwo).sub(web3.utils.toBN(gasCostTwo)).add(web3.utils.toBN(amountToSend));

      assert.strictEqual(expectedFinalBalanceOne.toString(10), finalBalanceOne.toString(10));
      assert.strictEqual(expectedFinalBalanceTwo.toString(10), finalBalanceTwo.toString(10));
    })

    it('Should reject retrieve without amount', async() => {
      await expectedException(async() => {
        await splitterInstance.retrieve({from: accountOne});
      })
    })


    it('Should emit event LogEtherRetrieved correctly', async() => {
      await splitterInstance.splitBalance(accountOne, accountTwo, {from: accountSender, value: 500});

      let retrieved = await splitterInstance.retrieve({from: accountOne});

      assert.strictEqual(retrieved.logs.length, 1);
      assert.strictEqual(retrieved.logs.length, 1);

      let logEtherRetrievedEvent = retrieved.logs[0];

      assert.strictEqual(logEtherRetrievedEvent.event, 'LogEtherRetrieved');
      assert.strictEqual(logEtherRetrievedEvent.args.caller, accountOne);
      assert.strictEqual(logEtherRetrievedEvent.args.amount.toString(10), '250');
    })
  });

  describe('Testing paused contract', function() {
    beforeEach('deploy new', async () => {
      splitterPausedInstance = await Splitter.new(InitStates.Paused, {from: accountSender});      
    })

    it('Should not allow to split in a paused state', async () => {
      await expectedException(async() => {
        await splitterPausedInstance.splitBalance(accountOne, accountTwo, {from: accountSender, value: 500});
      })
    })

    it('Should not allow to retrieve in a paused state', async () => {
        let tx1 = await splitterInstance.splitBalance(accountOne, accountTwo, {from: accountSender, value: 500});

        await splitterInstance.pauseContract({from: accountSender});

        await expectedException(async() => {
          await splitterPausedInstance.retrieve({from: accountOne});
        })
    })
  });

  describe('Testing killed contract', function(){
    beforeEach('deploy new', async () => {
      splitterPausedInstance = await Splitter.new(InitStates.Paused, {from: accountSender});
      await splitterPausedInstance.killContract({from: accountSender});
    })

    it('Should not allow to split in a killed state', async () => {
      await expectedException(async() => {
        await splitterPausedInstance.splitBalance(accountOne, accountTwo, {from: accountSender, value: 500});
      })
    })

    it('Should not allow to retrieve in a killed state', async () => {
      await expectedException(async() => {
        await splitterPausedInstance.retrieve({from: accountOne});
      })
    })
  });
});