/**
 * Unit Tests for Credit Package System (IMP-006)
 *
 * Tests credit package definitions and calculations
 */

import { describe, it, expect } from 'vitest';
import {
  CREDIT_PACKAGES,
  getCreditPackage,
  formatPrice,
} from '@/lib/credit-packages';

describe('Credit Package Definitions', () => {
  it('should have at least 3 credit packages', () => {
    expect(CREDIT_PACKAGES.length).toBeGreaterThanOrEqual(3);
  });

  it('should have valid package structure', () => {
    CREDIT_PACKAGES.forEach((pkg) => {
      expect(pkg).toHaveProperty('id');
      expect(pkg).toHaveProperty('name');
      expect(pkg).toHaveProperty('credits');
      expect(pkg).toHaveProperty('price');
      expect(pkg).toHaveProperty('description');

      // Validate types
      expect(typeof pkg.id).toBe('string');
      expect(typeof pkg.name).toBe('string');
      expect(typeof pkg.credits).toBe('number');
      expect(typeof pkg.price).toBe('number');

      // Validate positive values
      expect(pkg.credits).toBeGreaterThan(0);
      expect(pkg.price).toBeGreaterThan(0);
    });
  });

  it('should have increasing prices for larger packages', () => {
    for (let i = 1; i < CREDIT_PACKAGES.length; i++) {
      const previousPkg = CREDIT_PACKAGES[i - 1];
      const currentPkg = CREDIT_PACKAGES[i];

      expect(currentPkg.credits).toBeGreaterThan(previousPkg.credits);
      expect(currentPkg.price).toBeGreaterThan(previousPkg.price);
    });
  });

  it('should have better price per credit for larger packages', () => {
    const pricesPerCredit = CREDIT_PACKAGES.map(
      (pkg) => pkg.price / pkg.credits
    );

    for (let i = 1; i < pricesPerCredit.length; i++) {
      // Larger packages should have lower or equal price per credit
      expect(pricesPerCredit[i]).toBeLessThanOrEqual(pricesPerCredit[i - 1]);
    }
  });

  it('should have popular package marked', () => {
    const popularPackages = CREDIT_PACKAGES.filter((pkg) => pkg.popular);
    expect(popularPackages.length).toBeGreaterThan(0);
  });
});

describe('getCreditPackage Function', () => {
  it('should return package by valid ID', () => {
    const firstPackageId = CREDIT_PACKAGES[0].id;
    const result = getCreditPackage(firstPackageId);

    expect(result).toBeDefined();
    expect(result?.id).toBe(firstPackageId);
  });

  it('should return undefined for invalid ID', () => {
    const result = getCreditPackage('invalid-package-id');
    expect(result).toBeUndefined();
  });

  it('should return undefined for empty string', () => {
    const result = getCreditPackage('');
    expect(result).toBeUndefined();
  });

  it('should return all packages by their IDs', () => {
    CREDIT_PACKAGES.forEach((pkg) => {
      const result = getCreditPackage(pkg.id);
      expect(result).toEqual(pkg);
    });
  });
});

describe('formatPrice Function', () => {
  it('should format prices with dollar sign', () => {
    expect(formatPrice(4900)).toBe('$49.00');
    expect(formatPrice(9900)).toBe('$99.00');
    expect(formatPrice(19900)).toBe('$199.00');
  });

  it('should handle zero correctly', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('should handle cents correctly', () => {
    expect(formatPrice(1050)).toBe('$10.50');
    expect(formatPrice(999)).toBe('$9.99');
  });

  it('should handle large amounts', () => {
    expect(formatPrice(1000000)).toBe('$10,000.00');
  });

  it('should handle negative amounts (refunds)', () => {
    const result = formatPrice(-4900);
    expect(result).toContain('49');
  });
});

describe('Price Per Credit Calculation', () => {
  it('should calculate correct price per credit', () => {
    CREDIT_PACKAGES.forEach((pkg) => {
      const pricePerCredit = pkg.price / pkg.credits;
      expect(pricePerCredit).toBeGreaterThan(0);
      expect(pricePerCredit).toBeLessThan(pkg.price);
    });
  });

  it('should show savings for larger packages', () => {
    if (CREDIT_PACKAGES.length < 2) return;

    const smallestPkg = CREDIT_PACKAGES[0];
    const largestPkg = CREDIT_PACKAGES[CREDIT_PACKAGES.length - 1];

    const smallPricePerCredit = smallestPkg.price / smallestPkg.credits;
    const largePricePerCredit = largestPkg.price / largestPkg.credits;

    expect(largePricePerCredit).toBeLessThanOrEqual(smallPricePerCredit);

    // Calculate savings percentage
    const savings =
      ((smallPricePerCredit - largePricePerCredit) / smallPricePerCredit) * 100;
    expect(savings).toBeGreaterThanOrEqual(0);
  });
});

describe('Package Metadata', () => {
  it('should have unique package IDs', () => {
    const ids = CREDIT_PACKAGES.map((pkg) => pkg.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have descriptive names', () => {
    CREDIT_PACKAGES.forEach((pkg) => {
      expect(pkg.name.length).toBeGreaterThan(2);
    });
  });

  it('should have feature lists if present', () => {
    CREDIT_PACKAGES.forEach((pkg) => {
      if (pkg.features) {
        expect(Array.isArray(pkg.features)).toBe(true);
        expect(pkg.features.length).toBeGreaterThan(0);
      }
    });
  });

  it('should have badge text for special packages', () => {
    const specialPackages = CREDIT_PACKAGES.filter((pkg) => pkg.badge);
    specialPackages.forEach((pkg) => {
      expect(typeof pkg.badge).toBe('string');
      expect(pkg.badge!.length).toBeGreaterThan(0);
    });
  });
});

describe('Business Logic Validation', () => {
  it('should have reasonable minimum package (at least 10 credits)', () => {
    const minPackage = CREDIT_PACKAGES[0];
    expect(minPackage.credits).toBeGreaterThanOrEqual(10);
  });

  it('should have reasonable prices (between $1 and $1000)', () => {
    CREDIT_PACKAGES.forEach((pkg) => {
      const dollarPrice = pkg.price / 100;
      expect(dollarPrice).toBeGreaterThan(1);
      expect(dollarPrice).toBeLessThan(1000);
    });
  });

  it('should have price per credit between $0.50 and $5', () => {
    CREDIT_PACKAGES.forEach((pkg) => {
      const pricePerCredit = pkg.price / pkg.credits / 100;
      expect(pricePerCredit).toBeGreaterThanOrEqual(0.5);
      expect(pricePerCredit).toBeLessThanOrEqual(5);
    });
  });
});
