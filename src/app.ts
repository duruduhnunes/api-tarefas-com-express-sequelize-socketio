import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { Tarefa } from "./models/tarefa.js";
import { Op, ValidationError } from "sequelize";

class ErroHttp extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type CriarTarefaBody = { titulo?: string; descricao?: string };

type AtualizartarefaBody = {
  titulo?: string;
  descricao?: string | null;
  concluida?: boolean;
};

const app = express();

app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  const inicio = Date.now();
  res.on("finish", () => {
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${Date.now() - inicio}ms`,
    );
  });
  next();
});

async function buscarOufalhar(idParam: string): Promise<Tarefa> {
  const tarefa = await Tarefa.findByPk(Number(idParam));
  if (!tarefa) {
    throw new ErroHttp(404, "Tarefa não encontrada");
  }
  return tarefa;
}

app.get("/tarefas", async (req: Request, res: Response) => {
  const { concluida, busca } = req.query;

  const tarefas = await Tarefa.findAll({
    where: {
      ...(concluida === "true" || concluida === "false"
        ? { concluida: concluida === "true" }
        : {}),
      ...(typeof busca === "string" && busca
        ? { titulo: { [Op.like]: `%${busca}%` } }
        : {}),
    },
    order: [["id", "ASC"]],
  });
  res.json(tarefas);
});

app.post(
  "/tarefas",
  async (req: Request<{}, {}, CriarTarefaBody>, res: Response) => {
    const { titulo, descricao } = req.body ?? {};
    const tarefa = await Tarefa.create({ titulo: titulo as string, descricao });
    res.status(201).json(tarefa);
  },
);

app.get("/tarefas/:id", async (req: Request<{ id: string }>, res: Response) => {
  res.json(await buscarOufalhar(req.params.id));
});

app.patch(
  "/tarefas/:id",
  async (
    req: Request<{ id: string }, {}, AtualizartarefaBody>,
    res: Response,
  ) => {
    const tarefa = await buscarOufalhar(req.params.id);
    await tarefa.update(req.body ?? {}, {
      fields: ["titulo", "descricao", "concluida"],
    });
    res.json(tarefa);
  },
);

app.delete(
  "/tarefas/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    const tarefa = await buscarOufalhar(req.params.id);
    await tarefa.destroy();
    res.status(200).send();
  },
);

app.use((req: Request, _res: Response, next: NextFunction) => {
  next(
    new ErroHttp(404, `Rota ${req.method} ${req.originalUrl} não encontrada`),
  );
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ValidationError) {
    res.status(400).json({
      erro: "Dados invalidos",
      detalhes: err.errors.map((e) => e.message),
    });
    return;
  }

  const status = err.status ?? 500;
  if (status >= 500) {
    console.error(err);
  }
  res
    .status(status)
    .json({ erro: status >= 500 ? "Erro interno do servidor" : err.message });
});

export default app;
