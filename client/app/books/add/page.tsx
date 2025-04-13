'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { api } from '@/lib/api'

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
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

      const payload = { ...form, ownerId: user.id }

      await api.post('/books', payload)
      toast.success('Book listed successfully!')
      router.push('/')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">📚 Add a Book</h1>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label>Title</Label>
              <Input name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Atomic Habits" />
            </div>
            <div>
              <Label>Author</Label>
              <Input name="author" value={form.author} onChange={handleChange} required placeholder="e.g. James Clear" />
            </div>
            <div>
              <Label>Genre</Label>
              <Input name="genre" value={form.genre} onChange={handleChange} required placeholder="e.g. Self-help" />
            </div>
            <div>
              <Label>Location</Label>
              <Input name="location" value={form.location} onChange={handleChange} required placeholder="e.g. Delhi" />
            </div>
            <div>
              <Label>Contact Info</Label>
              <Textarea name="contactInfo" value={form.contactInfo} onChange={handleChange} required placeholder="Your contact details here" />
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
