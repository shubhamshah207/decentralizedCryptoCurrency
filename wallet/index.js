const {INITIAL_BALANCE} = require('../config');
const ChainUtil = require('../chain-util');
const Transaction = require('./transaction');

class Wallet{
  constructor(){
    this.balance = INITIAL_BALANCE;
    //to generate private public pair
    this.keyPair = ChainUtil.genKeyPair();
    // to get public key and encode to hexadecimal
    this.publicKey = this.keyPair.getPublic().encode('hex');

  }

  toString(){
    return `Wallet-
    publicKey: ${this.publicKey.toString()}
    balance  : ${this.balance}`;
  }


  // to generate signature for sender
  sign(dataHash){
    return this.keyPair.sign(dataHash);
  }

  createTransaction(recepient, amount, blockchain, transactionPool){

    this.balance = this.calculateBalance(blockchain);

    if (amount > this.balance) {
      console.log(`Amount: ${amount} exceeds the current balance: ${this.balance}`);
      return;
    }

    let transaction = transactionPool.existingTransaction(this.publicKey);

    if (transaction){
      transaction.update(this, recepient, amount);
    }
    else{
      transaction = Transaction.newTransaction(this, recepient, amount);
      transactionPool.updateOrAddTransaction(transaction);
    }

    return transaction;
  }

  calculateBalance(blockchain){
    let balance = this.balance;
    let transactions = [];
    blockchain.chain.forEach(block => block.data.forEach(transaction => {
      transactions.push(transaction);
    }));

    const walletInputTs = transactions
      .filter(transaction => transaction.input.address === this.publicKey);

    let startTime = 0;

    // we cant reduce an empty array
    if (walletInputTs.length > 0){
      const recentInputT = walletInputTs.reduce(
        (prev, current) => prev.input.timestamp > current.input.timestamp ? prev : current
      );
      balance = recentInputT.output.find(output => output.address === this.publicKey).amount;
      startTime = recentInputT.input.timestamp;
    }
    transactions.forEach(transaction => {
      if (transaction.input.timestamp > startTime){
        transaction.output.find(output => {
            if(output.address === this.publicKey){
              balance += output.amount;
            }
        });
      }
    });

    return balance;
  }

  // Blockchain's wallet to give miners rewards
  static blockChainWallet(){
    const blockChainWallet = new this();
    blockChainWallet.address = 'blockchain-wallet';
    return blockChainWallet;
  }
}

module.exports = Wallet;
