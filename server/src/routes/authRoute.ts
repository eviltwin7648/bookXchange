import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

export const authRoute = Router();

// Register
authRoute.post("/register", async (req: Request, res: Response) => {
  const { name, email, password, mobile, role } = req.body;
  if (!name || !email || !password || !mobile || !role) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ message: "User already exists" });
      return;
    }
    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password,
        mobile,
        role,
      },
    });
    res.status(201).json({ message: "User registered", user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
authRoute.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    res.status(200).json({ message: "Login successful", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});