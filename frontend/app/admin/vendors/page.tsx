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
        email: v.owner?.email || '',
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

  const renderActions = (vendor: Vendor) => (
    <div className="flex gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] active:shadow-none hover:bg-gray-50 text-blue-600 hover:text-blue-700 h-9 w-9 p-0 flex items-center justify-center cursor-pointer">
            <Eye className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl border-4 border-black rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#fffaf4]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight text-black">{vendor.name}</DialogTitle>
            <DialogDescription className="font-bold text-black/50">Vendor details and platform status management</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 border-2 border-black p-4 rounded-2xl bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mt-4">
            <div>
              <Label className="text-[10px] font-black uppercase tracking-wider text-black/45">Owner Name</Label>
              <p className="font-bold text-black text-sm">{vendor.owner}</p>
            </div>
            <div>
              <Label className="text-[10px] font-black uppercase tracking-wider text-black/45">Email</Label>
              <p className="font-bold text-black text-sm truncate">{vendor.email}</p>
            </div>
            <div>
              <Label className="text-[10px] font-black uppercase tracking-wider text-black/45">Phone</Label>
              <p className="font-bold text-black text-sm">{vendor.phone}</p>
            </div>
            <div>
              <Label className="text-[10px] font-black uppercase tracking-wider text-black/45">City</Label>
              <p className="font-bold text-black text-sm">{vendor.city}</p>
            </div>
            <div>
              <Label className="text-[10px] font-black uppercase tracking-wider text-black/45">Joined</Label>
              <p className="font-bold text-black text-sm">{vendor.joined}</p>
            </div>
            <div>
              <Label className="text-[10px] font-black uppercase tracking-wider text-black/45">Status</Label>
              <p className="mt-0.5">
                <span className={`px-2 py-0.5 border-2 border-black rounded-lg text-[9px] font-black uppercase shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] ${getStatusColor(vendor.status)}`}>
                  {vendor.status}
                </span>
              </p>
            </div>
          </div>
          {vendor.status === 'PENDING' && (
            <div className="flex gap-3 pt-4 mt-2 border-t-2 border-black/10">
              <Button
                className="flex-1 bg-emerald-300 hover:bg-emerald-400 text-black border-2 border-black font-black uppercase text-xs h-10 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] active:shadow-none transition-all cursor-pointer gap-2"
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
                className="flex-1 bg-red-300 hover:bg-red-400 text-black border-2 border-black font-black uppercase text-xs h-10 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] active:shadow-none transition-all cursor-pointer gap-2"
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
            <div className="flex gap-3 pt-4 mt-2 border-t-2 border-black/10">
              <Button
                variant="destructive"
                className="flex-1 bg-red-100 hover:bg-red-200 text-red-800 border-2 border-black font-black uppercase text-xs h-10 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] active:shadow-none transition-all cursor-pointer"
                onClick={async () => {
                  await vendorApi.updateStatus(vendor.id.toString(), 'SUSPENDED')
                  fetchVendors()
                }}
              >
                Suspend Vendor
              </Button>
              <Button
                className="flex-1 bg-red-300 hover:bg-red-400 text-black border-2 border-black font-black uppercase text-xs h-10 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] active:shadow-none transition-all cursor-pointer gap-2"
                onClick={() => setPendingAction({ vendor, type: 'ban' })}
              >
                <XCircle className="w-4 h-4" />
                Ban Vendor
              </Button>
            </div>
          )}
          {vendor.status === 'SUSPENDED' && (
            <div className="flex gap-3 pt-4 mt-2 border-t-2 border-black/10">
              <Button
                className="flex-1 bg-blue-300 hover:bg-blue-400 text-black border-2 border-black font-black uppercase text-xs h-10 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] active:shadow-none transition-all cursor-pointer gap-2"
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
            <div className="flex gap-3 pt-4 mt-2 border-t-2 border-black/10">
              <Button
                className="flex-1 bg-blue-300 hover:bg-blue-400 text-black border-2 border-black font-black uppercase text-xs h-10 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] active:shadow-none transition-all cursor-pointer gap-2"
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
        className="border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] active:shadow-none hover:bg-red-50 text-red-600 hover:text-red-700 h-9 w-9 p-0 flex items-center justify-center cursor-pointer"
        onClick={() => setPendingAction({ vendor, type: 'delete' })}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-6xl mx-auto pb-10 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-black uppercase tracking-tight">Vendor Management</h1>
          <p className="text-xs sm:text-sm font-bold text-black/60 mt-1">Manage and monitor all vendors on the platform</p>
        </div>
      </div>

      <div className="bg-[#fffaf4] rounded-2xl border-3 border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by vendor name or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-2 border-black rounded-xl h-11 bg-white focus-visible:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 transition-all font-bold placeholder:text-gray-400 text-xs sm:text-sm"
            />
          </div>
          <select
            className="h-11 border-2 border-black rounded-xl px-4 text-xs sm:text-sm font-black uppercase bg-white cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] outline-none"
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
      </div>

      <div className="bg-[#fffaf4] rounded-2xl border-3 border-black p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="border-b-2 border-black/10 pb-3 mb-4 flex justify-between items-end">
          <div>
            <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-black">All Vendors</h3>
            <p className="text-[10px] sm:text-xs text-black/50 font-bold">{filteredVendors.length} vendors on platform</p>
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-black/15">
                <TableHead className="font-bold text-black uppercase text-xs">Business Name</TableHead>
                <TableHead className="font-bold text-black uppercase text-xs">Owner</TableHead>
                <TableHead className="font-bold text-black uppercase text-xs">Location</TableHead>
                <TableHead className="font-bold text-black uppercase text-xs">Status</TableHead>
                <TableHead className="font-bold text-black uppercase text-xs">Rating</TableHead>
                <TableHead className="font-bold text-black uppercase text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor) => (
                <TableRow key={vendor.id} className="border-b border-black/10 hover:bg-black/5">
                  <TableCell>
                    <div>
                      <p className="font-black text-sm text-black uppercase tracking-tight">{vendor.name}</p>
                      <p className="text-xs font-bold text-black/50">{vendor.email || '—'}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-sm text-black/80">{vendor.owner}</TableCell>
                  <TableCell className="font-bold text-sm text-black/80">{vendor.city}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 border-2 border-black rounded-lg text-[9px] font-black uppercase shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] ${getStatusColor(vendor.status)}`}>
                      {vendor.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {vendor.rating > 0 ? (
                      <span className="font-black text-amber-600 text-sm">★ {vendor.rating}/5</span>
                    ) : (
                      <span className="text-black/40 font-bold">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {renderActions(vendor)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="md:hidden space-y-4">
          {filteredVendors.map((vendor) => (
            <div 
              key={vendor.id} 
              className="bg-white border-2 border-black rounded-xl p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-black text-sm text-black uppercase tracking-tight">{vendor.name}</h4>
                  <p className="text-[10px] font-bold text-black/50">{vendor.email || '—'}</p>
                </div>
                <span className={`px-2 py-0.5 border-2 border-black rounded-lg text-[9px] font-black uppercase shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] ${getStatusColor(vendor.status)}`}>
                  {vendor.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold border-t border-black/5 pt-2">
                <div>
                  <p className="text-[9px] text-black/40 font-black uppercase">Owner</p>
                  <p className="text-black font-bold">{vendor.owner}</p>
                </div>
                <div>
                  <p className="text-[9px] text-black/40 font-black uppercase">Location</p>
                  <p className="text-black font-bold">{vendor.city}</p>
                </div>
                <div>
                  <p className="text-[9px] text-black/40 font-black uppercase">Rating</p>
                  <p className="text-black font-bold">{vendor.rating > 0 ? `★ ${vendor.rating}` : '—'}</p>
                </div>
                <div>
                  <p className="text-[9px] text-black/40 font-black uppercase">Joined</p>
                  <p className="text-black font-bold">{vendor.joined}</p>
                </div>
              </div>

              <div className="flex justify-end border-t border-black/5 pt-3">
                {renderActions(vendor)}
              </div>
            </div>
          ))}
        </div>
      </div>

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
