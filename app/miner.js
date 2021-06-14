const Wallet = require('../wallet');
const Transaction = require('../wallet/transaction');


class Miner{
  constructor(blockchain, transactionPool, wallet, p2pServer){
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    //Every Miner will have thier own wallet
    this.wallet = wallet;
    // to interact with others in network
    this.p2pServer = p2pServer;
  }

  mine(){

    // get valid
    const validTransactions = this.transactionPool.validTransactions();
    // include a reward for the user
    validTransactions.push(
      Transaction.rewardTransaction(this.wallet, Wallet.blockChainWallet())
    );
    // create a block consisting of the valid transactions
    const block = this.blockchain.addBlock(validTransactions);
    // synchronize chains in the peer to peer Server
    this.p2pServer.syncChains();
    //clear the transaction pool
    this.transactionPool.clear();
    // broadcast to every miner to clear their transaction pools
    this.p2pServer.broadcastClearTransactions();

    return block;
  }
}

module.exports = Miner;
