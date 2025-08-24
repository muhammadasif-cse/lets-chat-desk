export const playSound = (soundPath: string) => {
  try {
    const audio = new Audio(soundPath);
    audio.play().catch((error) => {
      console.warn("Audio playback failed:", error);
    });
  } catch (error) {
    console.error("Error playing sound:", error);
  }
};
