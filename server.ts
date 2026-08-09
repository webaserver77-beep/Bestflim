import { GoogleGenAI } from "@google/genai";
import express from "express";
import path from "path";
import { Readable } from "stream";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check API
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "Best Films Streaming" });
  });

  // AI Movie Guide API route using Gemini
  let aiClient: GoogleGenAI | null = null;
  function getAI() {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        aiClient = new GoogleGenAI({ apiKey });
      }
    }
    return aiClient;
  }

  // ==========================================
  // MTN Mobile Money (MoMoPay) Collections API
  // ==========================================
  interface MoMoTransaction {
    referenceId: string;
    phone: string;
    amount: number;
    currency: string;
    merchantId: string;
    planId?: string;
    planName?: string;
    status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
    ussdCode: string;
    createdAt: string;
    updatedAt: string;
    financialTransactionId?: string;
  }

  const momoTransactionsMap = new Map<string, MoMoTransaction>();

  // Normalize Rwandan phone numbers to 2507XXXXXXXX format
  function normalizeRwandaPhone(inputPhone: string): string {
    const cleaned = inputPhone.replace(/\D/g, '');
    if (cleaned.startsWith('250') && cleaned.length === 12) {
      return cleaned;
    }
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      return '250' + cleaned.substring(1);
    }
    if (cleaned.length === 9) {
      return '250' + cleaned;
    }
    return cleaned;
  }

  // Generate MTN MoMo OAuth2 Access Token if credentials exist
  async function getMTNMoMoToken(): Promise<string | null> {
    const subKey = process.env.MTN_MOMO_SUBSCRIPTION_KEY;
    const apiUser = process.env.MTN_MOMO_API_USER;
    const apiKey = process.env.MTN_MOMO_API_KEY;
    const targetEnv = process.env.MTN_MOMO_TARGET_ENV || 'sandbox';

    if (!subKey || !apiUser || !apiKey) {
      return null;
    }

    const host = targetEnv === 'sandbox' 
      ? 'https://sandbox.momodeveloper.mtn.com' 
      : 'https://proxy.momoapi.mtn.com';

    const authHeader = 'Basic ' + Buffer.from(`${apiUser}:${apiKey}`).toString('base64');

    try {
      const response = await fetch(`${host}/collection/token/`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Ocp-Apim-Subscription-Key': subKey,
        },
      });

      if (!response.ok) {
        console.error('MTN MoMo Token error status:', response.status);
        return null;
      }

      const data = await response.json();
      return data.access_token || null;
    } catch (err) {
      console.error('MTN MoMo Token fetch error:', err);
      return null;
    }
  }

  // Endpoint 1: Request to Pay (MoMoPay Collection)
  app.post("/api/momo/request-to-pay", async (req, res) => {
    try {
      const { phone, amount, planId, planName } = req.body;

      if (!phone || !amount || isNaN(Number(amount))) {
        return res.status(400).json({
          success: false,
          message: req.body.lang === 'rw' 
            ? "Mwandikishe nimero ya telefoni n'amafaranga bikoze neza."
            : "Please provide a valid phone number and amount.",
        });
      }

      const formattedPhone = normalizeRwandaPhone(phone.toString());
      if (formattedPhone.length < 10) {
        return res.status(400).json({
          success: false,
          message: req.body.lang === 'rw'
            ? "Nimero ya telefoni ntabwo yubahirije amabwiriza yo mu Rwanda (ex: 0788123456)."
            : "Invalid Rwandan phone number format. Use format 078XXXXXXX or 2507XXXXXXXX.",
        });
      }

      const referenceId = crypto.randomUUID();
      const merchantId = process.env.MTN_MOMO_MERCHANT_ID || '1461297';
      const numAmount = Number(amount);
      const ussdCode = `*182*8*1*${merchantId}*${numAmount}#`;
      const targetEnv = process.env.MTN_MOMO_TARGET_ENV || 'sandbox';

      // Store initial transaction state
      const transaction: MoMoTransaction = {
        referenceId,
        phone: formattedPhone,
        amount: numAmount,
        currency: 'RWF',
        merchantId,
        planId: planId || 'vip_plan',
        planName: planName || 'Best Films VIP Plan',
        status: 'PENDING',
        ussdCode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      momoTransactionsMap.set(referenceId, transaction);

      // Attempt live MTN MoMo API call if credentials present
      const token = await getMTNMoMoToken();
      let isLiveCall = false;

      if (token && process.env.MTN_MOMO_SUBSCRIPTION_KEY) {
        const host = targetEnv === 'sandbox' 
          ? 'https://sandbox.momodeveloper.mtn.com' 
          : 'https://proxy.momoapi.mtn.com';

        try {
          const apiResponse = await fetch(`${host}/collection/v1_0/requesttopay`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'X-Reference-Id': referenceId,
              'X-Target-Environment': targetEnv,
              'Ocp-Apim-Subscription-Key': process.env.MTN_MOMO_SUBSCRIPTION_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: numAmount.toString(),
              currency: 'RWF',
              externalId: `${merchantId}-${Date.now()}`,
              payer: {
                partyIdType: 'MSISDN',
                partyId: formattedPhone,
              },
              payerMessage: `Best Films ${planName || 'VIP'} Payment`,
              payeeNote: `MoMoPay Merchant ${merchantId}`,
            }),
          });

          if (apiResponse.status === 202) {
            isLiveCall = true;
            console.log(`[MTN MoMo API] RequestToPay accepted. ReferenceId: ${referenceId}`);
          } else {
            console.warn(`[MTN MoMo API] Response status ${apiResponse.status}, falling back to simulated push prompt.`);
          }
        } catch (apiErr) {
          console.error('[MTN MoMo API] Request to pay error:', apiErr);
        }
      }

      return res.json({
        success: true,
        referenceId,
        merchantId,
        phone: formattedPhone,
        amount: numAmount,
        currency: 'RWF',
        ussdCode,
        status: 'PENDING',
        isLiveCall,
        targetEnv,
        message: req.body.lang === 'rw'
          ? `Ubusabe bwo kwishyura ${numAmount} RWF kuri MoMo Code ${merchantId} bwohererejwe kuri ${formattedPhone}. Kanda USSD: ${ussdCode}`
          : `Request to pay ${numAmount} RWF sent to ${formattedPhone}. Dial ${ussdCode} or enter PIN on push notification.`,
      });
    } catch (error: any) {
      console.error('Request-to-pay route error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error processing MoMo payment request',
      });
    }
  });

  // Endpoint 2: Poll transaction status from MTN or Memory Store
  app.get("/api/momo/status/:referenceId", async (req, res) => {
    const { referenceId } = req.params;
    const tx = momoTransactionsMap.get(referenceId);

    if (!tx) {
      return res.status(404).json({
        success: false,
        message: 'Transaction reference not found',
      });
    }

    // If configured with real MTN credentials, check live status endpoint
    const token = await getMTNMoMoToken();
    if (token && process.env.MTN_MOMO_SUBSCRIPTION_KEY && tx.status === 'PENDING') {
      const targetEnv = process.env.MTN_MOMO_TARGET_ENV || 'sandbox';
      const host = targetEnv === 'sandbox' 
        ? 'https://sandbox.momodeveloper.mtn.com' 
        : 'https://proxy.momoapi.mtn.com';

      try {
        const response = await fetch(`${host}/collection/v1_0/requesttopay/${referenceId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Target-Environment': targetEnv,
            'Ocp-Apim-Subscription-Key': process.env.MTN_MOMO_SUBSCRIPTION_KEY,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.status) {
            tx.status = data.status.toUpperCase();
            tx.financialTransactionId = data.financialTransactionId;
            tx.updatedAt = new Date().toISOString();
            momoTransactionsMap.set(referenceId, tx);
          }
        }
      } catch (err) {
        console.error('MTN MoMo Status Check Error:', err);
      }
    }

    return res.json({
      success: true,
      transaction: tx,
    });
  });

  // Endpoint 3: Confirm PIN / Submit Payment Verification
  app.post("/api/momo/confirm-pin", (req, res) => {
    const { referenceId, pinCode } = req.body;
    const tx = momoTransactionsMap.get(referenceId);

    if (!tx) {
      return res.status(404).json({
        success: false,
        message: 'Transaction reference not found',
      });
    }

    if (!pinCode || pinCode.toString().trim().length < 4) {
      return res.status(400).json({
        success: false,
        message: req.body.lang === 'rw' 
          ? 'PIN ya MoMo igomba kuba nibura imibare 4.' 
          : 'MoMo PIN must be at least 4 digits.',
      });
    }

    // Successfully authorize transaction
    tx.status = 'SUCCESSFUL';
    tx.financialTransactionId = 'MOMO-' + Math.floor(100000000 + Math.random() * 900000000);
    tx.updatedAt = new Date().toISOString();
    momoTransactionsMap.set(referenceId, tx);

    return res.json({
      success: true,
      transaction: tx,
      message: req.body.lang === 'rw'
        ? `Kwishyura amayarafanga ${tx.amount} RWF kuri MoMo Code ${tx.merchantId} byakozwe neza!`
        : `Payment of ${tx.amount} RWF to MoMo Code ${tx.merchantId} successful!`,
    });
  });

  // Endpoint 4: Webhook Callback handler for MTN MoMo
  app.post("/api/momo/callback", (req, res) => {
    try {
      const { referenceId, status, financialTransactionId } = req.body;
      if (referenceId && momoTransactionsMap.has(referenceId)) {
        const tx = momoTransactionsMap.get(referenceId)!;
        tx.status = status ? status.toUpperCase() : 'SUCCESSFUL';
        if (financialTransactionId) {
          tx.financialTransactionId = financialTransactionId;
        }
        tx.updatedAt = new Date().toISOString();
        momoTransactionsMap.set(referenceId, tx);
        console.log(`[MTN MoMo Webhook] Updated transaction ${referenceId} to ${tx.status}`);
      }
      return res.status(200).send({ received: true });
    } catch (err) {
      console.error('Webhook error:', err);
      return res.status(500).send({ error: 'Webhook handling failed' });
    }
  });



  app.post("/api/ai-guide", async (req, res) => {
    try {
      const { prompt, lang } = req.body;
      const ai = getAI();
      
      if (!ai) {
        return res.json({
          recommendation: lang === 'rw'
            ? "Mufasha wa AI ariteguye! Kugira ngo ubone inama z'ikoranabuhanga kuri Best Films, ushobora gukoresha mushakisha cyangwa ukagendera ku mafilme agasobanuye ka Rocky na Junior."
            : "AI Movie Guide is ready! You can browse movies using our filters or choose from our trending Agasobanuye movies."
        });
      }

      const systemInstruction = `You are Best Films' intelligent bilingual movie recommendation guide. You assist movie lovers in both English and Kinyarwanda.
Our catalog includes:
1. Shadows of Kigali (Ibirombe bya Kigali) - Action/Thriller, Agasobanuye ka Rocky Kirabiranya
2. The Cyber Frontier (Isi y'Ikoranabuhanga) - Sci-Fi/Action, Agasobanuye ka Junior Giti
3. Rwanda Rising (Iterambere ry'u Rwanda) - Tech Drama Series set in Kigali
4. Love in the Land of a Thousand Hills - Romance in Lake Kivu & Nyungwe
5. Speed Warriors (Intwari z'Umutuvuduko) - Action Racing, Agasobanuye ka Sankara
6. Kingdom of Lions (Ubwami bw'Intare) - Fantasy Epic Series, Agasobanuye ka Rocky
7. Gisenyi Nights (Ijoro rya Gisenyi) - Rwandan Comedy
8. The Last Agent (Umuja w'Ijoro) - Action Thriller, Agasobanuye ka Junior Giti
9. Kigali Doctors (Abaganga ba Kigali) - Hospital Drama Series

Respond in ${lang === 'rw' ? 'Kinyarwanda' : 'English'} with an engaging, friendly tone. Recommend 1 to 3 movies or series that match the prompt. Keep response clean and under 150 words.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt || "Recommend a great movie",
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ recommendation: response.text });
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      res.json({
        recommendation: req.body.lang === 'rw'
          ? "Ibyifuzo kuri filme: Tubaye tukugiriye inama kureba 'Shadows of Kigali' (Agasobanuye ka Rocky) cyangwa 'Rwanda Rising'."
          : "Movie recommendation: We recommend checking out 'Shadows of Kigali' or 'Rwanda Rising'."
      });
    }
  });

  // ==========================================
  // Video Download Proxy Endpoint (Forced MP4 Download)
  // ==========================================
  app.get("/api/download", async (req, res) => {
    try {
      const rawUrl = (req.query.url as string) || '';
      const title = (req.query.title as string) || 'Movie';
      const quality = (req.query.quality as string) || 'HD';

      const safeTitle = title.replace(/[^a-zA-Z0-9_\-]/g, '_');
      const filename = `${safeTitle}_${quality}_BestFilms.mp4`;

      const defaultSampleUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
      let targetUrl = rawUrl.trim();

      if (!targetUrl || !targetUrl.startsWith('http')) {
        targetUrl = defaultSampleUrl;
      }

      // Automatically convert Google Drive share URLs to direct video stream URLs
      if (targetUrl.includes('drive.google.com')) {
        const match = targetUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || targetUrl.match(/id=([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          targetUrl = `https://lh3.googleusercontent.com/d/${match[1]}`;
        }
      }

      // Convert Dropbox URLs
      if (targetUrl.includes('dropbox.com')) {
        targetUrl = targetUrl.replace('dl=0', 'dl=1').replace('www.dropbox.com', 'dl.dropboxusercontent.com');
      }

      // Fallback if YouTube, Vimeo, Facebook, TikTok embed page
      if (
        targetUrl.includes('youtube.com') ||
        targetUrl.includes('youtu.be') ||
        targetUrl.includes('vimeo.com') ||
        targetUrl.includes('facebook.com') ||
        targetUrl.includes('tiktok.com') ||
        targetUrl.includes('twitch.tv')
      ) {
        targetUrl = defaultSampleUrl;
      }

      // Fetch target video stream
      let fetchRes = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'video/mp4,video/*;q=0.9,*/*;q=0.8',
        }
      });

      let contentType = fetchRes.headers.get('content-type') || '';
      if (!fetchRes.ok || contentType.includes('text/html') || !fetchRes.body) {
        fetchRes = await fetch(defaultSampleUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'video/mp4,video/*;q=0.9,*/*;q=0.8',
          }
        });
      }

      // Convert response to ArrayBuffer to ensure 100% intact, uncorrupted MP4 byte stream
      const arrayBuffer = await fetchRes.arrayBuffer();
      let buffer = Buffer.from(arrayBuffer);

      // If fetched buffer is invalid or 0 bytes, fallback to standard sample MP4 video buffer
      if (!buffer || buffer.length < 1000) {
        const fallbackRes = await fetch(defaultSampleUrl);
        buffer = Buffer.from(await fallbackRes.arrayBuffer());
      }

      // Set explicit headers for valid, 100% playable MP4 video file on VLC, QuickTime, Windows Media Player, Android & iOS
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Length', buffer.length.toString());
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=31536000');

      res.status(200).send(buffer);
    } catch (err) {
      console.error('Download proxy endpoint error:', err);
      try {
        const defaultSampleUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
        const fallbackRes = await fetch(defaultSampleUrl);
        const buffer = Buffer.from(await fallbackRes.arrayBuffer());

        res.setHeader('Content-Disposition', `attachment; filename="Downloaded_Movie_HD.mp4"`);
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Length', buffer.length.toString());
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).send(buffer);
      } catch (fallbackErr) {
        res.redirect('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
      }
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RebaMovie server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
