'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

type User = {
  id: string
  name: string
  email: string
  role: string
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

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [ownedBooks, setOwnedBooks] = useState<Book[]>([])
  const [claimedBooks, setClaimedBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      router.push('/login')
      return
    }

    try {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      fetchUserBooks(userData.id)
    } catch (err) {
      console.error('Failed to parse user data:', err)
      router.push('/login')
    }
  }, [])

  const fetchUserBooks = async (userId: string) => {
    setLoading(true)
    try {
      // Fetch books owned by this user
      const ownedRes = await api.get(`/books/owner/${userId}`)
      setOwnedBooks(ownedRes.data)

      // Fetch books claimed by this user
      const claimedRes = await api.get(`/books/claimed/${userId}`)
      setClaimedBooks(claimedRes.data)
    } catch (err) {
      console.error('Failed to fetch user books', err)
      toast.error('Failed to load your books')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (bookId: string) => {
    try {
      await api.delete(`/books/${bookId}`)
      toast.success('Book deleted successfully')
      // Refresh the book list
      fetchUserBooks(user?.id || '')
    } catch (err) {
      console.error('Failed to delete book', err)
      toast.error('Failed to delete book')
    }
  }

  const handleReturn = async (bookId: string) => {
    try {
      // Update book status to AVAILABLE
      await api.patch(`/books/${bookId}/status`, { status: 'AVAILABLE' })
      // Remove claim
      await api.patch(`/books/${bookId}/unclaim`)
      toast.success('Book returned successfully')
      fetchUserBooks(user?.id || '')
    } catch (err) {
      console.error('Failed to return book', err)
      toast.error('Failed to return book')
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading your dashboard...</div>
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">My Dashboard</h1>
        {user?.role === 'OWNER' && (
          <Link href="/books/add">
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Add New Book
            </Button>
          </Link>
        )}
      </div>

      {user?.role === 'OWNER' && (
        <div className="mb-10">
          <h2 className="text-2xl font-medium mb-4">My Listed Books</h2>
          {ownedBooks.length === 0 ? (
            <p className="text-muted-foreground">You haven't listed any books yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ownedBooks.map((book) => (
                <Card key={book.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <h3 className="text-xl font-semibold">{book.title}</h3>
                      <div className="flex gap-2">
                        <Link href={`/books/edit/${book.id}`}>
                          <Button size="icon" variant="outline">
                            <Pencil size={16} />
                          </Button>
                        </Link>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="text-red-500"
                          onClick={() => handleDelete(book.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                    
                    {book.coverImage && (
                      <div className="w-full h-40 bg-muted my-3 rounded overflow-hidden">
                        <img 
                          src={book.coverImage} 
                          alt={book.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <p><strong>Author:</strong> {book.author}</p>
                    <p><strong>Genre:</strong> {book.genre || 'Not specified'}</p>
                    <p><strong>Location:</strong> {book.location}</p>
                    <p><strong>Status:</strong> {book.status}</p>
                    
                    {book.claimedBy && (
                      <p className="mt-2 text-blue-500">
                        Claimed by: {book.claimedBy.name}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <h2 className="text-2xl font-medium mb-4">
          {user?.role === 'OWNER' ? 'Books Claimed By Others' : 'Books I\'ve Claimed'}
        </h2>
        {claimedBooks.length === 0 ? (
          <p className="text-muted-foreground">
            {user?.role === 'OWNER' 
              ? 'None of your books have been claimed yet.' 
              : 'You haven\'t claimed any books yet.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {claimedBooks.map((book) => (
              <Card key={book.id}>
                <CardContent className="p-4">
                  <h3 className="text-xl font-semibold">{book.title}</h3>
                  
                  {book.coverImage && (
                    <div className="w-full h-40 bg-muted my-3 rounded overflow-hidden">
                      <img 
                        src={book.coverImage} 
                        alt={book.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <p><strong>Author:</strong> {book.author}</p>
                  <p><strong>Genre:</strong> {book.genre || 'Not specified'}</p>
                  <p><strong>Location:</strong> {book.location}</p>
                  <p><strong>Status:</strong> {book.status}</p>
                  
                  {user?.role === 'SEEKER' && (
                    <div className="mt-3">
                      <p><strong>Owner:</strong> {book.owner.name}</p>
                      <p><strong>Contact:</strong> {book.owner.email}</p>
                      <p><strong>Mobile:</strong> {book.owner.mobile}</p>
                      
                      <Button 
                        className="mt-3 w-full" 
                        variant="outline"
                        onClick={() => handleReturn(book.id)}
                      >
                        Return Book
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}