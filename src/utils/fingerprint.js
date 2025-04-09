import FingerprintJS from "@fingerprintjs/fingerprintjs";

let fpInstance = null;

export const getFingerprint = async () => {
  if (!fpInstance) {
    fpInstance = FingerprintJS.load();
  }
  const fp = await fpInstance;
  const result = await fp.get();
  return result.visitorId;
};
