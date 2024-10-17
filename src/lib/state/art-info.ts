// src/stores/mediaStore.js
import { writable } from 'svelte/store';

export const description = writable('');
export const audioSource = writable('https://www.idell.se/wp-content/uploads/2024/10/intro-18.28.48.mp3');

export const updateDescription = (newDescription) => {
  description.set(newDescription);
};

export const updateAudioSource = (newAudioSource) => {
  audioSource.set(newAudioSource);
};