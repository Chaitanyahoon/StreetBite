'use client'

import { useState, useEffect } from 'react'
import { reportApi } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface Report {
    id: number
    reporterId: number
    reportedId: number
    type: string
    reason: string
    status: string
    createdAt: string
}

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)

    const fetchReports = async () => {
        try {
            setLoading(true)
            const data = await reportApi.getAll()
            setReports(data)
        } catch (err) {
            console.error('Failed to fetch reports', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchReports()
    }, [])

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await reportApi.updateStatus(id.toString(), status)
            fetchReports()
        } catch (err) {
            console.error('Failed to update report status', err)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-700'
            case 'RESOLVED': return 'bg-emerald-100 text-emerald-700'
            case 'DISMISSED': return 'bg-gray-100 text-gray-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Reports & Issues</h1>
                    <p className="text-muted-foreground mt-1">Manage user and vendor reports</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Reports</CardTitle>
                    <CardDescription>{reports.length} total reports</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Reporter ID</TableHead>
                                    <TableHead>Reported ID</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reports.map((report) => (
                                    <TableRow key={report.id}>
                                        <TableCell>#{report.id}</TableCell>
                                        <TableCell>
                                            <span className="font-medium">{report.type}</span>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate" title={report.reason}>
                                            {report.reason}
                                        </TableCell>
                                        <TableCell>{report.reporterId}</TableCell>
                                        <TableCell>{report.reportedId}</TableCell>
                                        <TableCell>{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                                                {report.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {report.status === 'PENDING' && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="bg-emerald-600 hover:bg-emerald-700 h-8 px-2"
                                                        onClick={() => handleStatusUpdate(report.id, 'RESOLVED')}
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-1" /> Resolve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 px-2"
                                                        onClick={() => handleStatusUpdate(report.id, 'DISMISSED')}
                                                    >
                                                        <XCircle className="w-4 h-4 mr-1" /> Dismiss
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {reports.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            No reports found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
