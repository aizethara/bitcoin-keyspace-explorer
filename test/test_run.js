const bitcoin = require('bitcoinjs-lib');
const ecc = require('tiny-secp256k1');
const ECPairFactory = require('ecpair');
const ECPair = ECPairFactory.ECPairFactory(ecc);
const secp256k1 = require('secp256k1');
const { bech32 } = require('bech32');
const bs58check = require('bs58check');
const { keccak256 } = require('ethereum-cryptography/keccak');
const { toHex } = require('ethereum-cryptography/utils');
const { initEccLib } = require('bitcoinjs-lib');
initEccLib(ecc);
const crypto = require('crypto');
const readline = require('readline');
const fs = require('fs');

const addressesSet = new Set();
async function loadAddresses() {
  return new Promise((resolve, reject) => {
    const path = require('path');
    const targetPath = path.join(__dirname, 'test_target.txt');
    const rl = readline.createInterface({
      input: fs.createReadStream(targetPath),
      crlfDelay: Infinity
    });
    rl.on('line', line => {
      const a = line.trim();
      if (a && !a.startsWith('#')) addressesSet.add(a);
    });
    rl.on('close', () => {
      console.log(`${addressesSet.size} addresses loaded.\n${'─'.repeat(90)}`);
      resolve();
    });
    rl.on('error', reject);
  });
}

function generateBtcAddresses(privKey) {
    // Keypair
    const keyC = ECPair.fromPrivateKey(privKey, { compressed: true });
    const keyU = ECPair.fromPrivateKey(privKey, { compressed: false });
    const pubC = Buffer.from(keyC.publicKey);
    const pubU = Buffer.from(keyU.publicKey);
    // P2PKH
    const p2pkhC = bitcoin.payments.p2pkh({ pubkey: pubC }).address;
    const p2pkhU = bitcoin.payments.p2pkh({ pubkey: pubU }).address;
    // P2SH–P2PKH
    const pubKeyHashC = bitcoin.crypto.hash160(pubC);
    const redeemScriptC = bitcoin.script.compile([
      bitcoin.opcodes.OP_DUP,
      bitcoin.opcodes.OP_HASH160,
      pubKeyHashC,
      bitcoin.opcodes.OP_EQUALVERIFY,
      bitcoin.opcodes.OP_CHECKSIG
    ]);
    const p2sh_p2pkhC = bitcoin.payments.p2sh({ redeem: { output: redeemScriptC } }).address;
    const pubKeyHashU = bitcoin.crypto.hash160(pubU);
    const redeemScriptU = bitcoin.script.compile([
      bitcoin.opcodes.OP_DUP,
      bitcoin.opcodes.OP_HASH160,
      pubKeyHashU,
      bitcoin.opcodes.OP_EQUALVERIFY,
      bitcoin.opcodes.OP_CHECKSIG
    ]);
    const p2sh_p2pkhU = bitcoin.payments.p2sh({ redeem: { output: redeemScriptU } }).address;
    // P2WPKH compressed
    const p2wpkhC = bitcoin.payments.p2wpkh({ pubkey: pubC }).address;
    // P2WPKH uncompressed
    const rawU = secp256k1.publicKeyCreate(privKey, false);
    const h160 = crypto.createHash('ripemd160')
      .update(crypto.createHash('sha256').update(rawU).digest())
      .digest();
    const words = bech32.toWords(h160);
    words.unshift(0x00);
    const p2wpkhU = bech32.encode('bc', words);
    // P2SH–P2WPKH compressed
    const redeemC = bitcoin.payments.p2wpkh({ pubkey: pubC });
    const p2shwC = bitcoin.payments.p2sh({ redeem: redeemC }).address;
    // P2SH–P2WPKH uncompressed
    const redeemScript = Buffer.concat([Buffer.from([0x00, 0x14]), h160]);
    const scriptH160 = crypto.createHash('ripemd160')
      .update(crypto.createHash('sha256').update(redeemScript).digest())
      .digest();
    const p2shwU = bs58check.default.encode(Buffer.concat([Buffer.from([0x05]), scriptH160]));
    // P2TR compressed
    const tap = bitcoin.payments.p2tr({ pubkey: pubC.slice(1) }).address;
    return {
      'bitcoin p2pkh compressed':            p2pkhC,
      'bitcoin p2pkh uncompressed':          p2pkhU,
      'bitcoin p2wpkh compressed':           p2wpkhC,
      'bitcoin p2wpkh uncompressed':         p2wpkhU,
      'bitcoin p2sh(p2pkh) compressed':      p2sh_p2pkhC,
      'bitcoin p2sh(p2pkh) uncompressed':    p2sh_p2pkhU,
      'bitcoin p2sh(p2wpkh) compressed':     p2shwC,
      'bitcoin p2sh(p2wpkh) uncompressed':   p2shwU,
      'bitcoin p2tr compressed':             tap
    }
};
function generateEthAddresses(privKey) {
  const pubU = ecc.pointFromScalar(privKey, false);
  const pubC = ecc.pointFromScalar(privKey, true);
  const addrU = keccak256(pubU.slice(1)).slice(-20);
  const addrC = keccak256(pubC).slice(-20);
  return {
    'ethereum uncompressed': '0x' + toHex(addrU),
    'ethereum compressed':   '0x' + toHex(addrC)
  }
};

const N = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');
let found = ''

async function main() {
  await loadAddresses();
  const questionRl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  const askContinue = () => new Promise(resolve => {
    questionRl.question('Continue with next prefix? [y/n]: ', answer => {
      resolve(answer.trim().toLowerCase());
    });
  });
  const prefixBuf = Buffer.alloc(30);
  const MAX_PREFIX = (N - 1n) >> 16n;
  while (true) {
    let prefixHex, prefixInt;
    do {
      crypto.randomFillSync(prefixBuf);
      prefixHex = prefixBuf.toString('hex');
      prefixInt = BigInt('0x' + prefixHex);
    } while (prefixInt > MAX_PREFIX);
    for (let suffix = 0; suffix <= 0xFFFF; suffix++) {
      const suffixHex = suffix.toString(16).padStart(4, '0');
      const privHex = prefixHex + suffixHex;
      const privKey = Buffer.from(privHex, 'hex');
      const btcAddrs = generateBtcAddresses(privKey);
      const ethAddrs = generateEthAddresses(privKey);
      if (suffix % 1000 === 0) {
          console.log(`private key: ${privHex}`);
          Object.entries(btcAddrs).forEach(([label,addr]) => console.log(`${label}: ${addr.slice(0, 3)}`));
          Object.entries(ethAddrs).forEach(([label,addr]) => console.log(`${label}: ${addr}`));
          console.log(`${'─'.repeat(90)} ${found}`)
        }
      const allAddresses = [
        ...Object.values(btcAddrs),
        ...Object.values(ethAddrs)
      ];
      for (const addr of allAddresses) {
        if (addressesSet.has(addr.slice(0, 4))) {
          found = '[!] address found.'
          const line = `${new Date().toISOString()} ${addr} ${privHex}\n`;
          fs.appendFileSync('output.txt', line);
        }
      }
    }
    console.log(`Finished suffix 0000–ffff for prefix ${prefixHex.slice(0,8)}..`);
    console.log(`${'─'.repeat(90)} ${found}`)
    const ans = await askContinue();
    if (ans !== 'y') {
      console.log('Exiting.');
      break;
    }
  }
  questionRl.close();
}
  
main().catch(console.error);