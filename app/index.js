const express = require('express');
const Blockchain = require('../blockchain');
const P2pServer = require('./p2p-server');
const Wallet = require('../wallet');
const TransactionPool = require('../wallet/transaction-pool');
const Miner = require('./miner');

// post request - allows a user to add a new data to the chain
// In order to receive this data in a specific format(json) we will use a module called BodyParser
// npm i body-parser --save
const bodyParser = require('body-parser');

// if env variable is already stored then we just need to take that already set port in place of 3001
//$ HTTP_PORT=3002 npm run dev --- this is the command to set env variable and run
const HTTP_PORT = process.env.HTTP_PORT || 3001;

const app = express();

// To give each user a separate instance of wallet
const wallet = new Wallet();
const tp = new TransactionPool();

//To use body-parser as middleware function to convert to json
app.use(bodyParser.json());
const bc = new Blockchain();
const p2pServer = new P2pServer(bc, tp);
const miner = new Miner(bc, tp, wallet, p2pServer);

console.log(`Block Details ${bc.chain}`)
app.get('/blocks', (req, res) => {
  res.json(bc.chain);
});

// to get all the transactions from the pool
app.get('/transactions', (req, res) => {
  res.json(tp.transactions);
});

// to get public key
app.get('/public-key', (req, res) => {
  res.json({publicKey: wallet.publicKey});
});

// to get balance
app.get('/balance', (req, res) => {
  res.json({balance: wallet.calculateBalance(bc)});
});

app.post('/mine', (req, res) => {
  //when user request to add express will automatically create a body object for this request and this body object contains other objects.
  const block = bc.addBlock(req.body.data);

  //to inform the user that post request was successful we will add the log that new block was added
  console.log(`New block added: ${block.toString()}`);

  //To sychronize the change in the blockchain
  p2pServer.syncChains();

  // after adding redirect user to get the chain
  res.redirect('/blocks');
});

// to add new transaction to the pool
app.post('/transact', (req, res) => {
  // User will provide the recepient and amout
  const {recepient, amount} = req.body;
  const transaction = wallet.createTransaction(recepient, amount, bc, tp);
  p2pServer.broadcastTransaction(transaction);
  res.redirect('/transactions');
});

// to mine transactions get request
app.get('/mine-transactions', (req, res) => {
  const block = miner.mine();
  console.log(`new block added: ${block.toString()}`);

  res.redirect('/blocks');
});

app.listen(HTTP_PORT, () => {console.log(`Listening on port ${HTTP_PORT}`)});
p2pServer.listen();
