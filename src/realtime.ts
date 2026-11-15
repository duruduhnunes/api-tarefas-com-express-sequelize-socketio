import type { Server } from "socket.io";

let io: Server | null = null;

export function setIo(server: Server) {
  io = server;
}

export function emitir(evento: string, dados: unknown) {
  io?.emit(evento, dados);
}
