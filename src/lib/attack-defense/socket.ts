import { io } from "socket.io-client";

export const gameSocket = io(
  process.env.NEXT_PUBLIC_GAME_SERVER_URL ?? "https://attack-defense-v1-production.up.railway.app",
  { autoConnect: false }
);
