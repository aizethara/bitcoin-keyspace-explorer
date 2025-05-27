# Bitcoin & Ethereum Keyspace Exploration Tool

**Educational & Research Use Only**

---

## Project Overview

This Node.js project demonstrates **keyspace exploration** techniques for Bitcoin and Ethereum address generation.  
It is intended purely for **cryptographic research**, academic study, and to illustrate why exhaustive search of private keys in real-world networks is **computationally infeasible**.

> **Disclaimer:**  
> This software is provided **"as is"** for educational and research purposes only.  
> The author does **not** endorse or condone any illegal activities, including unauthorized access to third-party wallets or accounts.  
> Users are solely responsible for how they use this tool.

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

## **About Suffix Exploration & Bitcoin Puzzle Context**

This project implements a **keyspace search method** by fixing a large random prefix (120 bits) and iterating exhaustively over all possible 16-bit suffixes, effectively exploring a small slice of the **256-bit private key space**.

- **Bitcoin Puzzle relevance:**
Some cryptographic puzzles and challenges rely on finding keys within a constrained subset of the keyspace (e.g., known prefix or suffix). This tool demonstrates how such constrained searches operate in practice.

- **Efficiency considerations:**
Despite limiting the search to a 16-bit suffix (65,536 possibilities), the overall keyspace remains astronomically large. The computational cost to find even a single matching key remains impractical for real-world scenarios.

- **Educational value:**
By implementing this approach, the tool helps visualize the cryptographic principles behind Bitcoin and Ethereum key generation, the impracticality of brute-force attacks, and the structure of key derivation.

- **Increasing your chances:**
If your goal is to participate in real Bitcoin Puzzle challenges, your only meaningful chance is to use hardware acceleration. That means:
- Running on multiple **RTX 4000-class GPUs** or better
- Writing compute kernels in [CUDA](https://developer.nvidia.com/cuda-toolkit) (not using the CPU)
- Focusing exclusively on the **known key ranges** published by the [Bitcoin Puzzle project](https://bitcointalk.org/index.php?topic=1306983.0)
- Optionally, using **ASICs** if available, though they require custom firmware or firmware exploitation to repurpose for this task.

## Usage

Install dependencies:
```bash
cd bitcoin-keyspace-explorer
npm install
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

- [**Node.js v22**](https://nodejs.org/en/download)
- No external network connections or wallet APIs are used by default

## Best Practices & Notes

- Keep your own `targets.txt` limited to known test addresses.
- Do not use this in any live or production environment.
- Understand that **true private key brute-forcing is not feasible**; this is for learning and analysis only.

## License & Contribution

Contributions that improve documentation, clarify cryptographic concepts, or enhance the educational value are welcome.
Please ensure all pull requests respect the educational focus and do not introduce real-world attack vectors.