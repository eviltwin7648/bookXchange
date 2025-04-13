import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

export const bookRoute = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!') as any);
    }
  }
});

// Handle image uploads
bookRoute.post("/upload", upload.single('image'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: "No file uploaded" });
    return 
  }

  // Return the file path that can be accessed from the client
  const imageUrl = `/uploads/${req.file.filename}`;
  res.status(201).json({ imageUrl });
});

// Add Book (Only Owner)
bookRoute.post("/", async function (req: Request, res: Response) {
  const { title, author, genre, location, contactInfo, ownerId, coverImage } = req.body;

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
        coverImage,
      },
    });

    res.status(201).json({ message: "Book listed successfully", book: newBook });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Book by ID
bookRoute.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
          },
        },
        claimedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!book) {
      res.status(404).json({ message: "Book not found" });
      return 
    }

    res.status(200).json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching book" });
  }
});

// Get All Books (with optional filters)
bookRoute.get("/", async function (req, res) {
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
            id: true,
            name: true,
            email: true,
            mobile: true,
          },
        },
        claimedBy: {
          select: {
            id: true,
            name: true,
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

// Get Books by Owner ID
bookRoute.get("/owner/:ownerId", async (req, res) => {
  const { ownerId } = req.params;

  try {
    const books = await prisma.book.findMany({
      where: { ownerId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
          },
        },
        claimedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(200).json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching owner's books" });
  }
});

// Get Books claimed by a specific user
bookRoute.get("/claimed/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const books = await prisma.book.findMany({
      where: { claimedById: userId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
          },
        },
        claimedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(200).json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching claimed books" });
  }
});

// Update Book
bookRoute.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, author, genre, location, contactInfo, coverImage } = req.body;

  try {
    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) {
      res.status(404).json({ message: "Book not found" });
      return 
    }

    const updated = await prisma.book.update({
      where: { id },
      data: {
        title,
        author,
        genre,
        location,
        contactInfo,
        coverImage,
      },
    });

    res.status(200).json({ message: "Book updated successfully", book: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating book" });
  }
});

// Delete Book
bookRoute.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) {
      res.status(404).json({ message: "Book not found" });
      return 
    }

    // Optional: Delete the book's cover image file if it exists
    if (book.coverImage) {
      const imagePath = path.join(__dirname, '..', book.coverImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await prisma.book.delete({ where: { id } });

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting book" });
  }
});

// Update Book Status
bookRoute.patch("/:id/status", async function (req, res) {
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

// Claim a book
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
        claimedBy: { connect: { id: userId } },
        status: "RENTED"
      }
    });

    res.status(200).json({ message: "Book claimed successfully", book });
  } catch (err) {
    console.error("Error claiming book", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Unclaim a book (return it)
bookRoute.patch("/:id/unclaim", async (req, res) => {
  const { id } = req.params;

  try {
    const book = await prisma.book.update({
      where: { id },
      data: {
        claimedBy: { disconnect: true },
        status: "AVAILABLE"
      }
    });

    res.status(200).json({ message: "Book returned successfully", book });
  } catch (err) {
    console.error("Error returning book", err);
    res.status(500).json({ message: "Internal server error" });
  }
});