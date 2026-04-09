'use client'

import { useState, useEffect } from 'react'
import { vendorApi } from '@/lib/api'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Eye, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Vendor {
  id: number
  name: string
  owner: string
  city: string
  email: string
  phone: string
  status: 'APPROVED' | 'PENDING' | 'SUSPENDED' | 'REJECTED' | 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE' | 'BANNED'
  joined: string
  rating: number
}

export default function VendorManagement() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<{
    vendor: Vendor
    type: 'ban' | 'unban' | 'delete'
  } | null>(null)

  const fetchVendors = async () => {
    try {
      setLoading(true)
      const data = await vendorApi.getAllAdmin()
      // Map API response to UI model
      const mappedVendors = data.map((v: any) => ({
        id: v.id,
        name: v.name || 'Unknown Vendor',
        owner: v.owner?.displayName || 'Unknown',
        city: v.address || 'Unknown',
        email: v.owner?.email || 'unknown@example.com',
        phone: v.phone || 'Unknown',
        status: v.status || (v.isActive ? 'APPROVED' : 'PENDING'),
        joined: v.createdAt ? new Date(v.createdAt).toLocaleDateString() : 'Unknown',
        rating: v.rating || 0,
      }))
      setVendors(mappedVendors)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch vendors', err)
      setError('Failed to load vendors')
      toast.error('Failed to load vendors')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVendors()
  }, [])

  const [filterStatus, setFilterStatus] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredVendors = vendors.filter(vendor => {
    const matchesStatus = filterStatus === 'All' || vendor.status === filterStatus
    const matchesSearch = (vendor.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (vendor.owner?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'APPROVED':
      case 'AVAILABLE':
        return 'bg-emerald-100 text-emerald-700'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700'
      case 'SUSPENDED':
      case 'REJECTED':
        return 'bg-red-100 text-red-700'
      case 'BANNED':
        return 'bg-red-200 text-red-900 font-black'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const confirmPendingAction = async () => {
    if (!pendingAction) return

    try {
      if (pendingAction.type === 'delete') {
        await vendorApi.delete(pendingAction.vendor.id)
        toast.success('Vendor deleted')
      } else if (pendingAction.type === 'ban') {
        await vendorApi.updateStatus(pendingAction.vendor.id.toString(), 'BANNED')
        toast.success('Vendor banned and account locked')
      } else {
        await vendorApi.updateStatus(pendingAction.vendor.id.toString(), 'APPROVED')
        toast.success('Vendor account reactivated')
      }

      await fetchVendors()
    } catch (err) {
      console.error('Vendor action failed', err)
      toast.error('Failed to update vendor')
    } finally {
      setPendingAction(null)
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendor Management</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor all vendors on the platform</p>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by vendor name or owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-input rounded-md text-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option>All</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="BANNED">Banned</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Vendors Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Vendors</CardTitle>
          <CardDescription>{filteredVendors.length} vendors on platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{vendor.name}</p>
                        <p className="text-xs text-muted-foreground">{vendor.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{vendor.owner}</TableCell>
                    <TableCell>{vendor.city}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vendor.status)}`}>
                        {vendor.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {vendor.rating > 0 ? (
                        <span className="font-medium text-amber-600">{vendor.rating}/5</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{vendor.name}</DialogTitle>
                              <DialogDescription>Vendor details and management</DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs text-muted-foreground">Owner Name</Label>
                                <p className="font-medium">{vendor.owner}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Email</Label>
                                <p className="font-medium">{vendor.email}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Phone</Label>
                                <p className="font-medium">{vendor.phone}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">City</Label>
                                <p className="font-medium">{vendor.city}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Joined</Label>
                                <p className="font-medium">{vendor.joined}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Status</Label>
                                <p className="font-medium">{vendor.status}</p>
                              </div>
                            </div>
                            {vendor.status === 'PENDING' && (
                              <div className="flex gap-2 pt-4 border-t">
                                <Button
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-2"
                                  onClick={async () => {
                                    await vendorApi.updateStatus(vendor.id.toString(), 'APPROVED')
                                    fetchVendors()
                                  }}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  className="flex-1 gap-2"
                                  onClick={async () => {
                                    await vendorApi.updateStatus(vendor.id.toString(), 'REJECTED')
                                    fetchVendors()
                                  }}
                                >
                                  <XCircle className="w-4 h-4" />
                                  Reject
                                </Button>
                              </div>
                            )}
                            {(vendor.status === 'APPROVED' || vendor.status === 'AVAILABLE') && (
                              <div className="flex gap-2 pt-4 border-t">
                                <Button
                                  variant="destructive"
                                  className="flex-1 gap-2"
                                  onClick={async () => {
                                    await vendorApi.updateStatus(vendor.id.toString(), 'SUSPENDED')
                                    fetchVendors()
                                  }}
                                >
                                  Suspend Vendor
                                </Button>
                                <Button
                                  className="flex-1 bg-red-900 hover:bg-red-950 text-white gap-2"
                                  onClick={() => setPendingAction({ vendor, type: 'ban' })}
                                >
                                  <XCircle className="w-4 h-4" />
                                  Ban Vendor
                                </Button>
                              </div>
                            )}
                            {vendor.status === 'SUSPENDED' && (
                              <div className="flex gap-2 pt-4 border-t">
                                <Button
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2"
                                  onClick={async () => {
                                    await vendorApi.updateStatus(vendor.id.toString(), 'APPROVED')
                                    fetchVendors()
                                  }}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Unsuspend / Re-activate
                                </Button>
                              </div>
                            )}
                            {vendor.status === 'BANNED' && (
                              <div className="flex gap-2 pt-4 border-t">
                                <Button
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2"
                                  onClick={() => setPendingAction({ vendor, type: 'unban' })}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Unban Vendor
                                </Button>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => setPendingAction({ vendor, type: 'delete' })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={Boolean(pendingAction)}
        onOpenChange={(open) => {
          if (!open) {
            setPendingAction(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.type === 'ban'
                ? 'Ban vendor account?'
                : pendingAction?.type === 'unban'
                  ? 'Reactivate vendor account?'
                  : 'Delete vendor?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.type === 'ban'
                ? `This will ban ${pendingAction.vendor.name} and deactivate the owner's account.`
                : pendingAction?.type === 'unban'
                  ? `This will restore ${pendingAction.vendor.name} and reactivate the owner's account.`
                  : `This will permanently remove ${pendingAction?.vendor.name}. This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmPendingAction}
              className={pendingAction?.type === 'unban' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-destructive text-white hover:bg-destructive/90'}
            >
              {pendingAction?.type === 'ban'
                ? 'Ban vendor'
                : pendingAction?.type === 'unban'
                  ? 'Reactivate vendor'
                  : 'Delete vendor'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
