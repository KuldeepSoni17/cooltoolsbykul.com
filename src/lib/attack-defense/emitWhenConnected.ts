import { gameSocket } from "./socket";

export function emitWhenConnected<TAck = { ok?: boolean; roomId?: string; message?: string }>(
  event: string,
  payload: Record<string, string | boolean>,
  ack?: (response: TAck) => void,
  onConnecting?: () => void
) {
  const run = () => gameSocket.emit(event, payload, ack);
  if (gameSocket.connected) {
    run();
    return;
  }
  onConnecting?.();
  gameSocket.connect();
  gameSocket.once("connect", run);
}
