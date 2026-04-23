// ── CHANGE THIS after deploying your HF Space ────────────────────────────────
// Format: https://YOUR_HF_USERNAME-ekman-emotion-classifier.hf.space
const HF_SPACE_URL = 'https://melani7576-ekman-emotion-classifier.hf.space';
// ─────────────────────────────────────────────────────────────────────────────

const TIMEOUT_MS = 30000; // 30s — HF free tier can have cold-start delays

/**
 * Classify a text reflection into one of 7 Ekman emotions.
 * @param {string} text - Raw user input from the journal screen
 * @returns {Promise<{ emotion, label_id, confidence, all_scores }>}
 */
export async function analyzeEmotion(text) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${HF_SPACE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || `Server error ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. The server may be starting up — please try again.');
    }
    if (error.message.includes('Network request failed')) {
      throw new Error('No internet connection. Please check your network.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/** Quick health check — useful to pre-warm the Space on app launch */
export async function pingServer() {
  try {
    const res = await fetch(`${HF_SPACE_URL}/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}
