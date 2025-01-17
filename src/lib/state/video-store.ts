import { writable } from 'svelte/store';

export const videoElement = writable<HTMLIFrameElement | null>(null);
export const videoSource = writable<string>('https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&controls=0&loop=1&playlist=dQw4w9WgXcQ&enablejsapi=1');