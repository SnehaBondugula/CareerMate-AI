"use client"
import React from 'react'
import { motion } from "motion/react";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Video, PlayCircle, Target, Mic, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

function Hero() {

    return (
        <div className="relative mx-auto my-10 flex max-w-7xl flex-col items-center justify-center">

            <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
                <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
            </div>
            <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
                <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-px w-full bg-neutral-200/80 dark:bg-neutral-800/80">
                <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
            </div>
            <div className="px-4 py-10 md:py-20">
                {/* New Feature Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 mb-8 flex justify-center"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        <Sparkles className="h-4 w-4" />
                        New: Real-time Camera Feedback
                        <Link 
                            href="/test-camera" 
                            className="ml-2 font-semibold hover:underline"
                        >
                            Try Now →
                        </Link>
                    </div>
                </motion.div>

                <h1 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-slate-700 md:text-4xl lg:text-7xl dark:text-slate-300">
                    {"Master Job Interview with AI-Powered Practice Sessions"
                        .split(" ")
                        .map((word, index) => (
                            <motion.span
                                key={index}
                                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                                transition={{
                                    duration: 0.3,
                                    delay: index * 0.1,
                                    ease: "easeInOut",
                                }}
                                className={`mr-2 inline-block ${(index == 1 || index == 2) && 'text-primary'}`}
                            >
                                {word}
                            </motion.span>
                        ))}
                </h1>
                <motion.p
                    initial={{
                        opacity: 0,
                    }}
                    animate={{
                        opacity: 1,
                    }}
                    transition={{
                        duration: 0.3,
                        delay: 0.8,
                    }}
                    className="relative z-10 mx-auto max-w-xl py-4 text-center text-lg font-normal text-neutral-600 dark:text-neutral-400"
                >
                    Prepare for your dream role with interactive AI avatars that mimic real recruiters. Get instant insights, refine your communication skills, and walk into every interview with confidence.
                </motion.p>

                {/* Features Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.9 }}
                    className="relative z-10 mx-auto mb-8 grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-3"
                >
                    <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="mb-2 flex justify-center">
                            <Video className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-semibold">Camera Analysis</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Real-time posture & eye contact feedback</p>
                    </div>
                    
                    <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="mb-2 flex justify-center">
                            <Mic className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="font-semibold">Voice Practice</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Clarity, pace & confidence analysis</p>
                    </div>
                    
                    <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="mb-2 flex justify-center">
                            <Target className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="font-semibold">Progress Tracking</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Monitor improvements over time</p>
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{
                        opacity: 0,
                    }}
                    animate={{
                        opacity: 1,
                    }}
                    transition={{
                        duration: 0.3,
                        delay: 1,
                    }}
                    className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
                >
                    {/* Main Practice Button */}
                    <Link href={'/test-camera'}>
                        <Button size={'lg'} className="gap-3 bg-blue-600 hover:bg-blue-700 px-8">
                            <PlayCircle className="h-5 w-5" />
                            Start Practice Session
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                    </Link>
                    
                    {/* Secondary Button */}
                    <Link href={'/dashboard'}>
                        <Button size={'lg'} variant="outline" className="gap-2">
                            <Target className="h-5 w-5" />
                            Explore Dashboard
                        </Button>
                    </Link>
                    
                    {/* Contact Support */}
                    <button className="w-60 transform rounded-lg border border-gray-300 bg-white px-6 py-2 font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-100 dark:border-gray-700 dark:bg-black dark:text-white dark:hover:bg-gray-900">
                        Contact Support
                    </button>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                    className="relative z-10 mt-12 text-center"
                >
                    <div className="inline-flex items-center gap-6 text-sm text-neutral-600 dark:text-neutral-400">
                        <div>
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">500+</div>
                            <div>Practice Sessions</div>
                        </div>
                        <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700" />
                        <div>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">92%</div>
                            <div>Success Rate</div>
                        </div>
                        <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700" />
                        <div>
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">24/7</div>
                            <div>AI Available</div>
                        </div>
                    </div>
                </motion.div>

                {/* Demo Image */}
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 10,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.3,
                        delay: 1.4,
                    }}
                    className="relative z-10 mt-20 rounded-3xl border border-neutral-200 bg-neutral-100 p-4 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                >
                    <div className="w-full overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700">
                        <img
                            src="/hero-2.png"
                            alt="Landing page preview"
                            className="aspect-[16/9] h-auto w-full object-cover"
                            height={1000}
                            width={1000}
                        />
                        {/* Overlay Link */}
                        <Link 
                            href="/test-camera"
                            className="absolute bottom-4 right-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Try Live Demo →
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default Hero