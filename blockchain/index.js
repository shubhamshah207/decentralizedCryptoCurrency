const Block = require('./block');

class Blockchain{
  constructor(){
    this.chain = [Block.genesis()];
  }

  addBlock(data){
    const block = Block.mineBlock(this.chain[this.chain.length-1], data);
    this.chain.push(block);

    return block;
  }

//To validate the incoming chain
// In javascript Two different objects that aren't referencing to same original object cannot be equal even if they have same elements.
// so to compare two objects here we will use toString method
  isValidChain(chain){
    //Compare genesis block for both chains(incoming and existing)
    // === operator checks type and value both of the two objects in java script
    if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) return false;


    //Check all the hashvalues to verify the chain
    for(let i=1; i<chain.length; i++){
      const block = chain[i];
      const lastBlock = chain[i-1];
      console.log('inside for loop');
      if(block.lastHash !== lastBlock.hash ||
        block.hash !== Block.blockHash(block)) return false;
    }
    return true;
  }

  //if incoming chain is valid it will replace chain with the incoming one
  replaceChain(newChain){
    // received chain must be longer than the current chain (To resolve fork problem)
    // Fork problem is the one which occurs because at same time two different nodes add a block to their chain
    if (newChain.length <= this.chain.lengh){
      console.log('Received chain is not longer than the current chain.');
      return;
    }

    else if (! this.isValidChain(newChain)) {
      console.log('The received chain is not valid.');
      return;
    }

    console.log('Replacing blockchain with new chain.')
    this.chain = newChain

  }
}

module.exports = Blockchain
