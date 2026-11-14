import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";

class ErroHttp extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface Tarefa {
  id: number;
  titulo: string;
  descricao: string | null;
  concluida: boolean;
  criadaEm: string;
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

const tarefas: Tarefa[] = [];
let proximoId = 1;

function buscarOufalhar(idParam: string): Tarefa {
  const id = Number(idParam);
  const tarefa = tarefas.find((t) => t.id === id);
  if (!tarefa) {
    throw new ErroHttp(404, "Tarefa não encontrada");
  }
  return tarefa;
}

app.get("/tarefas", (_req: Request, res: Response) => {
  res.json(tarefas);
});

app.post("/tarefas", (req: Request<{}, {}, CriarTarefaBody>, res: Response) => {
  const { titulo, descricao } = req.body ?? {};

  if (!titulo) {
    res.status(400).json({ erro: 'O campo "titulo" é obrigatório' });
    return;
  }

  const tarefa: Tarefa = {
    id: proximoId++,
    titulo,
    descricao: descricao ?? null,
    concluida: false,
    criadaEm: new Date().toISOString(),
  };

  tarefas.push(tarefa);
  res.status(201).json(tarefa);
});

app.get("/tarefas/:id", (req: Request<{ id: string }>, res: Response) => {
  res.json(buscarOufalhar(req.params.id));
});

app.patch(
  "/tarefas/:id",
  (req: Request<{ id: string }, {}, AtualizartarefaBody>, res: Response) => {
    const tarefa = buscarOufalhar(req.params.id);
    const { titulo, descricao, concluida } = req.body ?? {};

    if (titulo !== undefined) {
      if (!titulo)
        throw new ErroHttp(400, 'O campo "titulo" nao pode ficar vazio');
      tarefa.titulo = titulo;
    }

    if (descricao !== undefined) {
      tarefa.descricao = descricao;
    }

    if (concluida !== undefined) {
      tarefa.concluida = concluida;
    }

    res.json(tarefa);
  },
);

app.delete("/tarefas/:id", (req: Request<{ id: string }>, res: Response) => {
  const tarefa = buscarOufalhar(req.params.id);
  tarefas.splice(tarefas.indexOf(tarefa), 1);
  res.status(200).send();
});

app.use((req: Request, _res: Response, next: NextFunction) => {
  next(
    new ErroHttp(404, `Rota ${req.method} ${req.originalUrl} não encontrada`),
  );
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status ?? 500;
  if (status >= 500) {
    console.error(err);
  }
  res
    .status(status)
    .json({ erro: status >= 500 ? "Erro interno do servidor" : err.message });
});

export default app;
