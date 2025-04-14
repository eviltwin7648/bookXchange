import axios from 'axios'

export const api = axios.create({
  baseURL:process.env.NEXT_PUBLIC_API_URL || "https://bookxchange.onrender.com", // your backend
  headers: {
    'Content-Type': 'application/json',
  },
})
