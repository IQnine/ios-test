import { useRef } from "react";

const BOUNCE_RATE = 10000;

export const useDebounce = () => {
    const busy = useRef(false);

    const debounce = async (callback: Function) => {
        setTimeout(() => {
            busy.current = false;
        }, BOUNCE_RATE);

        if (!busy.current) {
            busy.current = true;
            callback();
        }
    };

    return { debounce };
};