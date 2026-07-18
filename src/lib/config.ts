const backendUrl = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3001";

export const config = {
  backendUrl: backendUrl.replace(/\/$/, ""),
  stellarNetworkPassphrase:
    import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE ?? "Test SDF Network ; September 2015",
} as const;
