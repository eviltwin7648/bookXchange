'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type User = {
  id: string
  name: string
  email: string
}

type Book = {
  id: string
  title: string
  author: string
  genre: string
  location: string
  contactInfo: string
  status: string
  coverImage?: string
  owner: {
    name: string
    email: string
    mobile: string
    id: string
  }
  claimedBy?: {
    id: string
    name: string
  } | null
}

export default function Home() {
  const [filters, setFilters] = useState({ title: '', genre: '', location: '' })
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  console.log(books)
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (err) {
        console.error('Failed to parse user from localStorage:', err)
      }
    }

    fetchBooks()

    // Listen for user changes
    const handleUserChange = () => {
      const updatedUser = localStorage.getItem('user')
      if (updatedUser) {
        try {
          setUser(JSON.parse(updatedUser))
        } catch (err) {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    }

    window.addEventListener('userChanged', handleUserChange)
    return () => window.removeEventListener('userChanged', handleUserChange)
  }, [])

  const fetchBooks = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.title) params.append('title', filters.title)
      if (filters.genre) params.append('genre', filters.genre)
      if (filters.location) params.append('location', filters.location)

      const res = await api.get(`/books?${params.toString()}`)
      setBooks(res.data)
    } catch (err) {
      console.error('Failed to fetch books', err)
      toast.error('Failed to load books')
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault()
    fetchBooks()
  }

  const handleClaim = async (bookId: string) => {
    if (!user?.id) {
      toast.error('Please login to claim a book')
      return
    }

    try {
      await api.patch(`/books/${bookId}/claim`, { userId: user.id })
      toast.success('Book claimed successfully!')
      fetchBooks()
    } catch (err) {
      console.error('Error claiming book', err)
      toast.error('Failed to claim book')
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6">Browse Books</h1>

      {/* Filter Form */}
      <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div>
          <Label>Title</Label>
          <Input
            placeholder="Search by title"
            value={filters.title}
            onChange={(e) => setFilters({ ...filters, title: e.target.value })}
          />
        </div>
        <div>
          <Label>Genre</Label>
          <Input
            placeholder="Search by genre"
            value={filters.genre}
            onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
          />
        </div>
        <div>
          <Label>Location</Label>
          <Input
            placeholder="Search by location"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          />
        </div>
        <Button type="submit" className="col-span-1 md:col-span-3">
          Apply Filters
        </Button>
      </form>

      {/* Book List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : books.length === 0 ? (
        <p className="text-center py-10 text-muted-foreground">No books found matching your criteria.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <Card key={book.id} className="overflow-hidden">
              {book.coverImage && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={`${process.env.API_URL}${book.coverImage}`} 
                    alt={book.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardContent className={`p-4 space-y-2 ${!book.coverImage ? 'pt-6' : ''}`}>
                <h2 className="text-xl font-semibold">{book.title}</h2>
                <p><strong>Author:</strong> {book.author}</p>
                <p><strong>Genre:</strong> {book.genre || 'Not specified'}</p>
                <p><strong>Location:</strong> {book.location}</p>
                <p><strong>Status:</strong> {book.status}</p>
                <div className="text-sm text-muted-foreground mt-2">
                  <p>📞 {book.owner.name}</p>
                  <p>{book.owner.email}</p>
                  <p>{book.owner.mobile}</p>
                </div>

                {book.claimedBy ? (
                  <p className="text-sm text-blue-500">Claimed by: {book.claimedBy.name}</p>
                ) : (
                  book.status === 'AVAILABLE' &&
                  user?.id !== book.owner.id && (
                    <Button size="sm" onClick={() => handleClaim(book.id)} className="w-full mt-3">
                      Claim This Book
                    </Button>
                  )
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}