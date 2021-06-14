const Transaction = require('./transaction');
const Wallet = require('./index');
const {MINING_REWARD} = require('../config');

describe('Transaction', () => {
  let transaction, wallet, recepient, amount;
  beforeEach(() => {
    wallet = new Wallet();
    amount = 50;
    recepient = 'r3c1p13nt';
    transaction = Transaction.newTransaction(wallet, recepient, amount);
  });

  it('outputs the `amount` subtracted from the wallet balance', () => {
    expect(transaction.output.find(output=> output.address === wallet.publicKey).amount)
      .toEqual(wallet.balance - amount);
  });

  it('outputs the `amount` added to the recepient', () => {
    expect(transaction.output.find(output=> output.address === recepient).amount)
      .toEqual(amount);
  });

  it('inputs the balance of the wallet', () => {
    expect(transaction.input.amount).toEqual(wallet.balance);
  });

  it('validates the valid transaction', () => {
    expect(Transaction.verifyTransaction(transaction)).toBe(true);
  });

  it('invalidates the corrupt transaction', () => {
    transaction.output[0].amount = 50000;
    expect(Transaction.verifyTransaction(transaction)).toBe(false);
  });

  describe('Transacting with an `amount` which exceeds the balance', () => {
      beforeEach(() => {
        amount = 50000;
        transaction = Transaction.newTransaction(wallet, recepient, amount);
      });

      it('does not create the transaction', () =>{
        expect(transaction).toEqual(undefined);
      })
  });

  describe('updating a transaction', () => {
      let nextAmount, nextRecepient;

      beforeEach(() => {
        nextAmount = 20;
        nextRecepient = 'n3xt-4ddr355';
        transaction = transaction.update(wallet, nextRecepient, nextAmount);
      });

      it('subtracts the next amout from the sender\'s output', () => {
        expect(transaction.output.find(output => output.address === wallet.publicKey).amount).toEqual(wallet.balance - amount - nextAmount);
      });

      it('outputs an amount for the next recepient.', () => {
        expect(transaction.output.find(output => output.address === nextRecepient).amount).toEqual(nextAmount);
      });
  });

  describe('creating a reward transaction', () => {
    beforeEach(()=>{
      transaction = Transaction.rewardTransaction(wallet, Wallet.blockChainWallet());
    });

    it(`reward the miner's wallet`, () => {
      expect(transaction.output.find(output => output.address === wallet.publicKey).amount).toEqual(MINING_REWARD);
    });
  });

});
