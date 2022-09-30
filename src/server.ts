import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.options("*", cors());
app.use(express.json());
const prisma = new PrismaClient();

const port = 2222;

const SECRET = process.env.SECRET!;

function getToken(id: number) {
  return jwt.sign({ id: id }, SECRET, {
    expiresIn: "10 minutes",
  });
}

async function getCurrentUser(token: string) {
  const decryptedInfo = jwt.verify(token, SECRET);
  const user = await prisma.user.findUnique({
    // @ts-ignore
    where: { id: decryptedInfo.id },
  });
  return user;
}

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

app.post("/sign-up", async (req, res) => {
  try {
    const match = await prisma.user.findUnique({
      where: { email: req.body.email },
    });

    if (match) {
      res.status(400).send({ error: "This account already exists." });
    } else {
      const user = await prisma.user.create({
        data: {
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password),
        },
      });

      res.send({ user: user, token: getToken(user.id) });
    }
  } catch (error) {
    // @ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.post("/sign-in", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { email: req.body.email },
  });
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    res.send({ user: user, token: getToken(user.id) });
  } else {
    res.status(400).send({ error: "Invalid email/password combination." });
  }
});

app.get("/validate", async (req, res) => {
  try {
    if (req.headers.authorization) {
      const user = await getCurrentUser(req.headers.authorization);
      // @ts-ignore
      res.send({ user, token: getToken(user.id) });
    }
  } catch (error) {
    // @ts-ignore
    res.status(400).send({ error: error.message });
  }
});

app.listen(port);
