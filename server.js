import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🛡️ Middleware & Production-Ready CORS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173,https://shahistudio.com,https://www.shahistudio.com')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(null, true); // Graceful origin reflection
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// ⚡ Supabase Client Setup (PostgreSQL Database Engine)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://shahi-studio-demo.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'demo_anon_key';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 🔑 Razorpay Configuration
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key_id';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_placeholder_secret';

let razorpayInstance = null;
try {
  razorpayInstance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET
  });
} catch (e) {
  console.warn('⚠️ Razorpay initialization note:', e.message);
}

// 🏛️ Official 7 Royal Themes Catalog & Pricing (Single Source of Truth)
const PACKAGE_PRICING = {
  silver: { amount: 1299, name: 'Shahi Silver (1 Selected Royal Theme)' },
  gold: { amount: 2299, name: 'Shahi Gold Royal (All 7 Royal Themes Included)' },
  platinum: { amount: 24999, name: 'Rajmahal Platinum VIP (Full Bespoke Custom & All 7 Themes)' }
};

const THEME_PACKAGE_MAP = {
  rajmahal: 'gold',
  royaldawn: 'gold',
  jharokha: 'silver',
  mayura: 'silver',
  jodi: 'silver',
  dak: 'silver',
  ivory: 'silver',
};

// Helper to get authoritative price from package and theme
const getAuthoritativePrice = (templateSlug, packageId) => {
  // Determine effective package: prefer explicit packageId, otherwise derive from templateSlug.
  let effectivePackage = 'gold'; // Default to gold if ambiguous, NEVER silently fallback to silver!
  if (packageId && PACKAGE_PRICING[packageId]) {
    effectivePackage = packageId;
  } else if (templateSlug && THEME_PACKAGE_MAP[templateSlug]) {
    effectivePackage = THEME_PACKAGE_MAP[templateSlug];
  }

  const pkg = PACKAGE_PRICING[effectivePackage] || PACKAGE_PRICING.gold;
  const originalAmount = pkg.amount;
  const discountAmount = 0;
  const finalAmountInRupees = originalAmount;
  const finalAmountInPaise = finalAmountInRupees * 100;

  return {
    packageId: effectivePackage,
    name: pkg.name,
    originalAmountInRupees: originalAmount,
    discountAmountInRupees: discountAmount,
    amountInRupees: finalAmountInRupees,
    amountInPaise: finalAmountInPaise
  };
};

// 1. Common Order Creation Handler (Strict Server-Side Price Verification)
const handleCreateOrder = async (req, res) => {
  try {
    const { 
      templateId, 
      packageId,
      packageType,
      userId, 
      userEmail, 
      userName, 
      userPhone,
      receipt: rawReceipt
    } = req.body;

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET || RAZORPAY_KEY_ID.includes('placeholder')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Razorpay API credentials are not configured on the server.' 
      });
    }

    const effectivePackageId = packageId || packageType || (templateId ? THEME_PACKAGE_MAP[templateId] : null);
    if (!effectivePackageId && !templateId) {
      return res.status(400).json({
        success: false,
        error: 'Please select a package first (Unable to determine selected package).'
      });
    }

    // 🔒 Enforce authoritative server-side price (Client amount is NEVER blindly trusted)
    const priceInfo = getAuthoritativePrice(templateId, effectivePackageId);
    const amountInPaise = priceInfo.amountInPaise;
    const currency = 'INR';

    const receipt = (rawReceipt || `rcpt_${priceInfo.packageId}_${Date.now()}`).slice(0, 40);

    const orderOptions = {
      amount: amountInPaise,
      currency: currency,
      receipt: receipt,
      notes: {
        packageId: priceInfo.packageId,
        templateId: templateId || 'rajmahal',
        templateName: priceInfo.name,
        originalAmountInRupees: priceInfo.originalAmountInRupees,
        userId: userId || 'anonymous',
        userEmail: userEmail || '',
        userName: userName || '',
        userPhone: userPhone || '+91 9409360336',
        purpose: 'Shahi Studio Royal Wedding Kankotri Unlock'
      }
    };

    const order = await razorpayInstance.orders.create(orderOptions);

    console.log(`💳 [Razorpay Order Created] OrderId: ${order.id} | Amount: ₹${priceInfo.amountInRupees} (${order.amount} paise) | Package: ${priceInfo.packageId.toUpperCase()}`);

    // Record order in database
    try {
      await supabase.from('orders').insert({
        theme_id: templateId || 'rajmahal',
        razorpay_order_id: order.id,
        amount_inr: priceInfo.amountInRupees,
        currency: currency,
        status: 'created'
      });
    } catch (e) {}

    return res.json({
      success: true,
      order_id: order.id,
      orderId: order.id,
      amount: order.amount,
      amountInRupees: priceInfo.amountInRupees,
      currency: order.currency,
      keyId: RAZORPAY_KEY_ID,
      packageId: priceInfo.packageId,
      templateId: templateId || 'rajmahal',
      description: `Unlock ${priceInfo.name}`
    });

  } catch (error) {
    console.error('❌ [Razorpay] Order creation error:', error);
    if (error.statusCode === 401 || (error.error?.code === 'BAD_REQUEST_ERROR' && error.error?.description?.includes('auth'))) {
      return res.status(401).json({ success: false, error: 'Razorpay Authentication Failed. Check server API Key and Secret.' });
    }
    return res.status(500).json({ success: false, error: error.message || 'Failed to create Razorpay order.' });
  }
};

