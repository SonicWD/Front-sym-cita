'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import config from '@/utils/config'

interface Treatment {
  id: string
  pacienteId: string
  pacienteNombre: string
  medicoId: string
  medicoNombre: string
  fechaInicio: string
  fechaFin: string
  descripcion: string
  estado: 'En curso' | 'Completado' | 'Cancelado'
}

export default function TreatmentsPage() {
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [error, setError] = useState('')
  const [patients, setPatients] = useState<{ id: string; nombre: string }[]>([])
  const [doctors, setDoctors] = useState<{ id: string; nombre: string }[]>([])
  const router = useRouter()

  const fetchTreatments = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      const response = await fetch(`${config.API_URL}/api/tratamientos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setTreatments(data)
      } else {
        setError('Error al cargar tratamientos')
      }
    } catch (error) {
      console.error('Error fetching treatments:', error)
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

  const fetchDoctors = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_URL}/api/personal`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data: Array<{ id: string; nombre: string; apellido: string }> = await response.json()
        setDoctors(data.map((doctor) => ({ id: doctor.id, nombre: `${doctor.nombre} ${doctor.apellido}` })))
      } else {
        setError('Error al cargar médicos')
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
      setError('Error de conexión')
    }
  }, [])

  useEffect(() => {
    fetchTreatments()
    fetchPatients()
    fetchDoctors()
  }, [fetchTreatments, fetchPatients, fetchDoctors])

  const handleViewDetails = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_URL}/api/tratamientos/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setSelectedTreatment(data)
        setIsDialogOpen(true)
        setIsEditMode(false)
      } else {
        setError('Error al obtener detalles del tratamiento')
      }
    } catch (error) {
      console.error('Error fetching treatment details:', error)
      setError('Error de conexión')
    }
  }

  const handleCreate = () => {
    setSelectedTreatment({
      id: '',
      pacienteId: '',
      pacienteNombre: '',
      medicoId: '',
      medicoNombre: '',
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaFin: '',
      descripcion: '',
      estado: 'En curso'
    })
    setIsDialogOpen(true)
    setIsEditMode(true)
  }

  const handleEdit = (treatment: Treatment) => {
    setSelectedTreatment(treatment)
    setIsDialogOpen(true)
    setIsEditMode(true)
  }

  const handleSave = async () => {
    if (!selectedTreatment) return
    try {
      const token = localStorage.getItem('token')
      const method = selectedTreatment.id ? 'PUT' : 'POST'
      const url = selectedTreatment.id 
        ? `${config.API_URL}/api/tratamientos/${selectedTreatment.id}`
        : `${config.API_URL}/api/tratamientos`
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedTreatment)
      })
      if (response.ok) {
        setIsDialogOpen(false)
        fetchTreatments()
      } else {
        setError(selectedTreatment.id ? 'Error al actualizar tratamiento' : 'Error al crear tratamiento')
      }
    } catch (error) {
      console.error('Error saving treatment:', error)
      setError('Error de conexión')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_URL}/api/tratamientos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        fetchTreatments()
      } else {
        setError('Error al eliminar tratamiento')
      }
    } catch (error) {
      console.error('Error deleting treatment:', error)
      setError('Error de conexión')
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Tratamientos</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-4" role="alert">{error}</p>}
          <Button onClick={handleCreate} className="mb-4">Crear Nuevo Tratamiento</Button>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Médico</TableHead>
                <TableHead>Fecha Inicio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {treatments.map((treatment) => (
                <TableRow key={treatment.id}>
                  <TableCell>{treatment.pacienteNombre}</TableCell>
                  <TableCell>{treatment.medicoNombre}</TableCell>
                  <TableCell>{format(new Date(treatment.fechaInicio), 'dd/MM/yyyy', { locale: es })}</TableCell>
                  <TableCell>{treatment.estado}</TableCell>
                  <TableCell>
                    <Button variant="outline" className="mr-2" onClick={() => handleViewDetails(treatment.id)}>
                      Ver
                    </Button>
                    <Button variant="outline" className="mr-2" onClick={() => handleEdit(treatment)}>
                      Editar
                    </Button>
                    <Button variant="destructive" onClick={() => handleDelete(treatment.id)}>
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
            <DialogTitle>{isEditMode ? (selectedTreatment?.id ? 'Editar Tratamiento' : 'Crear Tratamiento') : 'Detalles del Tratamiento'}</DialogTitle>
          </DialogHeader>
          {selectedTreatment && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paciente" className="text-right">
                  Paciente
                </Label>
                <Select
                  disabled={!isEditMode}
                  value={selectedTreatment.pacienteId}
                  onValueChange={(value) => setSelectedTreatment({ ...selectedTreatment, pacienteId: value })}
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
                <Label htmlFor="medico" className="text-right">
                  Médico
                </Label>
                <Select
                  disabled={!isEditMode}
                  value={selectedTreatment.medicoId}
                  onValueChange={(value) => setSelectedTreatment({ ...selectedTreatment, medicoId: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona un médico" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>{doctor.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fechaInicio" className="text-right">
                  Fecha Inicio
                </Label>
                <Input
                  id="fechaInicio"
                  type="date"
                  value={selectedTreatment.fechaInicio}
                  onChange={(e) => setSelectedTreatment({ ...selectedTreatment, fechaInicio: e.target.value })}
                  className="col-span-3"
                  disabled={!isEditMode}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fechaFin" className="text-right">
                  Fecha Fin
                </Label>
                <Input
                  id="fechaFin"
                  type="date"
                  value={selectedTreatment.fechaFin}
                  onChange={(e) => setSelectedTreatment({ ...selectedTreatment, fechaFin: e.target.value })}
                  className="col-span-3"
                  disabled={!isEditMode}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="descripcion" className="text-right">
                  Descripción
                </Label>
                <Textarea
                  id="descripcion"
                  value={selectedTreatment.descripcion}
                  onChange={(e) => setSelectedTreatment({ ...selectedTreatment, descripcion: e.target.value })}
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
                  value={selectedTreatment.estado}
                  onValueChange={(value: 'En curso' | 'Completado' | 'Cancelado') => setSelectedTreatment({ ...selectedTreatment, estado: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="En curso">En curso</SelectItem>
                    <SelectItem value="Completado">Completado</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            {isEditMode && (
              <Button onClick={handleSave}>
                {selectedTreatment?.id ? 'Guardar Cambios' : 'Crear Tratamiento'}
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