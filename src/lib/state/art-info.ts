import { writable, get } from 'svelte/store';

export const name = writable('');
export const description = writable('');
export const audioSource = writable('https://www.idell.se/wp-content/uploads/2024/10/intro-18.28.48.mp3');
export const videoSource = writable('https://cfuk.nu/wp-content/uploads/2025/04/test.mp4');
export const videoIsPlaying = writable(false);

export const updateName = (newName) => {
  if (get(name) !== newName) {
    name.set(newName);
  }
};

export const updateDescription = (newDescription) => {
  if (get(description) !== newDescription) {
    description.set(newDescription);
  }
};

export const updateAudioSource = (newAudioSource) => {
  if (get(audioSource) !== newAudioSource) {
    audioSource.set(newAudioSource);
  }
};

export const updateVideoSource = (newVideoSource) => {
  if (get(videoSource) !== newVideoSource) {
    videoSource.set(newVideoSource);
  }
};

export const resetStores = () => {
  name.set('');
  description.set('');
  audioSource.set('');
  videoSource.set('');
  videoIsPlaying.set(false);
};