import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

export const bookRoute = Router();

// Add Book (Only Owner)
bookRoute.post("/", async function (req: Request, res: Response) {
  const { title, author, genre, location, contactInfo, ownerId } = req.body;

  if (!title || !author || !location || !contactInfo || !ownerId) {
      res.status(400).json({ message: "Missing fields" });
    return
  }

  try {
    const owner = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!owner || owner.role !== "OWNER") {
        res.status(403).json({ message: "Only Owners can add books" });
      return 
    }

    const newBook = await prisma.book.create({
      data: {
        title,
        author,
        genre,
        location,
        contactInfo,
        ownerId,
      },
    });

    res.status(201).json({ message: "Book listed successfully", book: newBook });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get All Books (with optional filters)
bookRoute.get("/", async function (req, res)  {
  const { title, location, genre } = req.query;

  try {
    const books = await prisma.book.findMany({
      where: {
        title: title ? { contains: String(title), mode: 'insensitive' } : undefined,
        location: location ? { contains: String(location), mode: 'insensitive' } : undefined,
        genre: genre ? { contains: String(genre), mode: 'insensitive' } : undefined,
      },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
            mobile: true,
          },
        },
      },
    });

    res.status(200).json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching books" });
  }
});

// Update Book Status
bookRoute.patch("/:id/status", async function (req, res)  {
  const { id } = req.params;
  const { status } = req.body;

  if (!["AVAILABLE", "RENTED", "EXCHANGED"].includes(status)) {
      res.status(400).json({ message: "Invalid status value" });
      return 
  }

  try {
    const updated = await prisma.book.update({
      where: { id },
      data: { status },
    });

    res.status(200).json({ message: "Book status updated", book: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating book status" });
  }
});

bookRoute.patch("/:id/claim", async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
  
    if (!userId) {
        res.status(400).json({ message: "User ID is required to claim a book" });
        return 
    }
  
    try {
      const book = await prisma.book.update({
        where: { id },
        data: {
          claimedBy: { connect: { id: userId } }
        }
      });
  
      res.status(200).json({ message: "Book claimed successfully", book });
    } catch (err) {
      console.error("Error claiming book", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  