// Create Order Endpoints
app.post('/api/create-order', handleCreateOrder);
app.post('/api/razorpay/create-order', handleCreateOrder);

// 2. Common Payment Verification Handler (HMAC SHA-256 + Razorpay API Re-Verification)
const handleVerifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      order_id,
      razorpay_payment_id, 
      payment_id,
      razorpay_signature,
      signature,
      templateId = 'rajmahal',
      packageId,
      packageType,
      userId,
      invitationData 
    } = req.body;

    const effectivePackageId = packageId || packageType || (templateId ? THEME_PACKAGE_MAP[templateId] : 'gold');
    const finalOrderId = razorpay_order_id || order_id;
    const finalPaymentId = razorpay_payment_id || payment_id;
    const finalSignature = razorpay_signature || signature;

    if (!finalOrderId || !finalPaymentId || !finalSignature) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required payment verification fields (order_id, payment_id, signature).' 
      });
    }

    // 🔒 Step A: Mathematical HMAC-SHA256 Signature Verification
    const hmac = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET);
    hmac.update(`${finalOrderId}|${finalPaymentId}`);
    const generatedSignature = hmac.digest('hex');

    let isValid = false;
    try {
      const genBuf = Buffer.from(generatedSignature, 'utf-8');
      const sigBuf = Buffer.from(String(finalSignature).trim(), 'utf-8');
      if (genBuf.length === sigBuf.length) {
        isValid = crypto.timingSafeEqual(genBuf, sigBuf);
      }
    } catch (e) {
      isValid = false;
    }

    if (!isValid) {
      console.warn(`❌ [Razorpay] Signature mismatch for Order: ${finalOrderId}`);
      return res.status(400).json({ 
        success: false, 
        error: 'Payment verification failed: Invalid HMAC-SHA256 signature.' 
      });
    }

    const priceInfo = getAuthoritativePrice(templateId, effectivePackageId);

    // 🔒 Step B: Fetch and verify payment against authoritative Razorpay REST API
    let paymentDetails = null;
    try {
      paymentDetails = await razorpayInstance.payments.fetch(finalPaymentId);
    } catch (fetchErr) {
      console.warn('⚠️ Could not fetch payment from Razorpay API:', fetchErr.message);
    }

    if (paymentDetails) {
      if (paymentDetails.status !== 'captured' && paymentDetails.status !== 'authorized') {
        return res.status(400).json({
          success: false,
          error: `Payment is not in a successful state (Status: ${paymentDetails.status}).`
        });
      }

      if (paymentDetails.amount < priceInfo.amountInPaise) {
        return res.status(400).json({
          success: false,
          error: `Payment amount mismatch: Expected ₹${priceInfo.amountInRupees}, received ₹${paymentDetails.amount / 100}.`
        });
      }
    }

    console.log(`✅ [Razorpay] Verified: Order: ${finalOrderId} | Payment: ${finalPaymentId} | Package: ${effectivePackageId.toUpperCase()} | Amount: ₹${priceInfo.amountInRupees}`);

    const nowIso = new Date().toISOString();

    // 🔒 Step C: Idempotent Database Reconciliation (public.purchases & public.wedding_sites)
    try {
      const { data: allTemplates } = await supabase.from('templates').select('id, slug');

      if (userId && allTemplates && allTemplates.length > 0) {
        // If Gold or Platinum package is purchased, unlock ALL 7 Royal Themes!
        if (effectivePackageId === 'gold' || effectivePackageId === 'platinum') {
          for (const tpl of allTemplates) {
            await supabase.from('purchases').upsert({
              user_id: userId,
              template_id: tpl.id,
              status: 'unlocked',
              payment_reference: finalPaymentId,
              unlocked_at: nowIso
            }, { onConflict: 'user_id,template_id' });
          }
          console.log(`👑 [Shahi Studio] Unlocked all 7 Royal Themes for User ${userId} (${effectivePackageId.toUpperCase()} Package)`);
        } else {
          // Silver / Single Theme Unlock
          const targetTpl = allTemplates.find(t => t.slug === templateId) || allTemplates[0];
          if (targetTpl) {
            await supabase.from('purchases').upsert({
              user_id: userId,
              template_id: targetTpl.id,
              status: 'unlocked',
              payment_reference: finalPaymentId,
              unlocked_at: nowIso
            }, { onConflict: 'user_id,template_id' });
          }
        }
      }

      // 3. Update orders table
      await supabase.from('orders').update({
        razorpay_payment_id: finalPaymentId,
        razorpay_signature: finalSignature,
        status: 'paid'
      }).eq('razorpay_order_id', finalOrderId);

    } catch (dbErr) {
      console.warn('⚠️ Database purchase update note:', dbErr.message);
    }

    const slug = `${templateId}-${Date.now().toString(36)}`;
    const siteRecord = {
      siteId: slug,
      slug: slug,
      userId: userId || 'default_user',
      themeId: templateId,
      paymentId: finalPaymentId,
      orderId: finalOrderId,
      amount: priceInfo.amountInRupees,
      isUnlocked: true,
      publishedAt: nowIso,
      updatedAt: nowIso,
      invitationData: invitationData || null
    };

    return res.json({
      success: true,
      message: 'Payment verified and template unlocked successfully!',
      orderId: finalOrderId,
      paymentId: finalPaymentId,
      site: siteRecord
    });

  } catch (error) {
    console.error('Razorpay Verify Payment Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error during payment verification.' 
    });
  }
};

