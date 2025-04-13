import express from "express"
import cors from 'cors'
import path from 'path'
import { bookRoute } from "./routes/bookRoute"
import { authRoute } from "./routes/authRoute"

const app = express()
app.use(express.json())
app.use(cors({ origin: '*' }))
const PORT = 3000;

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/auth', authRoute)
app.use('/books', bookRoute)

try {
  app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
  });
} catch (err) {
  console.error("Failed to start server:", err);
}