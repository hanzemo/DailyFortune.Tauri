import { fetch as tauriFetch } from '@tauri-apps/plugin-http';

const cache = new Map<string, string>();

export async function loadImageAsDataUrl(url: string): Promise<string | null> {
  if (!url) return null;
  if (cache.has(url)) return cache.get(url)!;
  try {
    const r = await tauriFetch(url);
    if (!r.ok) return null;
    const blob = await r.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    cache.set(url, dataUrl);
    return dataUrl;
  } catch (e) {
    console.warn('loadImageAsDataUrl failed:', url, e);
    return null;
  }
}
