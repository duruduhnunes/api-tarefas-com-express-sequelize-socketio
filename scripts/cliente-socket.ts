import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Conectado ao servidor Socket.IO:", socket.id);
});

socket.on("tarefa:criada", (tarefa) => {
  console.log("Nova tarefa criada:", tarefa);
});

socket.on("tarefa:atualizada", (tarefa) => {
  console.log("Tarefa atualizada:", tarefa);
});

socket.on("tarefa:removida", (dados) => {
  console.log("Tarefa removida:", dados);
});

socket.on("disconnect", (motivo) => {
  console.log("Desconectado do servidor Socket.IO. Motivo:", motivo);
});
