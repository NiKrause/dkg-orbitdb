# DKG with OrbitDB: Decentralized Key Generation Demo

This project demonstrates how **Distributed Key Generation (DKG)** can be coordinated using **OrbitDB**, a decentralized, peer-to-peer database. It showcases how multiple participants can collaboratively generate cryptographic keys and coordinate threshold signatures without relying on a central server.

## 🔑 What is Distributed Key Generation (DKG)?

Distributed Key Generation is a cryptographic protocol that allows multiple parties to jointly generate a shared cryptographic key without any single party knowing the complete key. This is crucial for:

- **Multi-signature wallets** where multiple parties must approve transactions
- **Threshold cryptography** where a subset of participants can sign transactions
- **Decentralized governance** systems
- **Multi-party computation** scenarios

## 🌐 Why OrbitDB?

OrbitDB provides the perfect infrastructure for DKG coordination because it offers:

- **Decentralized coordination** - No central server required
- **Automatic replication** - All participants see the same data
- **Event-driven architecture** - Participants can react to protocol steps
- **Immutable audit trail** - All DKG steps are permanently recorded
- **Browser & Mobile compatible** - Works in web browsers and mobile apps

## 📋 Project Structure

```
├── test/
│   ├── dkg.test.js                 # Basic DKG simulation
│   ├── orbitdb-dkg.test.js         # DKG coordination with OrbitDB
│   ├── orbitdb-replication.test.js # Official OrbitDB replication test
│   └── utils/                      # OrbitDB utility functions
├── package.json
└── README.md
```

## 🧪 Tests Explained

### 1. `dkg.test.js` - Basic DKG Simulation

This test demonstrates the **core cryptographic concepts** of DKG:

```javascript
// 1. Generate participants with individual keys
const participants = Array(3).fill().map(() => ({
  privateKey: ec.genKeyPair().getPrivate().toString('hex'),
  publicKey: null,
  shares: []
}));

// 2. Mock Shamir's Secret Sharing
// 3. Combine shares to reconstruct group key
// 4. Sign transaction with group key
// 5. Verify signature
```

**What it shows:**
- Key generation for multiple participants
- Secret sharing simulation (simplified)
- Group key reconstruction
- Collaborative transaction signing
- Signature verification

### 2. `orbitdb-dkg.test.js` - Decentralized DKG Coordination

This test demonstrates how **OrbitDB coordinates the DKG protocol** between distributed participants:

#### Test 1: DKG Commitments Coordination
```javascript
// Participant 1 creates database and adds commitment
db1 = await orbitdb1.open('dkg-commitments', {
  AccessController: IPFSAccessController({
    write: [orbitdb1.identity.id, orbitdb2.identity.id] // Both can write
  })
});
await db1.add(commitment1);

// Participant 2 joins and adds their commitment
db2 = await orbitdb2.open(db1.address);
await db2.add(commitment2);

// Both participants see both commitments through automatic replication
```

#### Test 2: Threshold Signature Coordination
```javascript
// Store partial signatures from each participant
await db1.add({
  type: 'partial_signature',
  participantId: 'participant1',
  signature: partialSig1.toDER('hex')
});

// Automatic replication ensures all participants see all partial signatures
```

**What it demonstrates:**
- **Real distributed coordination** - Each participant runs their own OrbitDB instance
- **Access control** - Proper permissions for multi-party writing
- **Automatic replication** - Changes propagate between all participants
- **Event-driven protocol** - Participants react to each other's actions
- **Audit trail** - All protocol steps are immutably recorded

## 🚀 Real-World Use Cases

### 1. **Multi-Signature Wallets in Browsers**
```
Alice (Browser) ←→ Bob (Browser) ←→ Charlie (Mobile)
         ↘           ↓           ↙
           OrbitDB Network (P2P)
```

- **No central server** required for wallet coordination
- **Real-time synchronization** of signing requests
- **Cross-platform** support (web + mobile)
- **Offline resilience** - participants can catch up when reconnected

### 2. **Decentralized Governance Systems**
- **Proposal coordination** through OrbitDB
- **Multi-party approval** processes
- **Transparent voting** with immutable records
- **Global accessibility** through P2P networks

### 3. **Mobile-First Crypto Applications**
```
Mobile App A ←→ Mobile App B ←→ Web Wallet
      ↘            ↓            ↙
        IPFS/OrbitDB Network
```

- **Direct peer-to-peer** coordination
- **No backend infrastructure** costs
- **Censorship resistant** operations
- **Global accessibility** without geographic restrictions

### 4. **IoT Device Security**
- **Device key management** without central authorities
- **Distributed firmware signing**
- **Secure device onboarding**
- **Resilient network coordination**

## 🛠 Technical Benefits

### **Decentralized Architecture**
- No single points of failure
- No server infrastructure costs
- Censorship resistant
- Global accessibility

### **Browser & Mobile Native**
- Runs entirely in JavaScript
- No plugins or extensions required
- Cross-platform compatibility
- Real-time peer-to-peer communication

### **Cryptographically Secure**
- Industry-standard elliptic curve cryptography
- Verifiable multi-party protocols
- Immutable audit trails
- Identity-based access control

### **Developer Friendly**
- Modern JavaScript/ES6+ syntax
- Event-driven architecture
- Comprehensive test coverage
- Well-documented APIs

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 22+ (required for OrbitDB v3)
- npm

### Installation & Running Tests

```bash
# Clone and setup
git clone <this-repo>
cd dkg-test-project
npm install

# Run all tests
npm test

# Run specific test suites
npm test -- --grep "DKG Test"                              # Basic DKG
npm test -- --grep "DKG and Transaction Signing"          # OrbitDB coordination  
npm test -- --grep "Replicating databases"                # OrbitDB replication
```

### Test Output
```
✓ DKG Test
  ✓ should generate shared key and sign transaction (187ms)

✓ DKG and Transaction Signing with OrbitDB
  ✓ should coordinate DKG commitments between participants (1391ms)
  ✓ should coordinate threshold signature creation (213ms)

✓ Replicating databases
  ✓ returns all entries in the replicated database (4576ms)
  ✓ returns all entries after recreating instances (428ms)
  ✓ pins all entries in the replicated database (118ms)

6 passing (8s)
```

## 🔧 Technologies Used

- **OrbitDB v3** - Decentralized database
- **Helia** - IPFS implementation for JavaScript
- **libp2p** - Peer-to-peer networking
- **Elliptic** - Cryptographic operations
- **Mocha/Chai** - Testing framework
- **Node.js 22+** - Runtime environment

## 🌟 Future Enhancements

- **Real Shamir's Secret Sharing** implementation
- **BLS threshold signatures** for more efficient aggregation
- **Browser demo application** with live coordination
- **Mobile app integration** examples
- **Performance optimizations** for large participant sets
- **Advanced access control** patterns

## 📚 Learn More

- [OrbitDB Documentation](https://orbitdb.org/)
- [IPFS Documentation](https://docs.ipfs.io/)
- [Distributed Key Generation (Wikipedia)](https://en.wikipedia.org/wiki/Distributed_key_generation)
- [Threshold Cryptography](https://en.wikipedia.org/wiki/Threshold_cryptosystem)

## 🤝 Contributing

This project demonstrates the potential of decentralized key generation. Contributions are welcome for:

- More sophisticated DKG implementations
- Browser/mobile demo applications
- Performance improvements
- Additional test scenarios
- Documentation enhancements

---

**Built with ❤️ for the decentralized future**
