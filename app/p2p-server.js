const webSocket = require('ws');

const P2P_PORT = process.env.P2P_PORT || 5001;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
const MESSAGE_TYPES = {
  chain: "CHAIN",
  transaction: "TRANSACTION",
  clear_transactions:"CLEAR_TRANSACTIONS"
};

//$ P2P_PORT=5003 PEERS=ws://localhost:5001,ws://localhost:5002 npm run dev

class P2pServer {
  constructor(blockchain, transactionPool){
    // to synchronize blockchains
    this.blockchain = blockchain;
    // to synchronize the transactionpools
    this.transactionPool = transactionPool;
    this.sockets = [];
  }

  // will do the job of starting up the server and creating it
  listen(){
    // to create the web socket server we can use a server class that contained in the websocket module and shared statically.
    const server = new webSocket.Server({port: P2P_PORT});
    //to listen incoming types of messages sent to the web socket server.
    // first argument of event listening is event which we are listening to.
    // second is a call back function which as its paramemter is one socket object that is created as the result of this connection.
    server.on('connection', socket => this.connectSocket(socket));

    // this will handle later instances of application connecting to peers that are specified when they're starting.
    this.connectToPeers()
    console.log(`Listening for peer to peer connection on: ${P2P_PORT}`)
  }

  connectToPeers(){
    peers.forEach(peer => {
      const socket = new webSocket(peer);
      // this code will help if list is given in env variable
      socket.on('open', () => this.connectSocket(socket));
    });
  }

  connectSocket(socket){
    this.sockets.push(socket);
    console.log('Socket connected');

    this.messageHandler(socket);

    // to send message
    this.sendChain(socket);
  }

  // to handle incoming messages coming from peers
  // message event is triggered by the send function
  messageHandler(socket){
    socket.on('message', message => {
      const data = JSON.parse(message);
      // console.log('data', data);

      switch(data.type){

        case MESSAGE_TYPES.chain:
          this.blockchain.replaceChain(data.chain);
          break;

        case MESSAGE_TYPES.transaction:
          this.transactionPool.updateOrAddTransaction(data.transaction);
          break;

        case MESSAGE_TYPES.clear_transactions:
          this.transactionPool.clear();
          break;
      }

    });
  }

  sendTransaction(socket, transaction){
    socket.send(JSON.stringify(transaction));
  }

  // to send messages
  sendChain(socket){
    socket.send(JSON.stringify({
          type: MESSAGE_TYPES.chain,
          chain: this.blockchain.chain
        }));
  }

  syncChains(){
    this.sockets.forEach(socket => this.sendChain(socket));
  }

  // to add new transaction and sync all transactions in pool
  broadcastTransaction(transaction){
    this.sockets.forEach(socket => this.sendTransaction(socket, {
      type: MESSAGE_TYPES.transaction,
      transaction
    }));
  }

  broadcastClearTransactions(){
    this.sockets.forEach(socket => socket.send(JSON.stringify({
        type: MESSAGE_TYPES.clear_transactions
      })));
  }
}

module.exports = P2pServer
