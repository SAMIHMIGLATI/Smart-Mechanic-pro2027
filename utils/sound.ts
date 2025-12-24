
// Sound Engine disabled as per user request
class SoundEngine {
  init() {}
  toggleMute() { return true; }
  playMetalImpact() {}
  playRatchet() {}
  playHydraulic() {}
  playHover() {}
  playClick() {}
  playSuccess() {}
  playError() {}
  playScan() {}
  playBoot() {}
}

export const soundEngine = new SoundEngine();
