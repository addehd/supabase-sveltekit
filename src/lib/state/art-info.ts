import { writable } from 'svelte/store';

export const name = writable('');
export const description = writable('');
export const audioSource = writable('https://www.idell.se/wp-content/uploads/2024/10/intro-18.28.48.mp3');
export const videoSource = writable('/test.mp4');
export const videoIsPlaying = writable(false);

export const updateName = (newName) => {
  let currentName;
  name.subscribe(value => currentName = value)();
  if (currentName !== newName) {
    name.set(newName);
  }
};

export const updateDescription = (newDescription) => {
  let currentDescription;
  description.subscribe(value => currentDescription = value)();
  if (currentDescription !== newDescription) {
    description.set(newDescription);
  }
};

export const updateAudioSource = (newAudioSource) => {
  let currentAudioSource;
  audioSource.subscribe(value => currentAudioSource = value)();
  if (currentAudioSource !== newAudioSource) {
    audioSource.set(newAudioSource);
  }
};