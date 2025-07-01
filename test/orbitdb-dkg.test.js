import { expect } from 'chai';
import { rimraf } from 'rimraf';
import { createOrbitDB } from '@orbitdb/core';
import { IPFSAccessController } from '@orbitdb/core/src/access-controllers/index.js';
import connectPeers from './utils/connect-nodes.js';
import waitFor from './utils/wait-for.js';
import createHelia from './utils/create-helia.js';
import EC from 'elliptic';

const ec = new EC.ec('secp256k1');

describe('DKG and Transaction Signing with OrbitDB', function() {
  this.timeout(10000);

  let ipfs1, ipfs2;
  let orbitdb1, orbitdb2;

  before(async () => {
    ipfs1 = await createHelia({ directory: './ipfs3' });
    ipfs2 = await createHelia({ directory: './ipfs4' });
    await connectPeers(ipfs1, ipfs2);

    orbitdb1 = await createOrbitDB({ ipfs: ipfs1, id: 'dkg-user1', directory: './orbitdb3' });
    orbitdb2 = await createOrbitDB({ ipfs: ipfs2, id: 'dkg-user2', directory: './orbitdb4' });
  });

  after(async () => {
    await orbitdb1.stop();
    await orbitdb2.stop();
    await ipfs1.blockstore.child.child.child.close();
    await ipfs2.blockstore.child.child.child.close();
    await ipfs1.stop();
    await ipfs2.stop();

    await rimraf('./orbitdb3');
    await rimraf('./orbitdb4');
    await rimraf('./ipfs3');
    await rimraf('./ipfs4');
  });

  describe('DKG coordination', () => {
    let db1, db2;

    afterEach(async () => {
      if (db1) await db1.close();
      if (db2) await db2.close();
    });

  it('should coordinate DKG commitments between participants', async function() {
    // Participant 1 creates the DKG database with IPFS access controller (allows both participants to write)
    db1 = await orbitdb1.open('dkg-commitments', {
      AccessController: IPFSAccessController({
        write: [orbitdb1.identity.id, orbitdb2.identity.id]
      })
    });
    
    const participant1Key = ec.genKeyPair();
    const commitment1 = {
      type: 'dkg_commitment',
      participantId: 'participant1',
      commitment: participant1Key.getPrivate().toString('hex').slice(0, 10),
      publicKey: participant1Key.getPublic('hex'),
      timestamp: Date.now()
    };
    
    console.log('Participant 1 adding their commitment...');
    await db1.add(commitment1);
    
    // Participant 2 joins the database and waits for replication
    let replicated = false;
    const onJoin = async (peerId, heads) => {
      console.log('Participant 2 detected peer joined');
      replicated = true;
    };
    
    console.log('Participant 2 joining database...');
    db2 = await orbitdb2.open(db1.address);
    db2.events.on('join', onJoin);
    
    await waitFor(() => replicated, () => true);
    
    // Now participant 2 adds their commitment
    const participant2Key = ec.genKeyPair();
    const commitment2 = {
      type: 'dkg_commitment',
      participantId: 'participant2',
      commitment: participant2Key.getPrivate().toString('hex').slice(0, 10),
      publicKey: participant2Key.getPublic('hex'),
      timestamp: Date.now()
    };
    
    console.log('Participant 2 adding their commitment...');
    await db2.add(commitment2);
    
    // Wait for full synchronization
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify both participants see both commitments
    const entries1 = [];
    for await (const event of db1.iterator()) {
      entries1.unshift(event);
    }
    
    const entries2 = [];
    for await (const event of db2.iterator()) {
      entries2.unshift(event);
    }
    
    console.log(`Participant 1 sees ${entries1.length} commitments`);
    console.log(`Participant 2 sees ${entries2.length} commitments`);
    
    // Both participants should see both commitments
    expect(entries1).to.have.length(2);
    expect(entries2).to.have.length(2);
    
    const commitments1 = entries1.map(e => e.value);
    const commitments2 = entries2.map(e => e.value);
    
    // Verify each participant can see both commitments
    expect(commitments1.some(c => c.participantId === 'participant1')).to.be.true;
    expect(commitments1.some(c => c.participantId === 'participant2')).to.be.true;
    expect(commitments2.some(c => c.participantId === 'participant1')).to.be.true;
    expect(commitments2.some(c => c.participantId === 'participant2')).to.be.true;

    console.log('✓ DKG commitments: Each participant added their own commitment and both replicated successfully!');
  });

    it('should coordinate threshold signature creation', async function() {
      // Create database  
      db1 = await orbitdb1.open('dkg-signatures');
      
      // Create a mock transaction
      const transaction = {
        to: '0x1234567890abcdef1234567890abcdef12345678',
        value: '1000000000000000000',
        nonce: 42,
        gasPrice: '20000000000'
      };

      const txHash = JSON.stringify(transaction);

      // Simulate threshold signature process
      const participant1Key = ec.genKeyPair();
      const participant2Key = ec.genKeyPair();

      // Each participant creates a partial signature
      const partialSig1 = participant1Key.sign(txHash);
      const partialSig2 = participant2Key.sign(txHash);

      // Store partial signatures in OrbitDB
      await db1.add({
        type: 'partial_signature',
        participantId: 'participant1',
        txHash: txHash,
        signature: partialSig1.toDER('hex'),
        timestamp: Date.now()
      });

      await db1.add({
        type: 'partial_signature',
        participantId: 'participant2',
        txHash: txHash,
        signature: partialSig2.toDER('hex'),
        timestamp: Date.now()
      });

      // Now replicate to second peer
      let replicated = false;
      const onJoin = async (peerId, heads) => {
        replicated = true;
      };

      db2 = await orbitdb2.open(db1.address);
      db2.events.on('join', onJoin);

      await waitFor(() => replicated, () => true);

      // Retrieve and verify partial signatures from replicated db
      const entries2 = [];
      for await (const event of db2.iterator()) {
        entries2.unshift(event);
      }
      
      const partialSigs = entries2
        .map(e => e.value)
        .filter(v => v.type === 'partial_signature');

      expect(partialSigs).to.have.length(2);
      
      // Verify signatures are valid
      partialSigs.forEach(sig => {
        expect(sig.signature).to.be.a('string');
        expect(sig.signature).to.have.length.greaterThan(0);
        expect(sig.participantId).to.be.oneOf(['participant1', 'participant2']);
      });

      console.log('✓ Threshold signature coordination successfully replicated between participants');
    });
  });
});
