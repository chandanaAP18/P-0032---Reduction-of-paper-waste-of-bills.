export async function recognizeBillImage(file, onProgress) {
  const { recognize } = await import('tesseract.js');
  const result = await recognize(file, 'eng', {
    logger: (message) => {
      if (message.status === 'recognizing text') {
        onProgress?.(Math.round((message.progress || 0) * 100));
      }
    },
  });

  return result.data?.text || '';
}

export function parseVoiceBillingTranscript(transcript = '') {
  const normalized = transcript.trim();
  if (!normalized) return null;

  const direct = normalized.match(/for\s(.+?),\s(.+?),\s(\d+(?:\.\d+)?)\s(?:rupees|rs|inr)/i);
  if (direct) {
    return {
      customerName: direct[1].trim(),
      productName: direct[2].trim(),
      unitPrice: direct[3].trim(),
    };
  }

  const fallback = normalized.match(/customer\s(.+?)\sproduct\s(.+?)\samount\s(\d+(?:\.\d+)?)/i);
  if (fallback) {
    return {
      customerName: fallback[1].trim(),
      productName: fallback[2].trim(),
      unitPrice: fallback[3].trim(),
    };
  }

  return null;
}
