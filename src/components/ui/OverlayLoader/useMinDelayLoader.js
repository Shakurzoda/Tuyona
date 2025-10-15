import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Управляет оверлеем так, чтобы:
 * - показывался минимум minMs
 * - НИКОГДА не зависал дольше maxMs (авто-снятие)
 */
export function useMinDelayLoader(minMs = 500, maxMs = 10000) {
  const [show, setShow] = useState(false);
  const startedAt = useRef(0);
  const tMin = useRef(null);
  const tMax = useRef(null);

  const clearAll = () => {
    if (tMin.current) clearTimeout(tMin.current);
    if (tMax.current) clearTimeout(tMax.current);
    tMin.current = tMax.current = null;
  };

  const start = useCallback(() => {
    clearAll();
    startedAt.current = Date.now();
    setShow(true);
    // хард-лимит: даже если промис «повис»
    tMax.current = setTimeout(() => setShow(false), maxMs);
  }, [maxMs]);

  const stop = useCallback(() => {
    const elapsed = Date.now() - startedAt.current;
    const left = Math.max(minMs - elapsed, 0);
    if (tMax.current) clearTimeout(tMax.current);
    if (tMin.current) clearTimeout(tMin.current);
    tMin.current = setTimeout(() => setShow(false), left);
  }, [minMs]);

  useEffect(() => clearAll, []);

  return [show, start, stop];
}
