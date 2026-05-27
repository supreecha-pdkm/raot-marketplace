import type { RegistrationDoc } from '@/features/approvals/services/approval-data';
import {
  DOC_DEFS,
  ACCEPTED_MIME_TYPES,
  ACCEPTED_EXTENSIONS,
} from '../constants/register';

/** Read a File as a base64 data URL — unchanged passthrough (for PDFs / non-images). */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Convert a file to a (possibly compressed) data URL.
 *
 * For images: downscale to ≤1600px on the longest side and re-encode as JPEG
 * at 0.8 quality. A 10MB phone photo typically lands around ~200-400 KB after
 * this pass, which keeps the entire localStorage payload well under the
 * ~5 MB browser quota.
 *
 * For PDFs (or anything not an image): pass through untouched.
 *
 * Returns the effective mimeType too, since compression converts PNG → JPEG.
 */
export async function fileToCompressedDataUrl(
  file: File,
): Promise<{ dataUrl: string; mimeType: string }> {
  const fallbackMime = file.type || 'application/octet-stream';
  if (!file.type.startsWith('image/')) {
    return { dataUrl: await readFileAsDataUrl(file), mimeType: fallbackMime };
  }
  try {
    const originalDataUrl = await readFileAsDataUrl(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('image load failed'));
      el.src = originalDataUrl;
    });
    const MAX_DIM = 1600;
    const longest = Math.max(img.naturalWidth, img.naturalHeight);
    const scale = longest > MAX_DIM ? MAX_DIM / longest : 1;
    const targetW = Math.max(1, Math.round(img.naturalWidth * scale));
    const targetH = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { dataUrl: originalDataUrl, mimeType: fallbackMime };
    ctx.drawImage(img, 0, 0, targetW, targetH);
    const compressed = canvas.toDataURL('image/jpeg', 0.8);
    return compressed.length < originalDataUrl.length
      ? { dataUrl: compressed, mimeType: 'image/jpeg' }
      : { dataUrl: originalDataUrl, mimeType: fallbackMime };
  } catch {
    return { dataUrl: await readFileAsDataUrl(file), mimeType: fallbackMime };
  }
}

export async function buildDocsFromForm(
  values: Record<string, unknown>,
): Promise<RegistrationDoc[]> {
  const docs: RegistrationDoc[] = [];
  const now = Date.now();
  for (let i = 0; i < DOC_DEFS.length; i++) {
    const def = DOC_DEFS[i];
    const list = values[def.key];
    if (!Array.isArray(list) || list.length === 0) continue;
    const first = list[0] as { originFileObj?: File; name?: string; type?: string };
    const file = first.originFileObj;
    if (!(file instanceof File)) continue;
    const { dataUrl, mimeType } = await fileToCompressedDataUrl(file);
    docs.push({
      id: `D-${now}-${i}`,
      type: def.type,
      label: def.label,
      filename: file.name,
      uploadedAt: new Date().toISOString(),
      status: 'pending',
      dataUrl,
      mimeType: mimeType || first.type,
    });
  }
  return docs;
}

export function isAcceptedFile(file: File): boolean {
  if (ACCEPTED_MIME_TYPES.includes(file.type)) return true;
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}