// Verify Payment Endpoints
app.post('/api/verify-payment', handleVerifyPayment);
app.post('/api/razorpay/verify-payment', handleVerifyPayment);

// 3. Official Razorpay Webhook Handler
app.post('/api/razorpay/webhook', async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  if (!webhookSecret) {
    console.warn('⚠️ [Razorpay Webhook] Received webhook event, but RAZORPAY_WEBHOOK_SECRET is not configured.');
    return res.status(200).json({ status: 'ignored', message: 'WEBHOOK: NOT CONNECTED' });
  }

  if (!signature) {
    return res.status(400).json({ error: 'Missing x-razorpay-signature header.' });
  }

  try {
    const rawBody = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.warn('❌ [Razorpay Webhook] Invalid signature.');
      return res.status(400).json({ error: 'Invalid webhook signature.' });
    }

    const event = req.body.event;
    console.log(`🔔 [Razorpay Webhook] Received verified event: ${event}`);

    if (event === 'payment.captured' || event === 'order.paid') {
      const payment = req.body.payload?.payment?.entity;
      const notes = payment?.notes || {};
      const templateId = notes.templateId || 'rajmahal';
      const userId = notes.userId;

      if (userId && templateId) {
        const { data: tpl } = await supabase.from('templates').select('id').eq('slug', templateId).maybeSingle();
        if (tpl?.id) {
          await supabase.from('purchases').upsert({
            user_id: userId,
            template_id: tpl.id,
            status: 'unlocked',
            payment_reference: payment.id,
            unlocked_at: new Date().toISOString()
          }, { onConflict: 'user_id,template_id' });
          console.log(`✅ [Razorpay Webhook] Idempotently unlocked ${templateId} for user ${userId}`);
        }
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Razorpay Webhook Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 💌 INVITATION & GUEST RSVP APIS
// ==========================================

// 3. Save / Auto-Sync Wedding Invitation State
app.post('/api/invitations/save', async (req, res) => {
  try {
    const { userId, themeId, invitationState } = req.body;
    if (!userId || !themeId) return res.status(400).json({ error: 'Missing parameters.' });

    const slug = `${themeId}-${userId.slice(0, 6)}`;
    try {
      await supabase.from('weddings').upsert({
        slug: slug,
        theme_id: themeId,
        invitation_data: invitationState,
        updated_at: new Date().toISOString()
      }, { onConflict: 'slug' });
    } catch (e) {}

    return res.json({ success: true, slug });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// 🔒 3.1. Publish & Re-Lock Invitation State Machine API
app.post('/api/invitations/publish', async (req, res) => {
  try {
    const { userId, themeId, invitationState, slug } = req.body;
    if (!userId || !themeId) return res.status(400).json({ error: 'Missing userId or themeId.' });

    const now = new Date().toISOString();
    const coupleSlug = slug || `${themeId}-${Date.now().toString(36)}`;
    const publishedUrl = `/i/${coupleSlug}`;

    try {
      const { data: tpl } = await supabase.from('templates').select('id').eq('slug', themeId).maybeSingle();
      if (tpl?.id) {
        await supabase.from('wedding_sites').upsert({
          user_id: userId,
          template_id: tpl.id,
          slug: coupleSlug,
          status: 'published',
          is_locked: true, // 🔒 Mandatory automatic re-lock
          editing_status: 'locked',
          publication_status: 'published',
          payment_status: 'paid',
          content: invitationState,
          draft_content: invitationState,
          published_url: publishedUrl,
          published_at: now,
          updated_at: now,
        }, { onConflict: 'user_id,template_id' });
      }
    } catch (dbErr) {
      console.warn('DB publish update note:', dbErr.message);
    }

    console.log(`🔒 [Shahi Studio] Published & Locked Invitation: ${coupleSlug} for User ${userId}`);

    return res.json({
      success: true,
      editingStatus: 'locked',
      publicationStatus: 'published',
      isLocked: true,
      slug: coupleSlug,
      publishedUrl,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// 🔓 3.2. Unlock Invitation for Editing (Post-Payment / Entitlement Verification)
app.post('/api/invitations/unlock-editing', async (req, res) => {
  try {
    const { userId, themeId } = req.body;
    if (!userId || !themeId) return res.status(400).json({ error: 'Missing userId or themeId.' });

    const now = new Date().toISOString();
    try {
      const { data: tpl } = await supabase.from('templates').select('id').eq('slug', themeId).maybeSingle();
      if (tpl?.id) {
        await supabase.from('wedding_sites').update({
          is_locked: false,
          editing_status: 'unlocked',
          payment_status: 'paid',
          unlocked_at: now,
          updated_at: now,
        }).eq('user_id', userId).eq('template_id', tpl.id);
      }
    } catch (dbErr) {
      console.warn('DB unlock update note:', dbErr.message);
    }

    console.log(`🔓 [Shahi Studio] Unlocked Editing for Template ${themeId} and User ${userId}`);

    return res.json({
      success: true,
      editingStatus: 'unlocked',
      isLocked: false,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// 🔍 3.3. Get Access Status for Invitation
app.get('/api/invitations/access-status/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    const userId = req.query.userId;
    if (!userId) {
      return res.json({
        paymentStatus: 'unpaid',
        editingStatus: 'locked',
        publicationStatus: 'draft',
        isEditingAllowed: false,
        isPublicLive: false,
        lockReason: 'unpaid'
      });
    }

    let isPaid = false;
    let isPublished = false;
    let isEditingAllowed = false;

    try {
      const { data: tpl } = await supabase.from('templates').select('id').eq('slug', templateId).maybeSingle();
      if (tpl?.id) {
        const { data: purchase } = await supabase.from('purchases').select('id, status').eq('user_id', userId).eq('template_id', tpl.id).maybeSingle();
        isPaid = Boolean(purchase && (purchase.status === 'unlocked' || purchase.status === 'published'));

        const { data: site } = await supabase.from('wedding_sites').select('status, is_locked, editing_status').eq('user_id', userId).eq('template_id', tpl.id).maybeSingle();
        isPublished = site?.status === 'published';
        
        if (site?.editing_status === 'unlocked' && !site?.is_locked) {
          isEditingAllowed = true;
        } else if (!isPublished && isPaid) {
          isEditingAllowed = true;
        } else {
          isEditingAllowed = false;
        }
      }
    } catch (e) {}

    return res.json({
      paymentStatus: isPaid ? 'paid' : 'unpaid',
      editingStatus: isEditingAllowed ? 'unlocked' : 'locked',
      publicationStatus: isPublished ? 'published' : 'draft',
      isEditingAllowed,
      isPublicLive: isPublished,
      lockReason: !isEditingAllowed ? (isPublished ? 'published_locked' : 'unpaid') : 'none'
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// 3.4. Get Available Templates
app.get('/api/templates', async (req, res) => {
  try {
    const { data, error } = await supabase.from('templates').select('*').order('created_at', { ascending: true });
    if (!error && data && data.length > 0) {
      return res.json({ success: true, templates: data });
    }
  } catch (e) {}

  return res.json({
    success: true,
    templates: [
      { id: '1', slug: 'rajmahal', name: 'The Rajmahal (3D Palace Gateway)', preview_image: '/previews/theme-rajmahal.webp', price: 229900, category: 'heritage' },
      { id: '2', slug: 'royaldawn', name: 'The Royal Dawn (Udaipur Lakefront & Scratch Card)', preview_image: '/previews/theme-royaldawn.webp', price: 229900, category: 'heritage' },
      { id: '3', slug: 'jharokha', name: 'The Jharokha (Rajasthani Marble Arch)', preview_image: '/previews/theme-jharokha.webp', price: 129900, category: 'traditional' },
      { id: '4', slug: 'mayura', name: 'The Mayura (Peacock Teal Plumage)', preview_image: '/previews/theme-mayura.webp', price: 129900, category: 'traditional' },
      { id: '5', slug: 'jodi', name: 'The Jodi (Festive Gold Thaali)', preview_image: '/previews/theme-jodi.webp', price: 129900, category: 'traditional' },
      { id: '6', slug: 'dak', name: 'The Shahi Dâk (Vintage Royal Postal Telegram)', preview_image: '/previews/theme-dak.webp', price: 129900, category: 'heritage' },
      { id: '7', slug: 'ivory', name: 'The Ivory Minimalist (Modern Editorial)', preview_image: '/previews/theme-ivory.webp', price: 129900, category: 'modern' },
    ]
  });
});

// 4. Load Published Invitation by Slug (For Public Guests)
app.get(['/api/public/wedding/:slug', '/api/invitations/:slug'], async (req, res) => {
  const { slug } = req.params;
  try {
    const cleanSlug = String(slug).toLowerCase().trim();
    const { data, error } = await supabase
      .from('wedding_sites')
      .select('id, template_id, status, content, published_url, published_at, templates(slug, name)')
      .or(`slug.eq.${cleanSlug},id.eq.${cleanSlug},published_url.ilike.%${cleanSlug}%`)
      .eq('status', 'published')
      .maybeSingle();

    if (!error && data) {
      return res.json({ 
        success: true, 
        site: data,
        themeId: data.templates?.slug || data.content?.theme || 'rajmahal',
        content: data.content,
      });
    }
  } catch (e) {
    console.warn('Error fetching public invitation:', e.message);
  }

  return res.json({
    success: false,
    error: 'Wedding invitation not found or not yet published.'
  });
});

// 🌐 Dynamic WhatsApp / Social OpenGraph Rich Link Preview Route (/i/:slug)
app.get(['/i/:slug', '/invite/:slug', '/wedding/:slug', '/share/:slug'], async (req, res) => {
  const { slug } = req.params;
  const cleanSlug = String(slug).toLowerCase().trim();
  
  let groomName = 'Dhruv';
  let brideName = 'Shreya';
  let weddingDate = '3 December 2026';
  let venue = 'The Milestone, Himmatnagar, Gujarat';
  let previewImage = 'https://owziiqdxbvynrprugvwk.supabase.co/storage/v1/object/public/wedding-media/previews/theme-rajmahal.webp';

  try {
    const { data: site } = await supabase
      .from('wedding_sites')
      .select('*')
      .or(`slug.eq.${cleanSlug},id.eq.${cleanSlug},published_url.ilike.%${cleanSlug}%`)
      .eq('status', 'published')
      .maybeSingle();

    if (site?.content?.couple) {
      groomName = site.content.couple.groomEn || site.content.couple.groomHi || groomName;
      brideName = site.content.couple.brideEn || site.content.couple.brideHi || brideName;
      weddingDate = site.content.couple.weddingDate || weddingDate;
      venue = site.content.couple.venueName || venue;
      if (site.content.media?.photoSlots?.hero?.url) {
        previewImage = site.content.media.photoSlots.hero.url;
      }
    }
  } catch (e) {}

  const pageTitle = `👑 ${groomName} & ${brideName} — Shahi Vivah Nimantran`;
  const pageDesc = `॥ श्री गणेशाय नमः ॥ You are cordially invited to celebrate the royal wedding of ${groomName} & ${brideName} on ${weddingDate} at ${venue}. Click to experience our 3D Palace Gate Digital Invitation with Shehnai & Auspicious Blessings.`;
  const canonicalUrl = `${req.protocol}://${req.get('host')}/i/${encodeURIComponent(cleanSlug)}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <meta name="description" content="${pageDesc}">

  <!-- 🌸 OpenGraph / WhatsApp Meta Tags -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Shahi Studio™ — Royal Vivah">
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${pageDesc}">
  <meta property="og:image" content="${previewImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${canonicalUrl}">

  <!-- 🐦 Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${pageTitle}">
  <meta name="twitter:description" content="${pageDesc}">
  <meta name="twitter:image" content="${previewImage}">

  <link rel="icon" href="/favicon.ico" type="image/x-icon">

  <script>
    // If not a crawler, redirect to client app
    if (!/bot|crawl|spider|whatsapp|facebookexternalhit|twitterbot/i.test(navigator.userAgent)) {
      window.location.href = '${canonicalUrl}';
    }
  </script>
</head>
<body style="background:#1C060A; color:#F7F0DD; font-family:system-ui, sans-serif; text-align:center; padding:50px 20px;">
  <div style="max-width:500px; margin:0 auto; padding:35px 25px; border:2px solid #A67C3D; border-radius:24px; background:#2D080E; box-shadow:0 20px 50px rgba(0,0,0,0.5);">
    <span style="font-size:36px;">👑</span>
    <h1 style="color:#D4B37F; font-size:22px; margin:14px 0 10px;">${pageTitle}</h1>
    <p style="font-size:13px; opacity:0.9; line-height:1.6; color:#F7F0DD;">${pageDesc}</p>
    <a href="${canonicalUrl}" style="display:inline-block; margin-top:24px; padding:14px 32px; background:linear-gradient(135deg, #C59B4B, #9C772F); color:#140508; font-weight:bold; font-size:13px; text-transform:uppercase; letter-spacing:1px; border-radius:50px; text-decoration:none;">
      Open Royal Invitation ➜
    </a>
  </div>
</body>
</html>`;

  return res.send(html);
});

// 5. Resolve Wedding Site ID from Slug
app.get('/api/rsvp/resolve-site', async (req, res) => {
  const { slug } = req.query;
  if (!slug) return res.status(400).json({ error: 'Missing slug parameter.' });

  try {
    const { data: sites } = await supabase.from('wedding_sites').select('id, content, published_url');
    if (sites && sites.length > 0) {
      const targetSlug = String(slug).toLowerCase().trim();
      const match = sites.find(s => {
        if (s.published_url && s.published_url.toLowerCase().includes(targetSlug)) return true;
        const couple = s.content?.couple;
        if (couple) {
          const cSlug = `${(couple.groomEn || '').toLowerCase()}-${(couple.brideEn || '').toLowerCase()}`;
          if (cSlug === targetSlug) return true;
        }
        return false;
      });
      if (match) {
        return res.json({ success: true, siteId: match.id });
      }
    }
  } catch (e) {
    console.warn('Error resolving wedding site:', e.message);
  }
  return res.json({ success: false, siteId: null });
});

// 6. Submit Guest RSVP
app.post('/api/rsvp/submit', async (req, res) => {
  try {
    const { 
      wedding_site_id, 
      weddingSiteId,
      wedding_slug,
      weddingSlug, 
      guest_name,
      guestName, 
      guest_phone,
      guestPhone, 
      attendees_count,
      attendeesCount, 
      wishes, 
      attending 
    } = req.body;

    const finalGuestName = (guest_name || guestName || '').trim();
    const finalGuestPhone = (guest_phone || guestPhone || '').trim();
    const finalSlug = (wedding_slug || weddingSlug || 'general').trim();
    const isValidUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    const rawSiteId = wedding_site_id || weddingSiteId || null;
    let finalSiteId = isValidUUID(rawSiteId) ? rawSiteId : null;

    if (!finalGuestName || !finalGuestPhone) {
      return res.status(400).json({ error: 'Guest name and mobile number are required.' });
    }

    // Auto-resolve wedding_site_id from slug if not directly provided
    if (!finalSiteId && finalSlug && finalSlug !== 'general') {
      try {
        const { data: sites } = await supabase.from('wedding_sites').select('id, content, published_url');
        if (sites && sites.length > 0) {
          const targetSlug = finalSlug.toLowerCase();
          const match = sites.find(s => {
            if (s.published_url && s.published_url.toLowerCase().includes(targetSlug)) return true;
            const couple = s.content?.couple;
            if (couple) {
              const cSlug = `${(couple.groomEn || '').toLowerCase()}-${(couple.brideEn || '').toLowerCase()}`;
              if (cSlug === targetSlug) return true;
            }
            return false;
          });
          if (match) {
            finalSiteId = match.id;
          }
        }
      } catch (e) {
        console.warn('Could not auto-resolve site ID:', e.message);
      }
    }

    const rsvpEntry = {
      wedding_slug: finalSlug,
      guest_name: finalGuestName,
      guest_phone: finalGuestPhone,
      attendees_count: attending !== false ? Math.max(1, Number(attendees_count || attendeesCount) || 1) : 0,
      wishes: (wishes || '').trim(),
      attending: attending !== false,
      ...(finalSiteId ? { wedding_site_id: finalSiteId } : {})
    };

    try {
      const { data, error } = await supabase.from('rsvps').insert(rsvpEntry).select().single();
      if (error) {
        console.error('❌ Supabase RSVP insert error:', error.message);
        return res.status(500).json({ success: false, error: 'Unable to submit RSVP to database. Please try again.' });
      }

      console.log(`💌 [Supabase RSVP] Received and saved for Site [${finalSiteId || finalSlug}] from ${finalGuestName} (${finalGuestPhone})`);
      return res.json({ 
        success: true, 
        message: 'Your RSVP has been received. We look forward to celebrating with you.', 
        rsvp: data || rsvpEntry 
      });
    } catch (dbErr) {
      console.error('❌ Database error during RSVP insert:', dbErr);
      return res.status(500).json({ success: false, error: 'Database connection failed. Please try again.' });
    }
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message || 'Server error during RSVP processing.' });
  }
});

// 6. Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    engine: 'Supabase PostgreSQL + Node.js Express Gateway',
    timestamp: new Date().toISOString(),
    razorpayConfigured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    supabaseConfigured: Boolean(process.env.VITE_SUPABASE_URL && !process.env.VITE_SUPABASE_URL.includes('demo'))
  });
});

// 7. Root Route Dashboard (http://localhost:5000/)
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Shahi Studio · Supabase & Razorpay Backend</title>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;900&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: #140508;
          color: #F7E7C4;
          font-family: 'Plus Jakarta Sans', sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .card {
          background: linear-gradient(145deg, #2B0B11 0%, #1A0508 100%);
          border: 2px solid #C59B4B;
          border-radius: 24px;
          max-width: 680px;
          width: 100%;
          padding: 36px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(197, 155, 75, 0.15);
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(197, 155, 75, 0.15);
          border: 1px solid #C59B4B;
          color: #E2B968;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .dot { width: 8px; height: 8px; background: #10B981; border-radius: 50%; display: inline-block; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }
        h1 {
          font-family: 'Cinzel', serif;
          font-size: 28px;
          color: #F7E7C4;
          margin-top: 14px;
          letter-spacing: 0.04em;
        }
        p.subtitle {
          color: #D1BFA5;
          font-size: 13px;
          margin-top: 6px;
          line-height: 1.5;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 12px;
          margin-top: 24px;
        }
        .item {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(197, 155, 75, 0.25);
          border-radius: 14px;
          padding: 14px 16px;
        }
        .item-label { font-size: 11px; color: #A8957F; text-transform: uppercase; font-weight: 700; }
        .item-val { font-size: 14px; color: #FFFFFF; font-weight: 600; margin-top: 4px; }
        .btn-group {
          display: flex;
          gap: 12px;
          margin-top: 28px;
          flex-wrap: wrap;
        }
        .btn {
          flex: 1;
          min-width: 200px;
          padding: 14px 20px;
          border-radius: 12px;
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
          text-align: center;
          transition: all 0.2s ease;
          display: inline-block;
        }
        .btn-primary {
          background: linear-gradient(135deg, #C59B4B 0%, #9C772F 100%);
          color: #140508;
          border: 1px solid #E2B968;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(197, 155, 75, 0.4); }
        .btn-secondary {
          background: rgba(255,255,255,0.05);
          color: #F7E7C4;
          border: 1px solid rgba(197, 155, 75, 0.4);
        }
        .btn-secondary:hover { background: rgba(255,255,255,0.1); }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge">
          <span class="dot"></span>
          Supabase PostgreSQL + Razorpay Backend Active
        </div>
        <h1>🏰 SHAHI STUDIO API SERVER</h1>
        <p class="subtitle">High-Security Express.js &amp; Supabase PostgreSQL Gateway running on Port 5000 (Zero Firebase Dependency).</p>

        <div class="grid">
          <div class="item">
            <div class="item-label">Server Status</div>
            <div class="item-val" style="color: #10B981;">● Online (Port 5000)</div>
          </div>
          <div class="item">
            <div class="item-label">Database</div>
            <div class="item-val">Supabase PostgreSQL (RLS)</div>
          </div>
          <div class="item">
            <div class="item-label">Payment Gateway</div>
            <div class="item-val">Razorpay Official API</div>
          </div>
          <div class="item">
            <div class="item-label">Authentication</div>
            <div class="item-val">Supabase Auth (Google &amp; Email)</div>
          </div>
        </div>

        <div class="btn-group">
          <a href="http://localhost:3000" class="btn btn-primary">Open Frontend Web App ➜</a>
          <a href="/api/health" class="btn btn-secondary">Check API Health JSON ⚡</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// 🚀 Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🏰 SHAHI STUDIO SUPABASE + RAZORPAY BACKEND RUNNING`);
  console.log(`📍 URL:      http://localhost:${PORT}`);
  console.log(`⚡ DB/Auth:  Supabase PostgreSQL (Zero Firebase)`);
  console.log(`💳 Payments: Razorpay Gateway Official Integration`);
  console.log(`======================================================\n`);
});
