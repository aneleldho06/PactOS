import { getNetwork, requestAccess, signMessage } from "@stellar/freighter-api";
import { api, type AuthSession } from "./api";
import { config } from "./config";

function errorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) return String(error.message);
  return "The wallet request could not be completed.";
}

function signatureToBase64(signature: string | { toString(encoding: string): string }) {
  return typeof signature === "string" ? signature : signature.toString("base64");
}

export async function authenticateWithFreighter(signal?: AbortSignal): Promise<AuthSession> {
  const access = await requestAccess();
  if (access.error || !access.address) throw new Error(errorMessage(access.error));

  const network = await getNetwork();
  if (network.error || network.networkPassphrase !== config.stellarNetworkPassphrase) {
    throw new Error("Switch Freighter to Stellar Testnet before signing in.");
  }

  const challenge = await api.auth.challenge(access.address, signal);
  const signed = await signMessage(challenge.message, {
    address: access.address,
    networkPassphrase: config.stellarNetworkPassphrase,
  });
  if (signed.error || !signed.signedMessage) throw new Error(errorMessage(signed.error));
  if (signed.signerAddress !== access.address)
    throw new Error("Freighter signed with a different wallet address.");

  return api.auth.verify(
    {
      walletAddress: access.address,
      nonce: challenge.nonce,
      signature: signatureToBase64(signed.signedMessage),
    },
    signal,
  );
}
