const Splitter = artifacts.require('./Splitter.sol')

contract('Splitter', (accounts) => {
  before(async () => {
    this.todoList = await Splitter.deployed()
  })

  it('deploys successfully', async () => {
    const address = await this.todoList.address
    assert.notEqual(address, 0x0)
    assert.notEqual(address, '')
    assert.notEqual(address, null)
    assert.notEqual(address, undefined)
  })
});