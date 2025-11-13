// src/admin/hooks/useIsMounted.js
import { useEffect, useRef, useCallback } from "react";

export function useIsMounted() {
    const ref = useRef(false);
    useEffect(() => {
        ref.current = true;
        return () => {
            ref.current = false;
        };
    }, []);
    return useCallback(() => ref.current, []);
}
