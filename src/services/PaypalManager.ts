
'use server';
/**
 * @fileOverview Axiom Frontier - PayPal Payment Service
 * Handles order creation, payment capture, and Matrix Energy provisioning.
 */

import { rewardEnergy } from './TransactionManager';
import { doc, getDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const { firestore: db } = initializeFirebase();

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET_KEY = process.env.PAYPAL_SECRET_KEY;
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'live';

const PAYPAL_API_BASE = PAYPAL_MODE === 'sandbox'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

const PRODUCTS: Record<string, { name: string; amount: string; energy: number }> = {
  'ENERGY_100': { name: '100 Matrix Energy', amount: '0.99', energy: 100 },
  'ENERGY_500': { name: '500 Matrix Energy', amount: '3.99', energy: 500 },
  'ENERGY_2000': { name: '2000 Matrix Energy', amount: '9.99', energy: 2000 },
};

/**
 * Retrieves an OAuth2 access token from PayPal
 */
async function getAccessToken(): Promise<string> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET_KEY) {
    throw new Error('PayPal credentials not configured in environment variables.');
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET_KEY}`).toString('base64');
  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store'
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal auth failed: ${res.status} ${text}`);
  }

  const data = await res.json() as any;
  return data.access_token;
}

/**
 * Creates a PayPal order for a specific energy product
 */
export async function createPaypalOrder(productId: string) {
  try {
    const product = PRODUCTS[productId];
    if (!product) {
      throw new Error('Invalid product ID');
    }

    const accessToken = await getAccessToken();

    const orderRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: productId,
          description: product.name,
          amount: {
            currency_code: 'EUR',
            value: product.amount,
          },
        }],
        application_context: {
          brand_name: 'Ouroboros Collective',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
        },
      }),
    });

    if (!orderRes.ok) {
      const text = await orderRes.text();
      console.error('PayPal create order failed:', text);
      throw new Error('Failed to create PayPal order');
    }

    const orderData = await orderRes.json() as any;
    return { orderID: orderData.id };
  } catch (err: any) {
    console.error('PayPal create-order error:', err.message);
    throw err;
  }
}

/**
 * Captures a PayPal order after user approval and provisions energy
 */
export async function capturePaypalOrder(orderID: string, userId: string) {
  try {
    if (!orderID || !userId) {
      throw new Error('Missing orderID or userId');
    }

    const accessToken = await getAccessToken();

    const captureRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!captureRes.ok) {
      const text = await captureRes.text();
      console.error('PayPal capture failed:', text);
      throw new Error('Failed to capture PayPal order');
    }

    const captureData = await captureRes.json() as any;

    if (captureData.status !== 'COMPLETED') {
      throw new Error(`Payment not completed: ${captureData.status}`);
    }

    const refId = captureData.purchase_units?.[0]?.reference_id;
    const product = PRODUCTS[refId];
    const energy = product?.energy || 0;
    
    // Get current world tick for the ledger entry
    let tick = 0;
    if (db) {
      const worldRef = doc(db, 'worldState', 'global');
      const worldSnap = await getDoc(worldRef);
      if (worldSnap.exists()) {
        tick = worldSnap.data().tick || 0;
      }
    }

    // Provision the energy in the Matrix Ledger
    await rewardEnergy(userId, energy, `PayPal Purchase: ${refId} (${orderID})`, tick);

    console.log(`[PAYMENT_PROVISIONED] User: ${userId}, Energy: ${energy}, Order: ${orderID}`);

    return {
      success: true,
      productId: refId,
      energy,
      orderID: captureData.id,
      payerEmail: captureData.payer?.email_address,
    };
  } catch (err: any) {
    console.error('PayPal capture-order error:', err.message);
    throw err;
  }
}

/**
 * Returns configuration details for the PayPal SDK
 */
export async function getPaypalConfig() {
  return {
    clientId: PAYPAL_CLIENT_ID || 'SB',
    mode: PAYPAL_MODE
  };
}
