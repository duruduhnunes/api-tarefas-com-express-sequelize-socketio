import { expect } from "chai";
import request from "supertest";
import app from "../src/app.js";
import { sequelize } from "../src/db.js";
import { Tarefa } from "../src/models/tarefa.js";

describe("API de tarefas", () => {
  before(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await Tarefa.destroy({ where: {} });
  });

  after(async () => {
    await sequelize.close();
  });

  describe("POST /tarefas", () => {
    it("cria uma tarefa e retorna 201", async () => {
      const res = await request(app)
        .post("/tarefas")
        .send({ titulo: "Escrever testes" });

      expect(res.status).to.equal(201);
      expect(res.body).to.include({
        titulo: "Escrever testes",
        concluida: false,
      });
      expect(res.body).to.have.property("id");
    });

    it("retorna 400 quando falta o título", async () => {
      const res = await request(app).post("/tarefas").send({});

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("erro");
      expect(res.body.detalhes).to.be.an("array").that.is.not.empty;
    });
  });

  describe("GET /tarefas", () => {
    it("lista as tarefas criadas", async () => {
      await Tarefa.create({ titulo: "A" });
      await Tarefa.create({ titulo: "B" });

      const res = await request(app).get("/tarefas");

      expect(res.status).to.equal(200);
      expect(res.body).to.have.lengthOf(2);
      expect(res.body.map((t: { titulo: string }) => t.titulo)).to.deep.equal([
        "A",
        "B",
      ]);
    });

    it("filtra por concluida", async () => {
      await Tarefa.create({ titulo: "Feita", concluida: true });
      await Tarefa.create({ titulo: "Pendente" });

      const res = await request(app)
        .get("/tarefas")
        .query({ concluida: "true" });

      expect(res.body).to.have.lengthOf(1);
      expect(res.body[0].titulo).to.equal("Feita");
    });
  });
  describe("GET /tarefas/:id", () => {
    it("retorna a tarefa quando existe", async () => {
      const tarefa = await Tarefa.create({
        titulo: "Tarefa 1",
        concluida: false,
      });
      const res = await request(app).get(`/tarefas/${tarefa.id}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.include({ titulo: "Tarefa 1", concluida: false });
    });

    it("retorna 404 quando a tarefa não existe", async () => {
      const res = await request(app).get(`/tarefas/999`);
      expect(res.status).to.equal(404);
      expect(res.body).to.have.property("erro");
    });
  });

  describe("PATCH /tarefas/:id", () => {
    it("atualiza só os campos enviados", async () => {
      const tarefa = await Tarefa.create({
        titulo: "Tarefa a ser atualizada",
        descricao: "descrição original",
      });

      const res = await request(app)
        .patch(`/tarefas/${tarefa.id}`)
        .send({ concluida: true });

      expect(res.status).to.equal(200);
      expect(res.body).to.include({
        concluida: true,
        titulo: "Tarefa a ser atualizada",
        descricao: "descrição original",
      });
    });
  });

  describe("DELETE /tarefas/:id", () => {
    it("apaga a tarefa e retorna 200", async () => {
      const tarefa = await Tarefa.create({ titulo: "Tarefa 1" });

      const res = await request(app).delete(`/tarefas/${tarefa.id}`);

      expect(res.status).to.equal(200);
      expect(await Tarefa.findByPk(tarefa.id)).to.be.null;
    });
  });
});
