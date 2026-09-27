import { useEffect, useState } from 'react';
import { loadImageAsDataUrl } from '../utils/image';

interface Props {
  src: string | null | undefined;
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
  fallback?: React.ReactNode;
}

export default function SmartImage({ src, className, style, alt = '', fallback }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setDataUrl(null);
    setFailed(false);
    if (!src) return;
    let cancelled = false;
    loadImageAsDataUrl(src).then(result => {
      if (cancelled) return;
      if (result) setDataUrl(result);
      else setFailed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!src || failed || !dataUrl) return <>{fallback ?? null}</>;

  return <img src={dataUrl} className={className} style={style} alt={alt} />;
}
