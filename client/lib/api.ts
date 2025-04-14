import axios from 'axios'

export const api = axios.create({
  baseURL:process.env.API_URL, // your backend
  headers: {
    'Content-Type': 'application/json',
  },
})
