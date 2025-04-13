"use client"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null')
    setUser(storedUser)

    const handleUserChange = () => {
        const updatedUser = JSON.parse(localStorage.getItem('user') || 'null')
        setUser(updatedUser)
      }
    window.addEventListener('userChanged', handleUserChange)

    return () => {
      window.removeEventListener('userChanged', handleUserChange)
    }
  }, [])


  const handleSignOut = () => {
    localStorage.removeItem('user')
    setUser(null)
    window.dispatchEvent(new Event('userChanged')) 
  }

  return (
    <nav className="bg-white border-b shadow-sm py-4 px-6 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold text-primary">📚 BookList</Link>
      
      <div className="space-x-4 flex items-center">
        {!user ? (
          <>
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </>
        ) : (
          <>
            {/* Show only for OWNER */}
            {user.role === 'OWNER' && (
              <Link href="/books/add">
                <Button>Create Listing</Button>
              </Link>
            )}

            {/* Show sign-out button */}
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </>
        )}
      </div>
    </nav>
  )
}
