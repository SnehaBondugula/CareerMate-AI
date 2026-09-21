import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Video, User, Home, BarChart3 } from 'lucide-react'

function Header() {
    return (
        <nav className="flex w-full items-center justify-between border-t border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
            <div className="flex items-center gap-4">
                <Image src={'/logo.svg'} alt='logo' width={40} height={40} />
                <h1 className="text-base font-bold md:text-2xl">AI Mock Interview</h1>
                
                {/* Navigation Links - Desktop */}
                <div className="hidden md:flex items-center gap-6 ml-8">
                    <Link 
                        href={'/'}
                        className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors dark:text-neutral-300 dark:hover:text-primary"
                    >
                        <Home className="h-4 w-4 inline mr-2" />
                        Home
                    </Link>
                    <Link 
                        href={'/dashboard'}
                        className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors dark:text-neutral-300 dark:hover:text-primary"
                    >
                        <BarChart3 className="h-4 w-4 inline mr-2" />
                        Dashboard
                    </Link>
                    <Link 
                        href={'/test-camera'}
                        className="text-sm font-medium text-neutral-600 hover:text-primary transition-colors dark:text-neutral-300 dark:hover:text-primary"
                    >
                        <Video className="h-4 w-4 inline mr-2" />
                        Practice
                    </Link>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                {/* Quick Practice Button */}
                <Link href={'/test-camera'}>
                    <Button 
                        size={'sm'} 
                        className="gap-2 bg-blue-600 hover:bg-blue-700 hidden sm:flex"
                    >
                        <Video className="h-4 w-4" />
                        Quick Practice
                    </Button>
                </Link>
                
                {/* Main Get Started Button */}
                <Link href={'/dashboard'}>
                    <Button size={'lg'} className="gap-2">
                        <User className="h-4 w-4" />
                        Get Started
                    </Button>
                </Link>
            </div>
        </nav>
    )
}

export default Header