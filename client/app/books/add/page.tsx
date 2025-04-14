'use client'

import { useState } from 'react'
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

export default function AddBookPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    title: '',
    author: '',
    genre: '',
    location: '',
    contactInfo: '',
  })

  const [loading, setLoading] = useState(false)
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)

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
    setLoading(true)

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (!user?.id || user?.role !== 'OWNER') {
        toast.error('Only owners can add books.')
        return
      }

      let imageUrl = ''
      
      // Handle image upload if a file was selected
      if (coverImageFile) {
        const formData = new FormData()
        formData.append('image', coverImageFile)
        
        // Upload the image first
        const uploadResponse = await api.post('/books/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        
        imageUrl = uploadResponse.data.imageUrl
      }

      const payload = { 
        ...form, 
        ownerId: user.id,
        coverImage: imageUrl || undefined
      }

      await api.post('/books', payload)
      toast.success('Book listed successfully!')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="flex items-center mb-6">
        <Link href="/dashboard" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">📚 Add a Book</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label>Title</Label>
              <Input 
                name="title" 
                value={form.title} 
                onChange={handleChange} 
                required 
                placeholder="e.g. Atomic Habits" 
              />
            </div>
            <div>
              <Label>Author</Label>
              <Input 
                name="author" 
                value={form.author} 
                onChange={handleChange} 
                required 
                placeholder="e.g. James Clear" 
              />
            </div>
            <div>
              <Label>Genre</Label>
              <Input 
                name="genre" 
                value={form.genre} 
                onChange={handleChange} 
                placeholder="e.g. Self-help" 
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input 
                name="location" 
                value={form.location} 
                onChange={handleChange} 
                required 
                placeholder="e.g. Delhi" 
              />
            </div>
            <div>
              <Label>Contact Info</Label>
              <Textarea 
                name="contactInfo" 
                value={form.contactInfo} 
                onChange={handleChange} 
                required 
                placeholder="Your contact details here" 
              />
            </div>
            
            <div>
              <Label>Cover Image (Optional)</Label>
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Submitting...' : 'Add Book'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}