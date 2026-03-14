export interface CreditPackage {
  id: 'starter' | 'pro' | 'expert';
  name: string;
  credits: number;
  price: number; // in cents
  pricePerCredit: number; // in cents
  savings?: number; // percentage
  popular?: boolean;
  features: string[];
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 50,
    price: 4900, // $49.00
    pricePerCredit: 98, // $0.98 per credit
    features: [
      '50 video feedback credits',
      'Access to all trainers',
      'Timestamped comments',
      'Priority email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    credits: 120,
    price: 9900, // $99.00
    pricePerCredit: 83, // $0.83 per credit
    savings: 15,
    popular: true,
    features: [
      '120 video feedback credits',
      'Save 15% vs Starter',
      'Access to all trainers',
      'Timestamped comments',
      'Priority email support',
      'Advanced analytics',
    ],
  },
  {
    id: 'expert',
    name: 'Expert Pack',
    credits: 300,
    price: 19900, // $199.00
    pricePerCredit: 66, // $0.66 per credit
    savings: 33,
    features: [
      '300 video feedback credits',
      'Save 33% vs Starter',
      'Access to all trainers',
      'Timestamped comments',
      'Priority email support',
      'Advanced analytics',
      'Dedicated account manager',
    ],
  },
];

export function getCreditPackage(packageId: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find((pkg) => pkg.id === packageId);
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
