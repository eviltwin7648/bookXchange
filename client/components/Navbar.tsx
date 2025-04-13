'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BookOpenText, User2, LogIn, UserPlus, LogOut } from 'lucide-react'

type User = {
  id: string
  name: string
  email: string
  role: string
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (err) {
          console.error('Failed to parse user from localStorage:', err)
        }
      } else {
        setUser(null)
      }
    }

    checkUser()
    window.addEventListener('userChanged', checkUser)
    
    return () => {
      window.removeEventListener('userChanged', checkUser)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    window.dispatchEvent(new Event('userChanged'))
  }

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 font-semibold text-xl">
              <BookOpenText className="h-6 w-6" />
              <span>BookXchange</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User2 className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                
                <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}