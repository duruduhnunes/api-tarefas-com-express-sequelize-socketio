import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "sequelize";
import { sequelize } from "../db.js";

export class Tarefa extends Model<
  InferAttributes<Tarefa>,
  InferCreationAttributes<Tarefa>
> {
  declare id: CreationOptional<number>;
  declare titulo: string;
  declare descricao: CreationOptional<string | null>;
  declare concluida: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Tarefa.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    descricao: { type: DataTypes.TEXT, allowNull: true },
    concluida: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "tarefas" },
);
