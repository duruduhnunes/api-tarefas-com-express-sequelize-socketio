import { createServer } from "node:http";
import app from "./app.js";
import { sequelize } from "./db.js";
import "./models/tarefa.js";
import { Server } from "socket.io";
import { setIo } from "./realtime.js";

const PORT = Number(process.env.PORT ?? 3000);

await sequelize.authenticate();
await sequelize.sync();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*" },
});
setIo(io);

io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  socket.on("disconnect", (motivo) => {
    console.log("Cliente desconectado:", socket.id, "Motivo:", motivo);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
