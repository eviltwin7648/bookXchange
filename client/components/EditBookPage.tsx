'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type Book = {
  id: string
  title: string
  author: string
  genre: string
  location: string
  contactInfo: string
  coverImage?: string
}

export default function EditBookPage({ bookId }: { bookId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [book, setBook] = useState<Book | null>(null)
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await api.get(`/books/${bookId}`)
        setBook(response.data)
        if (response.data.coverImage) {
          setCoverPreview(response.data.coverImage)
        }
      } catch (error) {
        console.error('Error fetching book:', error)
        toast.error('Failed to load book data')
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    if (bookId) {
      fetchBook()
    }
  }, [bookId, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!book) return
    setBook({
      ...book,
      [e.target.name]: e.target.value
    })
  }

  const handleSelectChange = (value: string, field: string) => {
    if (!book) return
    setBook({
      ...book,
      [field]: value
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setCoverImage(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!book) return
    
    setSubmitting(true)
    
    try {
      let updatedBook = { ...book }
      
      // Handle image upload if needed
      if (coverImage) {
        const formData = new FormData()
        formData.append('image', coverImage)
        
        const uploadResponse = await api.post('/books/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        updatedBook.coverImage = uploadResponse.data.imageUrl
      }
      
      // Update book data
      await api.put(`/books/${bookId}`, updatedBook)
      
      toast.success('Book updated successfully')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error updating book:', error)
      toast.error('Failed to update book')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!book) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Book not found</h1>
        <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Edit Book</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input 
            id="title" 
            name="title" 
            value={book.title} 
            onChange={handleInputChange} 
            required 
          />
        </div>
        
        <div>
          <Label htmlFor="author">Author</Label>
          <Input 
            id="author" 
            name="author" 
            value={book.author} 
            onChange={handleInputChange} 
            required 
          />
        </div>
        
        <div>
          <Label htmlFor="genre">Genre</Label>
          <Input 
            id="genre" 
            name="genre" 
            value={book.genre || ''} 
            onChange={handleInputChange} 
          />
        </div>
        
        <div>
          <Label htmlFor="location">Location</Label>
          <Input 
            id="location" 
            name="location" 
            value={book.location} 
            onChange={handleInputChange} 
            required 
          />
        </div>
        
        <div>
          <Label htmlFor="contactInfo">Contact Information</Label>
          <Textarea 
            id="contactInfo" 
            name="contactInfo" 
            value={book.contactInfo} 
            onChange={handleInputChange} 
            required 
          />
        </div>
        
        <div>
          <Label htmlFor="coverImage">Cover Image</Label>
          <Input 
            id="coverImage" 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
          />
          
          {coverPreview && (
            <div className="mt-2">
              <p className="text-sm mb-1">Preview:</p>
              <img 
                src={coverPreview} 
                alt="Cover preview" 
                className="w-40 h-auto object-cover border rounded"
              />
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Book'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}