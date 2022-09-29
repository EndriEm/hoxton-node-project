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
      include: { teachers: true, deget: true },
    });
    res.send(faculties);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.get("/faculties/:id", async (req, res) => {
  try {
    const faculty = await prisma.faculty.findUnique({
      where: { id: Number(req.params.id) },
      include: { teachers: true, deget: true },
    });

    if (faculty) {
      res.send(faculty);
    } else {
      res.status(404).send({ error: "User not found." });
    }
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

app.get("/comments", async (req, res) => {
  try {
    const comments = await prisma.user.findMany({});
    res.send(comments);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.post("/comments", async (req, res) => {
  try {
    const comment = await prisma.user.create({
      data: req.body,
    });
    res.send(comment);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.delete("/comments/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const comment = await prisma.user.delete({
      where: { id },
    });
    res.send(comment);
  } catch (error) {
    //@ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.listen(port);
