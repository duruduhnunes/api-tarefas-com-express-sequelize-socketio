import app from "./app.js";
import { sequelize } from "./db.js";
import "./models/tarefa.js";

const PORT = Number(process.env.PORT ?? 3000);

await sequelize.authenticate();
await sequelize.sync();

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
