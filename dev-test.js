// const Block = require('./blockchain/block');
// const Blockchain = require('./blockchain');
// const block = new Block("foo", "bar", "zoo", "baz");
// console.log(block.toString());
// console.log(Block.genesis().toString())
// const fooBlock = Block.mineBlock(Block.genesis(), 'foo');
// console.log(fooBlock.toString())

// const bc = new Blockchain();
// for (let i =0; i<10; i++){
//   const start = Date.now();
//   console.log(bc.addBlock(`foo ${i}`).toString());
//   console.log(Date.now() - start);
// }

const Wallet = require('./wallet');
const wallet = new Wallet();
console.log(wallet.toString());
