"use client"

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar, Plus, Loader2, Building2, CheckCircle, Clock, Edit, Trash2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface NGOProfile {
  id: number
  ngoName: string
  description: string | null
  contactEmail: string
  contactPhone: string | null
  websiteUrl: string | null
  approved: boolean
}

interface Event {
  id: number
  title: string
  description: string | null
  eventDate: string
  location: string
  category: string
  registrationLink: string | null
  approved: boolean
}

export default function NGODashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<NGOProfile | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    eventDate: '',
    location: '',
    category: 'Workshop',
    registrationLink: '',
  })

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [profileRes, eventsRes] = await Promise.all([
        fetch(`/api/ngo-profiles?userId=${user?.id}`),
        fetch(`/api/events?limit=50`),
      ])

      if (profileRes.ok) {
        const profiles = await profileRes.json()
        if (profiles.length > 0) {
          setProfile(profiles[0])
          // Fetch events for this NGO
          const ngoEventsRes = await fetch(`/api/events?ngoId=${profiles[0].id}&limit=50`)
          if (ngoEventsRes.ok) {
            setEvents(await ngoEventsRes.json())
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async () => {
    if (!profile) return

    setIsCreatingEvent(true)
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ngoId: profile.id,
          ...eventForm,
        }),
      })

      if (response.ok) {
        await fetchData()
        setEventForm({
          title: '',
          description: '',
          eventDate: '',
          location: '',
          category: 'Workshop',
          registrationLink: '',
        })
      }
    } catch (error) {
      console.error('Error creating event:', error)
    } finally {
      setIsCreatingEvent(false)
    }
  }

  const handleDeleteEvent = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const response = await fetch(`/api/events?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  if (loading) {
    return (
      <DashboardLayout allowedRoles={['ngo']}>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    )
  }

  if (!profile) {
    return (
      <DashboardLayout allowedRoles={['ngo']}>
        <Alert>
          <AlertDescription>
            No NGO profile found. Please contact support to set up your profile.
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout allowedRoles={['ngo']}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              NGO Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your profile and events
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>
                  Add a new mental wellness event for students
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    placeholder="e.g., Stress Management Workshop"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    placeholder="Describe your event..."
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventDate">Date *</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={eventForm.eventDate}
                      onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      value={eventForm.category}
                      onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                      placeholder="e.g., Workshop, Support Group"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    placeholder="e.g., Campus Center Room 201 or Online via Zoom"
                  />
                </div>

                <div>
                  <Label htmlFor="registrationLink">Registration Link</Label>
                  <Input
                    id="registrationLink"
                    type="url"
                    value={eventForm.registrationLink}
                    onChange={(e) => setEventForm({ ...eventForm, registrationLink: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <Button
                  onClick={handleCreateEvent}
                  disabled={isCreatingEvent || !eventForm.title || !eventForm.eventDate || !eventForm.location}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  {isCreatingEvent ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Event'
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Events will be pending admin approval before appearing publicly
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-indigo-600" />
                <div>
                  <CardTitle>{profile.ngoName}</CardTitle>
                  <CardDescription>{profile.contactEmail}</CardDescription>
                </div>
              </div>
              {profile.approved ? (
                <Badge className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Approved
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending Approval
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {profile.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {profile.description}
              </p>
            )}
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              {profile.contactPhone && (
                <div>
                  <span className="font-medium">Phone:</span> {profile.contactPhone}
                </div>
              )}
              {profile.websiteUrl && (
                <div>
                  <span className="font-medium">Website:</span>{' '}
                  <a
                    href={profile.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    {profile.websiteUrl}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Events Section */}
        <Card>
          <CardHeader>
            <CardTitle>Your Events</CardTitle>
            <CardDescription>
              Manage your mental wellness events
            </CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No events created yet
                </p>
                <p className="text-sm text-gray-500">
                  Click "Create Event" to add your first event
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {event.title}
                          </h3>
                          <Badge variant="outline">{event.category}</Badge>
                          {event.approved ? (
                            <Badge className="bg-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approved
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>

                        {event.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {event.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(event.eventDate).toLocaleDateString()}
                          </div>
                          <div>📍 {event.location}</div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
