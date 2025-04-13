'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'
import Link from 'next/link'

type BookData = {
  id: string
  title: string
  author: string
  genre: string
  location: string
  contactInfo: string
  coverImage?: string
}

export default function EditBookPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const bookId = params.id

  const [form, setForm] = useState<BookData>({
    id: '',
    title: '',
    author: '',
    genre: '',
    location: '',
    contactInfo: '',
    coverImage: '',
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)

  useEffect(() => {
    fetchBookDetails()
  }, [bookId])

  const fetchBookDetails = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (!user?.id) {
        toast.error('You must be logged in to edit a book')
        router.push('/login')
        return
      }

      const response = await api.get(`/books/${bookId}`)
      const bookData = response.data

      // Check if current user is the owner
      if (bookData.ownerId !== user.id) {
        toast.error('You can only edit your own books')
        router.push('/dashboard')
        return
      }

      setForm({
        id: bookData.id,
        title: bookData.title,
        author: bookData.author,
        genre: bookData.genre || '',
        location: bookData.location,
        contactInfo: bookData.contactInfo,
        coverImage: bookData.coverImage || '',
      })

      if (bookData.coverImage) {
        setCoverImagePreview(bookData.coverImage)
      }

      setLoading(false)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load book details')
      router.push('/dashboard')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setCoverImageFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setCoverImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (!user?.id || user?.role !== 'OWNER') {
        toast.error('Only owners can edit books')
        return
      }

      let imageUrl = form.coverImage
      
      // Handle image upload if a new file was selected
      if (coverImageFile) {
        const formData = new FormData()
        formData.append('image', coverImageFile)
        
        // Upload the image first
        const uploadResponse = await api.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        
        imageUrl = uploadResponse.data.imageUrl
      }

      // Update the book with all data including the image URL
      await api.put(`/books/${bookId}`, {
        ...form,
        coverImage: imageUrl,
      })

      toast.success('Book updated successfully!')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update book')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="flex items-center mb-6">
        <Link href="/dashboard" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">📚 Edit Book</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label>Title</Label>
              <Input name="title" value={form.title} onChange={handleChange} required />
            </div>
            <div>
              <Label>Author</Label>
              <Input name="author" value={form.author} onChange={handleChange} required />
            </div>
            <div>
              <Label>Genre</Label>
              <Input name="genre" value={form.genre} onChange={handleChange} />
            </div>
            <div>
              <Label>Location</Label>
              <Input name="location" value={form.location} onChange={handleChange} required />
            </div>
            <div>
              <Label>Contact Info</Label>
              <Textarea name="contactInfo" value={form.contactInfo} onChange={handleChange} required />
            </div>
            
            <div>
              <Label>Cover Image</Label>
              <div className="mt-2">
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                />
              </div>
              
              {coverImagePreview && (
                <div className="mt-3 w-full h-40 bg-muted rounded overflow-hidden">
                  <img 
                    src={coverImagePreview} 
                    alt="Cover preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}