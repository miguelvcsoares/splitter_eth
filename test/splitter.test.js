const Splitter = artifacts.require('./Splitter.sol')

contract('Splitter', (accounts) => {
  beforeEach(async () => {
    this.Splitter = await Splitter.new()
  })

  it('deploys successfully', async () => {
    const address = await this.Splitter.address
    assert.notEqual(address, 0x0)
    assert.notEqual(address, '')
    assert.notEqual(address, null)
    assert.notEqual(address, undefined)
  })
});