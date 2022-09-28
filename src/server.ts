import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
app.use(cors());
app.use(express.json());
const prisma = new PrismaClient();

const port = 2222;

app.get("/faculties", async (req, res) => {
  try {
    const faculties = await prisma.faculty.findMany({
      include: { teachers: true },
    });
    res.send(faculties);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.get("/teachers", async (req, res) => {
  try {
    const teachers = await prisma.teacher.findMany({
      include: { Faculty: true },
    });
    res.send(teachers);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.post("/techers", async (req, res) => {
  try {
    const teacher = await prisma.teacher.create({
      data: req.body,
      include: { Faculty: true },
    });
    res.send(teacher);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.delete("/teachers/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const teacher = await prisma.teacher.delete({
      where: { id },
    });
    res.send(teacher);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.listen(port);
