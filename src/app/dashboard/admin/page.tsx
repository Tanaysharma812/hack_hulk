"use client"

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users, Building2, Calendar, TrendingUp, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Analytics {
  users: {
    total: number
    byRole: {
      admin: number
      ngo: number
      student: number
    }
  }
  ngoProfiles: {
    total: number
    approved: number
    pending: number
  }
  events: {
    total: number
    approved: number
    pending: number
    upcoming: number
    byCategory: Record<string, number>
  }
}

interface NGOProfile {
  id: number
  ngoName: string
  contactEmail: string
  description: string | null
  approved: boolean
  createdAt: string
}

interface Event {
  id: number
  title: string
  category: string
  eventDate: string
  location: string
  approved: boolean
  createdAt: string
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [ngos, setNgos] = useState<NGOProfile[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [analyticsRes, ngosRes, eventsRes] = await Promise.all([
        fetch('/api/admin/analytics'),
        fetch('/api/ngo-profiles?limit=50'),
        fetch('/api/events?limit=50'),
      ])

      if (analyticsRes.ok) setAnalytics(await analyticsRes.json())
      if (ngosRes.ok) setNgos(await ngosRes.json())
      if (eventsRes.ok) setEvents(await eventsRes.json())
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveNGO = async (id: number, approved: boolean) => {
    setActionLoading(`ngo-${id}`)
    try {
      const response = await fetch(`/api/ngo-profiles?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      })

      if (response.ok) {
        setNgos(ngos.map(ngo => ngo.id === id ? { ...ngo, approved } : ngo))
        await fetchData() // Refresh analytics
      }
    } catch (error) {
      console.error('Error updating NGO:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleApproveEvent = async (id: number, approved: boolean) => {
    setActionLoading(`event-${id}`)
    try {
      const response = await fetch(`/api/events?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      })

      if (response.ok) {
        setEvents(events.map(event => event.id === id ? { ...event, approved } : event))
        await fetchData() // Refresh analytics
      }
    } catch (error) {
      console.error('Error updating event:', error)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <DashboardLayout allowedRoles={['admin']}>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage NGOs, events, and monitor platform analytics
          </p>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics.users.total}</div>
                <p className="text-xs text-gray-500 mt-2">
                  {analytics.users.byRole.student} students, {analytics.users.byRole.ngo} NGOs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">NGO Profiles</CardTitle>
                <Building2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics.ngoProfiles.total}</div>
                <p className="text-xs text-gray-500 mt-2">
                  {analytics.ngoProfiles.pending} pending approval
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Events</CardTitle>
                <Calendar className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics.events.total}</div>
                <p className="text-xs text-gray-500 mt-2">
                  {analytics.events.upcoming} upcoming events
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {analytics.ngoProfiles.pending + analytics.events.pending}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Requires immediate attention
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Approval Tabs */}
        <Tabs defaultValue="ngos" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="ngos">
              NGO Approvals ({ngos.filter(n => !n.approved).length})
            </TabsTrigger>
            <TabsTrigger value="events">
              Event Approvals ({events.filter(e => !e.approved).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ngos" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>NGO Profile Approvals</CardTitle>
                <CardDescription>
                  Review and approve NGO registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ngos.length === 0 ? (
                  <Alert>
                    <AlertDescription>No NGO profiles found.</AlertDescription>
                  </Alert>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>NGO Name</TableHead>
                        <TableHead>Contact Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ngos.map((ngo) => (
                        <TableRow key={ngo.id}>
                          <TableCell className="font-medium">{ngo.ngoName}</TableCell>
                          <TableCell>{ngo.contactEmail}</TableCell>
                          <TableCell>
                            {ngo.approved ? (
                              <Badge variant="default" className="bg-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approved
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(ngo.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {!ngo.approved ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveNGO(ngo.id, true)}
                                  disabled={actionLoading === `ngo-${ngo.id}`}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {actionLoading === `ngo-${ngo.id}` ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Approve
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApproveNGO(ngo.id, false)}
                                  disabled={actionLoading === `ngo-${ngo.id}`}
                                >
                                  {actionLoading === `ngo-${ngo.id}` ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Revoke
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Approvals</CardTitle>
                <CardDescription>
                  Review and approve events from NGOs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <Alert>
                    <AlertDescription>No events found.</AlertDescription>
                  </Alert>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell className="font-medium">{event.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{event.category}</Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(event.eventDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {event.approved ? (
                              <Badge variant="default" className="bg-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approved
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {!event.approved ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveEvent(event.id, true)}
                                  disabled={actionLoading === `event-${event.id}`}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {actionLoading === `event-${event.id}` ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Approve
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApproveEvent(event.id, false)}
                                  disabled={actionLoading === `event-${event.id}`}
                                >
                                  {actionLoading === `event-${event.id}` ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Revoke
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
