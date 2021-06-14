const Block = require('./block')
const {DIFFICULTY} = require('../config');
// second parameter is callback arrow function, which contains a series of test. The jest will execute once it finds the overall describe function
//it is a function like describe for unit testing
describe("Block", () => {
  let data, lastBlock, block;
  beforeEach(()=>{
    data = 'bar';
    lastBlock = Block.genesis();
    block = Block.mineBlock(lastBlock, data);
  });
  it('Sets the `data` to match the given input', () => {
      //expect takes an object or any piece of data and check with other
      expect(block.data).toEqual(data);
  });

  it('sets the `lastHash` to match the hash of the last block', () => {
    expect(block.lastHash).toEqual(lastBlock.hash);
  });

  // it('generates a hash that matches the difficulty before', () => {
  //   expect(block.hash.substring(0, DIFFICULTY)).not.toEqual('0'.repeat(DIFFICULTY));
  //   console.log(block.toString());
  // });

  it('generates a hash that matches the difficulty after', () => {
    expect(block.hash.substring(0, block.difficulty)).toEqual('0'.repeat(block.difficulty));
    console.log(block.toString());
  });

  it('slowers the difficulty for slowly mined blocks', () => {
    expect(Block.adjustDifficulty(block, block.timestamp + 360000)).toEqual(block.difficulty - 1);
  });

  it('raises the difficulty for quickly mined blocks', () => {
    expect(Block.adjustDifficulty(block, block.timestamp + 36)).toEqual(block.difficulty + 1);
  });
});
