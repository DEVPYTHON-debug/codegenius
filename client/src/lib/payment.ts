// Flutterwave payment integration utilities
interface FlutterwaveConfig {
  amount: number;
  email: string;
  name: string;
  phone: string;
  tx_ref: string;
  currency?: string;
  payment_options?: string;
  redirect_url?: string;
  customizations?: {
    title?: string;
    description?: string;
    logo?: string;
  };
}

interface FlutterwaveResponse {
  status: 'successful' | 'cancelled' | 'failed';
  transaction_id?: string;
  tx_ref: string;
  flw_ref?: string;
  amount?: number;
  currency?: string;
  payment_type?: string;
}

// Flutterwave test credentials from environment or fallback
const FLUTTERWAVE_PUBLIC_KEY = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-185cf8aac08dfc1731b3d41f11e4f783-X';

declare global {
  interface Window {
    FlutterwaveCheckout: (config: any) => void;
  }
}

export function loadFlutterwaveScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (window.FlutterwaveCheckout) {
      resolve();
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector('script[src*="flutterwave"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', reject);
      return;
    }

    // Create and load script
    const script = document.createElement('script');
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.async = true;
    
    script.onload = () => {
      if (window.FlutterwaveCheckout) {
        resolve();
      } else {
        reject(new Error('Flutterwave script loaded but FlutterwaveCheckout not available'));
      }
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Flutterwave script'));
    };

    document.head.appendChild(script);
  });
}

export async function initializeFlutterwave(config: FlutterwaveConfig): Promise<FlutterwaveResponse> {
  return new Promise(async (resolve, reject) => {
    try {
      // Load Flutterwave script if not already loaded
      await loadFlutterwaveScript();

      const flwConfig = {
        public_key: FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: config.tx_ref,
        amount: config.amount,
        currency: config.currency || 'NGN',
        payment_options: config.payment_options || 'card,mobilemoney,ussd,banktransfer',
        redirect_url: config.redirect_url || window.location.origin,
        customer: {
          email: config.email,
          phone_number: config.phone,
          name: config.name,
        },
        customizations: {
          title: config.customizations?.title || 'Si-link Payment',
          description: config.customizations?.description || 'Payment for Si-link services',
          logo: config.customizations?.logo || '',
        },
        callback: function (data: FlutterwaveResponse) {
          console.log('Flutterwave payment callback:', data);
          
          if (data.status === 'successful') {
            // Verify payment on backend
            verifyPayment(data.transaction_id!, data.tx_ref)
              .then(() => resolve(data))
              .catch(reject);
          } else {
            resolve(data);
          }
        },
        onclose: function () {
          console.log('Flutterwave payment modal closed');
          resolve({
            status: 'cancelled',
            tx_ref: config.tx_ref
          });
        },
      };

      window.FlutterwaveCheckout(flwConfig);
    } catch (error) {
      console.error('Error initializing Flutterwave:', error);
      reject(error);
    }
  });
}

async function verifyPayment(transactionId: string, txRef: string): Promise<void> {
  try {
    const response = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        transaction_id: transactionId,
        tx_ref: txRef,
      }),
    });

    if (!response.ok) {
      throw new Error('Payment verification failed');
    }

    const result = await response.json();
    console.log('Payment verification result:', result);
  } catch (error) {
    console.error('Payment verification error:', error);
    throw error;
  }
}

// Utility function to generate transaction reference
export function generateTxRef(prefix: string = 'silink'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
}

// Utility function to format currency
export function formatCurrency(amount: number, currency: string = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

// Payment status checker
export async function getPaymentStatus(txRef: string): Promise<any> {
  try {
    const response = await fetch(`/api/payments/status/${txRef}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to get payment status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting payment status:', error);
    throw error;
  }
}

// Bank list for withdrawals (Nigerian banks)
export const NIGERIAN_BANKS = [
  { code: '044', name: 'Access Bank' },
  { code: '063', name: 'Access Bank (Diamond)' },
  { code: '035', name: 'ALAT by WEMA' },
  { code: '401', name: 'ASO Savings and Loans' },
  { code: '050', name: 'Ecobank Nigeria' },
  { code: '084', name: 'Enterprise Bank' },
  { code: '070', name: 'Fidelity Bank' },
  { code: '011', name: 'First Bank of Nigeria' },
  { code: '214', name: 'First City Monument Bank' },
  { code: '058', name: 'Guaranty Trust Bank' },
  { code: '030', name: 'Heritage Bank' },
  { code: '301', name: 'Jaiz Bank' },
  { code: '082', name: 'Keystone Bank' },
  { code: '014', name: 'MainStreet Bank' },
  { code: '076', name: 'Polaris Bank' },
  { code: '101', name: 'Providus Bank' },
  { code: '221', name: 'Stanbic IBTC Bank' },
  { code: '068', name: 'Standard Chartered Bank' },
  { code: '232', name: 'Sterling Bank' },
  { code: '100', name: 'Suntrust Bank' },
  { code: '032', name: 'Union Bank of Nigeria' },
  { code: '033', name: 'United Bank For Africa' },
  { code: '215', name: 'Unity Bank' },
  { code: '035', name: 'Wema Bank' },
  { code: '057', name: 'Zenith Bank' },
];

// Validate Nigerian phone number
export function validateNigerianPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  // Nigerian phone numbers: 080xxxxxxxx, 081xxxxxxxx, 090xxxxxxxx, 070xxxxxxxx, etc.
  const nigerianPhoneRegex = /^(070|080|081|090|091|080|081|070|071|072|073|074|075|076|077|078|079|080|081|082|083|084|085|086|087|088|089|090|091|092|093|094|095|096|097|098|099)\d{8}$/;
  return nigerianPhoneRegex.test(cleanPhone);
}

// Validate Nigerian BVN
export function validateBVN(bvn: string): boolean {
  const cleanBVN = bvn.replace(/\D/g, '');
  return cleanBVN.length === 11 && /^\d{11}$/.test(cleanBVN);
}

// Validate Nigerian NIN
export function validateNIN(nin: string): boolean {
  const cleanNIN = nin.replace(/\D/g, '');
  return cleanNIN.length === 11 && /^\d{11}$/.test(cleanNIN);
}
