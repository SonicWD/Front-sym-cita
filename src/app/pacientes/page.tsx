'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import config from '@/utils/config'

interface Patient {
  id: string
  nombre: string
  apellido: string
  fechaNacimiento: string
  telefono: string
  email: string
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const fetchPatients = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      const response = await fetch(`${config.API_URL}/api/pacientes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setPatients(data)
      } else {
        setError('Error al cargar pacientes')
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
      setError('Error de conexión')
    }
  }, [router])

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  const handleViewDetails = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_URL}/api/pacientes/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setSelectedPatient(data)
        setIsDialogOpen(true)
        setIsEditMode(false)
      } else {
        setError('Error al obtener detalles del paciente')
      }
    } catch (error) {
      console.error('Error fetching patient details:', error)
      setError('Error de conexión')
    }
  }

  const handleCreate = () => {
    setSelectedPatient({
      id: '',
      nombre: '',
      apellido: '',
      fechaNacimiento: '',
      telefono: '',
      email: ''
    })
    setIsDialogOpen(true)
    setIsEditMode(true)
  }

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsDialogOpen(true)
    setIsEditMode(true)
  }

  const handleSave = async () => {
    if (!selectedPatient) return
    try {
      const token = localStorage.getItem('token')
      const method = selectedPatient.id ? 'PUT' : 'POST'
      const url = selectedPatient.id 
        ? `${config.API_URL}/api/pacientes/${selectedPatient.id}`
        : `${config.API_URL}/api/pacientes`
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedPatient)
      })
      if (response.ok) {
        setIsDialogOpen(false)
        fetchPatients()
      } else {
        setError(selectedPatient.id ? 'Error al actualizar paciente' : 'Error al crear paciente')
      }
    } catch (error) {
      console.error('Error saving patient:', error)
      setError('Error de conexión')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_URL}/api/pacientes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        fetchPatients()
      } else {
        setError('Error al eliminar paciente')
      }
    } catch (error) {
      console.error('Error deleting patient:', error)
      setError('Error de conexión')
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Pacientes</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <Button onClick={handleCreate} className="mb-4">Crear Nuevo Paciente</Button>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Apellido</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>{patient.nombre}</TableCell>
                  <TableCell>{patient.apellido}</TableCell>
                  <TableCell>{patient.email}</TableCell>
                  <TableCell>
                    <Button variant="outline" className="mr-2" onClick={() => handleViewDetails(patient.id)}>
                      Ver
                    </Button>
                    <Button variant="outline" className="mr-2" onClick={() => handleEdit(patient)}>
                      Editar
                    </Button>
                    <Button variant="destructive" onClick={() => handleDelete(patient.id)}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? (selectedPatient?.id ? 'Editar Paciente' : 'Crear Paciente') : 'Detalles del Paciente'}</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nombre" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="nombre"
                  value={selectedPatient.nombre}
                  onChange={(e) => setSelectedPatient({ ...selectedPatient, nombre: e.target.value })}
                  className="col-span-3"
                  disabled={!isEditMode}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="apellido" className="text-right">
                  Apellido
                </Label>
                <Input
                  id="apellido"
                  value={selectedPatient.apellido}
                  onChange={(e) => setSelectedPatient({ ...selectedPatient, apellido: e.target.value })}
                  className="col-span-3"
                  disabled={!isEditMode}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fechaNacimiento" className="text-right">
                  Fecha de Nacimiento
                </Label>
                <Input
                  id="fechaNacimiento"
                  type="date"
                  value={selectedPatient.fechaNacimiento}
                  onChange={(e) => setSelectedPatient({ ...selectedPatient, fechaNacimiento: e.target.value })}
                  className="col-span-3"
                  disabled={!isEditMode}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="telefono" className="text-right">
                  Teléfono
                </Label>
                <Input
                  id="telefono"
                  value={selectedPatient.telefono}
                  onChange={(e) => setSelectedPatient({ ...selectedPatient, telefono: e.target.value })}
                  className="col-span-3"
                  disabled={!isEditMode}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={selectedPatient.email}
                  onChange={(e) => setSelectedPatient({ ...selectedPatient, email: e.target.value })}
                  className="col-span-3"
                  disabled={!isEditMode}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            {isEditMode && (
              <Button onClick={handleSave}>
                {selectedPatient?.id ? 'Guardar Cambios' : 'Crear Paciente'}
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