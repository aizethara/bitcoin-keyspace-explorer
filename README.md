# Bitcoin & Ethereum Keyspace Exploration Tool

**Educational & Research Use Only**

---

## Project Overview

This Node.js project demonstrates **keyspace exploration** techniques for Bitcoin and Ethereum address generation.  
It is intended purely for **cryptographic research**, academic study, and to illustrate why exhaustive search of private keys in real-world networks is **computationally infeasible**.

> **Disclaimer:**  
> This software is provided **“as is”** for educational and research purposes only.  
> The author does **not** endorse or condone any illegal activities, including unauthorized access to third-party wallets or accounts.  
> Users are solely responsible for how they use this tool.

---

## Repository Structure

```
├── src/
│ ├── index.js             # Main exploration script
│ ├── target.txt           # List of sample addresses for demonstration
├── test/
│ ├── test_run.js          # Simplified test script
│ ├── test_target.txt      # Test addresses
├── output.txt             # Logged results (auto-generated)
```

---

## How It Works

1. **Random 120-bit prefix** generation (30 bytes)  
2. **Exhaustive iteration** over all 16-bit suffixes (`0000` → `ffff`)  
3. Combination into a full 256-bit private key  
4. Derivation of:
   - Bitcoin addresses (P2PKH, P2SH-wrapped, Bech32, Taproot)  
   - Ethereum addresses (from compressed & uncompressed public keys)  
5. Comparison against a predefined list (`targets.txt` or `test_targets.txt`)  
6. Matched results appended to `output.txt`

> **Note:** This method is a **conceptual demonstration**. Even with this prefix/suffix approach, the effective search space remains astronomically large, making real-world key discovery practically impossible.

---

## Usage

Install dependencies:
```bash
npm install bitcoinjs-lib tiny-secp256k1 secp256k1 bech32 bs58check ethereum-cryptography
```
Run the main exploration script:
```bash
node src/index.js
```
To run a simplified test version:
```bash
node test/test_run.js
```

## Requirements

- Node.js v22
- No external network connections or wallet APIs are used by default

## Best Practices & Notes

- Keep your own `targets.txt` limited to known test addresses.
- Do not use this in any live or production environment.
- Understand that **true private key brute-forcing is not feasible**; this is for learning and analysis only.

## License & Contribution

Contributions that improve documentation, clarify cryptographic concepts, or enhance the educational value are welcome.
Please ensure all pull requests respect the educational focus and do not introduce real-world attack vectors.