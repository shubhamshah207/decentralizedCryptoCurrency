const Transaction = require('./transaction');

class TransactionPool{

  constructor(){
    // list of transactions
    this.transactions = [];
  }

  updateOrAddTransaction(transaction){
    // if sender is present then we just need to add outputs so we need to update.
    let transactionWithId = this.transactions.find(t => t.id === transaction.id);

    if(transactionWithId) {
      this.transactions[this.transactions.indexOf(transactionWithId)] = transaction;
    }
    else{
      this.transactions.push(transaction);
    }
  }

  existingTransaction(address){
    return this.transactions.find(t => t.input.address === address);
  }

  validTransactions(){
    return this.transactions.filter(transaction => {
      // sum of all mounts in output which should be equal to initial value of wallet
      const outputTotal = transaction.output.reduce((total, op) =>{
        return total + op.amount;
      }, 0); // to start total initially as zero

      if (transaction.input.amount != outputTotal){
        console.log(`invalid transaction from ${transaction.input.address}.`);
        return;
      }

      // if the sign is not valid ignore
      if (!Transaction.verifyTransaction(transaction)){
        console.log(`invalid signature from ${transaction.input.address}.`);
        return;
      }

      return transaction;
    });
  }


  // to clear transaction from pool as its already added to blockchain
  clear(){
    this.transactions = [];
  }
}

module.exports = TransactionPool;
