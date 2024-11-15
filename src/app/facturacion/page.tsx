'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import config from '@/utils/config'

interface Invoice {
  id: string
  pacienteId: string
  pacienteNombre: string
  fecha: string
  monto: number
  estado: 'Pendiente' | 'Pagada' | 'Cancelada'
  detalles: string
}

export default function InvoicePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [error, setError] = useState('')
  const [patients, setPatients] = useState<{ id: string; nombre: string }[]>([])
  const router = useRouter()

  const fetchInvoices = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      const response = await fetch(`${config.API_URL}/api/facturas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setInvoices(data)
      } else {
        setError('Error al cargar facturas')
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
      setError('Error de conexión')
    }
  }, [router])

  const fetchPatients = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_URL}/api/pacientes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data: Array<{ id: string; nombre: string; apellido: string }> = await response.json()
        setPatients(data.map((patient) => ({ id: patient.id, nombre: `${patient.nombre} ${patient.apellido}` })))
      } else {
        setError('Error al cargar pacientes')
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
      setError('Error de conexión')
    }
  }, [])

  useEffect(() => {
    fetchInvoices()
    fetchPatients()
  }, [fetchInvoices, fetchPatients])

  const handleViewDetails = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_URL}/api/facturas/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setSelectedInvoice(data)
        setIsDialogOpen(true)
        setIsEditMode(false)
      } else {
        setError('Error al obtener detalles de la factura')
      }
    } catch (error) {
      console.error('Error fetching invoice details:', error)
      setError('Error de conexión')
    }
  }

  const handleCreate = () => {
    setSelectedInvoice({
      id: '',
      pacienteId: '',
      pacienteNombre: '',
      fecha: new Date().toISOString().split('T')[0],
      monto: 0,
      estado: 'Pendiente',
      detalles: ''
    })
    setIsDialogOpen(true)
    setIsEditMode(true)
  }

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsDialogOpen(true)
    setIsEditMode(true)
  }

  const handleSave = async () => {
    if (!selectedInvoice) return
    try {
      const token = localStorage.getItem('token')
      const method = selectedInvoice.id ? 'PUT' : 'POST'
      const url = selectedInvoice.id 
        ? `${config.API_URL}/api/facturas/${selectedInvoice.id}`
        : `${config.API_URL}/api/facturas`
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedInvoice)
      })
      if (response.ok) {
        setIsDialogOpen(false)
        fetchInvoices()
      } else {
        setError(selectedInvoice.id ? 'Error al actualizar factura' : 'Error al crear factura')
      }
    } catch (error) {
      console.error('Error saving invoice:', error)
      setError('Error de conexión')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_URL}/api/facturas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        fetchInvoices()
      } else {
        setError('Error al eliminar factura')
      }
    } catch (error) {
      console.error('Error deleting invoice:', error)
      setError('Error de conexión')
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Facturación</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-4" role="alert">{error}</p>}
          <Button onClick={handleCreate} className="mb-4">Crear Nueva Factura</Button>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.pacienteNombre}</TableCell>
                  <TableCell>{format(new Date(invoice.fecha), 'dd/MM/yyyy', { locale: es })}</TableCell>
                  <TableCell>${invoice.monto.toFixed(2)}</TableCell>
                  <TableCell>{invoice.estado}</TableCell>
                  <TableCell>
                    <Button variant="outline" className="mr-2" onClick={() => handleViewDetails(invoice.id)}>
                      Ver
                    </Button>
                    <Button variant="outline" className="mr-2" onClick={() => handleEdit(invoice)}>
                      Editar
                    </Button>
                    <Button variant="destructive" onClick={() => handleDelete(invoice.id)}>
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{isEditMode ? (selectedInvoice?.id ? 'Editar Factura' : 'Crear Factura') : 'Detalles de la Factura'}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paciente" className="text-right">
                  Paciente
                </Label>
                <Select
                  disabled={!isEditMode}
                  value={selectedInvoice.pacienteId}
                  onValueChange={(value) => setSelectedInvoice({ ...selectedInvoice, pacienteId: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona un paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>{patient.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fecha" className="text-right">
                  Fecha
                </Label>
                <Input
                  id="fecha"
                  type="date"
                  value={selectedInvoice.fecha}
                  onChange={(e) => setSelectedInvoice({ ...selectedInvoice, fecha: e.target.value })}
                  className="col-span-3"
                  disabled={!isEditMode}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="monto" className="text-right">
                  Monto
                </Label>
                <Input
                  id="monto"
                  type="number"
                  value={selectedInvoice.monto}
                  onChange={(e) => setSelectedInvoice({ ...selectedInvoice, monto: parseFloat(e.target.value) })}
                  className="col-span-3"
                  disabled={!isEditMode}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="estado" className="text-right">
                  Estado
                </Label>
                <Select
                  disabled={!isEditMode}
                  value={selectedInvoice.estado}
                  onValueChange={(value: 'Pendiente' | 'Pagada' | 'Cancelada') => setSelectedInvoice({ ...selectedInvoice, estado: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="Pagada">Pagada</SelectItem>
                    <SelectItem value="Cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="detalles" className="text-right">
                  Detalles
                </Label>
                <Input
                  id="detalles"
                  value={selectedInvoice.detalles}
                  onChange={(e) => setSelectedInvoice({ ...selectedInvoice, detalles: e.target.value })}
                  className="col-span-3"
                  disabled={!isEditMode}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            {isEditMode && (
              <Button onClick={handleSave}>
                {selectedInvoice?.id ? 'Guardar Cambios' : 'Crear Factura'}
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}