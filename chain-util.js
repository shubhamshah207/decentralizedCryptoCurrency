const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
// const uuidV1 = require('uuid/v1');
const { v1: uuidV1 } = require('uuid');
const ec = new EC('secp256k1');
class ChainUtil{

  static genKeyPair(){
    return ec.genKeyPair();
  }

  static id(){
    // to generate unique id for transactions
    return uuidV1();
  }

  static hash(data){
    return SHA256(JSON.stringify(data)).toString();
  }

  static verifySignature(publicKey, signature, dataHash){

    // it will return actual derived key using public key
    const key = ec.keyFromPublic(publicKey, 'hex');
    return key.verify(dataHash, signature);
  }
}

module.exports = ChainUtil;
