"use client"

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, ExternalLink, Loader2, Heart, MessageCircle, Users } from 'lucide-react'
import Link from 'next/link'

interface Event {
  id: number
  title: string
  description: string | null
  eventDate: string
  location: string
  category: string
  registrationLink: string | null
  imageUrl: string | null
}

export default function StudentDashboard() {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUpcomingEvents()
  }, [])

  const fetchUpcomingEvents = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/events?approved=true&upcoming=true&limit=6')
      if (response.ok) {
        const data = await response.json()
        setUpcomingEvents(data)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  return (
    <DashboardLayout allowedRoles={['student']}>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Your Wellness Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your mental health journey starts here. Explore resources and connect with support.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mb-3">
                <MessageCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle>Chat with Mira</CardTitle>
              <CardDescription>
                Get instant support from our AI wellness companion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Available 24/7 for emotional support and guidance
              </p>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                Online Now
              </Badge>
            </CardContent>
          </Card>

          <Link href="/events">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-3">
                  <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>Browse Events</CardTitle>
                <CardDescription>
                  Join workshops and support groups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {upcomingEvents.length} upcoming events available
                </p>
                <Button variant="outline" size="sm">
                  View All Events
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center mb-3">
                <Heart className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
              <CardTitle>Resources</CardTitle>
              <CardDescription>
                Access mental health materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Self-help guides, coping strategies, and more
              </p>
              <Button variant="outline" size="sm">
                Explore Resources
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Events Near You</CardTitle>
                <CardDescription>
                  Don't miss these mental wellness activities
                </CardDescription>
              </div>
              <Link href="/events">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No upcoming events at the moment
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {upcomingEvents.slice(0, 4).map((event) => (
                  <div
                    key={event.id}
                    className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                        {event.title}
                      </h3>
                      <Badge variant="outline" className="ml-2 shrink-0">
                        {event.category}
                      </Badge>
                    </div>

                    {event.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        <span>{formatDate(event.eventDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    </div>

                    {event.registrationLink && (
                      <Button
                        asChild
                        size="sm"
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                      >
                        <a
                          href={event.registrationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2"
                        >
                          Register Now
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Emergency Resources */}
        <Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="text-red-900 dark:text-red-100">
              Emergency Support
            </CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">
              If you're in crisis, immediate help is available
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg">
                <p className="font-semibold text-gray-900 dark:text-white mb-1">
                  National Suicide Prevention
                </p>
                <a href="tel:988" className="text-indigo-600 dark:text-indigo-400 hover:underline text-lg font-bold">
                  988
                </a>
              </div>
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg">
                <p className="font-semibold text-gray-900 dark:text-white mb-1">
                  Crisis Text Line
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Text <strong>HOME</strong> to <strong>741741</strong>
                </p>
              </div>
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg">
                <p className="font-semibold text-gray-900 dark:text-white mb-1">
                  Student Helpline
                </p>
                <a href="tel:1-800-273-8255" className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold">
                  1-800-273-8255
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
