const States = artifacts.require('./States.sol');
const expectedException = require("../utils/expected_exception_testRPC_and_geth.js");


contract('States', accounts => {
	const accountSender = accounts[0];
	const accountOne = accounts[1];
	const InitStates = {
		Active: 0,
		Paused: 1,
		Killed: 2
	};

	describe('Testing active contract', function() {
		beforeEach("deploy new", async () => {
			statesActiveInstance = await States.new(InitStates.Active, {from: accountSender});
		})

		it('Should check the active contract state', async() => {
			let currentState = await statesActiveInstance.getState();
			assert.strictEqual(currentState.toString(10), '0');
		})

		it('Should pause a contract from an owner', async () => {
			await statesActiveInstance.pauseContract({from: accountSender});

			let currentState = await statesActiveInstance.getState();
			assert.strictEqual(currentState.toString(10), '1');
		})

		it('Should emit event LogPausedContract correctly', async() => {
			let paused = await statesActiveInstance.pauseContract({from: accountSender});

			assert.strictEqual(paused.logs.length, 1);
			assert.strictEqual(paused.receipt.logs.length, 1);
			
			let logPausedContractEvent = paused.logs[0];

			assert.strictEqual(logPausedContractEvent.event, 'LogPausedContract');
			assert.strictEqual(logPausedContractEvent.args.caller, accountSender);
		})

		it("Should reject pause from a non-owner", async () => {
			await expectedException(async() => {
				await statesActiveInstance.pauseContract({from: accountOne});
			})
		})

		it('Should reject kill from an active contract', async() => {
			await expectedException(async() => {
				await statesActiveInstance.killContract({from: accountSender});
			})
		})
	});

	describe('Testing paused contract', function() {
		beforeEach(async () => {
			statesPausedInstance = await States.new(InitStates["Paused"], {from: accountSender});
		})

		it('Should reject a non-owner to unpause the contract', async () => {
			await expectedException(async() => {
				await statesPausedInstance.resumeContract({from: accountOne});
			})
		})

		it('Should unpause the contract', async () => {
			await statesPausedInstance.resumeContract({from: accountSender});

			let currentState = await statesPausedInstance.getState();
			assert.strictEqual(currentState.toString(10), '0');
		})

		it('Should emit event LogResumeContract correctly', async() => {
			let resumed = await statesPausedInstance.resumeContract({from: accountSender});

			assert.strictEqual(resumed.logs.length, 1);
			assert.strictEqual(resumed.receipt.logs.length, 1);
			
			let logResumeContractEvent = resumed.receipt.logs[0];

			assert.strictEqual(logResumeContractEvent.event, 'LogResumeContract');
			assert.strictEqual(logResumeContractEvent.args.caller, accountSender);
		})

		it('Should reject a non-owner to kill the contract', async () => {
			await expectedException(async() => {
				await statesPausedInstance.killContract({from: accountOne});
			})
		})

		it('Should kill the contract', async () => {
			await statesPausedInstance.killContract({from: accountSender});

			let currentState = await statesPausedInstance.getState();
			assert.strictEqual(currentState.toString(10), '2');
		})

		it('Should emit event LogKilledContract correctly', async() => {
			let killed = await statesPausedInstance.killContract({from: accountSender});

			assert.strictEqual(killed.logs.length, 1);
			assert.strictEqual(killed.receipt.logs.length, 1);
			
			let logKilledContractEvent = killed.receipt.logs[0];

			assert.strictEqual(logKilledContractEvent.event, 'LogKilledContract');
			assert.strictEqual(logKilledContractEvent.args.caller, accountSender);
		})
	});

	describe('Testing killed contract', function() {
		it('Should not be able to deploy a killed contract', async() => {
		await expectedException(async() => {
				await States.new(InitStates.Killed, {from: accountSender});
			})
		})
	});
});