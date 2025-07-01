import { expect } from 'chai';
import crypto from 'crypto';

describe('Simple Real DKG Test', function() {
  it('should demonstrate basic polynomial evaluation', function() {
    console.log('Testing basic polynomial evaluation...');
    
    // Simple polynomial: f(x) = 5 + 3x + 2x^2
    const coefficients = [5, 3, 2];
    
    function evaluatePolynomial(x, coeffs) {
      let result = coeffs[0];
      let xPower = x;
      
      for (let i = 1; i < coeffs.length; i++) {
        result += coeffs[i] * xPower;
        xPower *= x;
      }
      
      return result;
    }
    
    // f(1) = 5 + 3*1 + 2*1^2 = 5 + 3 + 2 = 10
    const result1 = evaluatePolynomial(1, coefficients);
    expect(result1).to.equal(10);
    
    // f(2) = 5 + 3*2 + 2*2^2 = 5 + 6 + 8 = 19
    const result2 = evaluatePolynomial(2, coefficients);
    expect(result2).to.equal(19);
    
    console.log('✅ Polynomial evaluation working correctly');
  });

  it('should demonstrate Shamir secret sharing concept', function() {
    console.log('Testing Shamir secret sharing concept...');
    
    const secret = 1234;
    const threshold = 2;
    
    // Generate shares: (1, f(1)), (2, f(2)), (3, f(3))
    // where f(x) = secret + random*x
    const randomCoeff = 166;
    
    const shares = [
      { x: 1, y: secret + randomCoeff * 1 }, // (1, 1400)
      { x: 2, y: secret + randomCoeff * 2 }, // (2, 1566) 
      { x: 3, y: secret + randomCoeff * 3 }  // (3, 1732)
    ];
    
    // Reconstruct secret using Lagrange interpolation with any 2 shares
    function reconstructSecret(selectedShares) {
      let result = 0;
      
      for (let i = 0; i < selectedShares.length; i++) {
        let numerator = 1;
        let denominator = 1;
        
        for (let j = 0; j < selectedShares.length; j++) {
          if (i !== j) {
            numerator *= (0 - selectedShares[j].x);
            denominator *= (selectedShares[i].x - selectedShares[j].x);
          }
        }
        
        result += selectedShares[i].y * (numerator / denominator);
      }
      
      return Math.round(result);
    }
    
    // Test with shares 1 and 2
    const reconstructed1 = reconstructSecret([shares[0], shares[1]]);
    expect(reconstructed1).to.equal(secret);
    
    // Test with shares 1 and 3
    const reconstructed2 = reconstructSecret([shares[0], shares[2]]);
    expect(reconstructed2).to.equal(secret);
    
    // Test with shares 2 and 3
    const reconstructed3 = reconstructSecret([shares[1], shares[2]]);
    expect(reconstructed3).to.equal(secret);
    
    console.log('✅ Shamir secret sharing working correctly');
    console.log(`Original secret: ${secret}`);
    console.log(`Reconstructed: ${reconstructed1}, ${reconstructed2}, ${reconstructed3}`);
  });
});
