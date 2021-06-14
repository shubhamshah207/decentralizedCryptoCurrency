const ChainUtil = require('../chain-util');
const {DIFFICULTY, MINE_RATE} = require('../config');

class Block{
  constructor(timestamp, lastHash, hash, data, nonce, difficulty){
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    // to implement proof of work
    this.nonce = nonce;

    // for dynamic difficulty change
    this.difficulty = difficulty || DIFFICULTY;
  }

  toString(){
    return `Block-
        TimeStamp : ${this.timestamp}
        Last Hash : ${this.lastHash.substring(0,10)}
        Hash      : ${this.hash.substring(0,10)}
        Nonce     : ${this.nonce}
        Difficulty: ${this.difficulty}
        data      : ${this.data} `;
  }

  static genesis(){
    return new this('Genesis Timestamp', '------', 'f1r57-h45h', [], DIFFICULTY);
  }

  static mineBlock(lastBlock, data){

    let hash, timestamp;
    const lastHash = lastBlock.hash;

    let {difficulty} = lastBlock; //ES6 distruction syntax
    console.log("difficulty of last block", difficulty, lastBlock.timestamp);
    // can be updated but no need to re declare
    // to implement proof of work
    let nonce = 0;
    do {
      nonce++;
      timestamp = Date.now();

      // dynamic difficulty implementation
      difficulty = Block.adjustDifficulty(lastBlock, timestamp);

      hash = Block.hash(timestamp, lastHash, data, nonce, difficulty);
    } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));

    return new this(timestamp, lastHash, hash, data, nonce, difficulty);
  }

  static hash(timestamp, lastHash, data, nonce, difficulty){
    return ChainUtil.hash(`${timestamp}${lastHash}${data}${nonce}${difficulty}`).toString();
  }

  static blockHash(block){
    // ES6 distructing syntax to declare all variables available in block object
    const{timestamp, lastHash, data, nonce, difficulty} = block;
    return Block.hash(timestamp, lastHash, data, nonce, difficulty);
  }

  //dynamic difficulty change implementation
  static adjustDifficulty(lastBlock, currentTime){
    let {difficulty} = lastBlock;
    difficulty = lastBlock.timestamp + MINE_RATE > currentTime ? difficulty + 1 : difficulty - 1;
    return difficulty
  }


}



  /*For the last step let's make sure that this block class is shared from our file by exporting it as a module that can be included with other files. So the syntax for that in node is module,.exports and then we set it equal to the object that we want to share, which in this case is our Block class.*/
  module.exports = Block;
