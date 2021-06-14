const ChainUtil = require('../chain-util');
const {MINING_REWARD} = require('../config');

class Transaction{
  constructor(){
    this.id = ChainUtil.id();
    this.input = null;
    this.output = [];
  }

  update(senderWallet, recepient, amount){
    const senderOutput = this.output.find(output => output.address === senderWallet.publicKey);

    if (amount > senderOutput.amount){
      console.log(`Amount: ${amount} exceeds balance.`);
      return;
    }

    senderOutput.amount = senderOutput.amount - amount;

    this.output.push({amount, address:recepient});

    Transaction.signTransaction(this, senderWallet);

    return this;
  }

  // helper method to use particular code which can be used for both reward and adding new transaction
  static transactionWithOutputs(senderWallet, outputs){
    const transaction = new this();
    transaction.output.push(...outputs);

    // to sign transaction and add input
    Transaction.signTransaction(transaction, senderWallet);
    return transaction;
  }

  // To give reward to miner
  static rewardTransaction(minerWallet, blockChainWallet){
    // here miner can't sign the trasaction as he is the receiver for reward.
    // So we will create blockchain wallet which will sign transaction.

    return Transaction.transactionWithOutputs(blockChainWallet, [{
      amount: MINING_REWARD, address:minerWallet.publicKey
    }])
  }

  // to return a new instance of the transaction
  static newTransaction(senderWallet, recepient, amount){
    if (amount > senderWallet.balance){
      console.log(`Amount: $${amount} exceeds balance.`);
      return;
    }
    // we want to insert two objects so we can use ES6 spread operator by creating two arry elements,
    //each will be pushed seperately
    // 1 for sender 2 for receiver
    //ES distruction syntax allows us to create a key and value in one at a same time
    //if the actual value name and the key name are the same {amount, address: recepient}
    return Transaction.transactionWithOutputs(senderWallet,[
      {amount: senderWallet.balance - amount, address: senderWallet.publicKey},
      {amount, address: recepient}
    ] );
  }

  // to sign the transaction and push input
  static signTransaction(transaction, senderWallet){
    transaction.input = {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(ChainUtil.hash(transaction.output))
    }
  }

  //to verify verifySignature
  static verifyTransaction (transaction) {
    return ChainUtil.verifySignature(
      transaction.input.address,
      transaction.input.signature,
      ChainUtil.hash(transaction.output));
  }



}

module.exports = Transaction;
