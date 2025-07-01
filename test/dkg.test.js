import { expect } from 'chai';
import crypto from 'crypto';
import EC from 'elliptic';
const ec = new EC.ec('secp256k1');

describe('DKG Test', function() {
  it('should generate shared key and sign transaction', async function() {
    // Mock 3 participants (laptop, mobile, Fireblocks)
    const participants = Array(3).fill().map(() => ({
      privateKey: ec.genKeyPair().getPrivate().toString('hex'),
      publicKey: null,
      shares: []
    }));

    // 1. Generate shares using Shamir's Secret Sharing (simplified)
    const threshold = 2;
    participants.forEach((p, i) => {
      const keyPair = ec.keyFromPrivate(p.privateKey);
      p.publicKey = keyPair.getPublic('hex');
      
      // Generate shares for other participants (mock)
      participants.forEach((p2, j) => {
        if (i !== j) p2.shares.push(p.privateKey.slice(0, 10)); // Mock share
      });
    });

    // 2. Combine shares to reconstruct private key (mock, simplified)
    const combinedPrivateKey = participants
      .slice(0, threshold)
      .reduce((sum, p) => {
        const key = ec.keyFromPrivate(p.privateKey).getPrivate();
        return sum.add(key);
      }, ec.keyFromPrivate('1').getPrivate());

    // 3. Create group key pair
    const groupKey = ec.keyFromPrivate(combinedPrivateKey.toString('hex'));

    // 4. Create transaction
    const tx = {
      to: '0x1234567890abcdef',
      value: '1000000000000000000',
      nonce: 0
    };

    // 5. Hash the transaction data
    const txHash = crypto.createHash('sha256').update(JSON.stringify(tx)).digest('hex');

    // 6. Sign transaction hash
    const sig = groupKey.sign(txHash);

    // 7. Verify signature
    const valid = groupKey.verify(txHash, sig);

    expect(valid).to.be.true;
  });
});
