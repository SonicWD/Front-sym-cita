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
// import { Calendar } from "@/components/ui/calendar"
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import config from '@/utils/config'

interface Appointment {
  id: string
  pacienteId: string
  pacienteNombre: string
  medicoId: string
  medicoNombre: string
  fecha: string
  hora: string
  motivo: string
  estado: 'Programada' | 'Completada' | 'Cancelada'
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [error, setError] = useState('')
  const [patients, setPatients] = useState<{ id: string; nombre: string }[]>([])
  const [doctors, setDoctors] = useState<{ id: string; nombre: string }[]>([])
  const router = useRouter()

  const fetchAppointments = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      const response = await fetch(`${config.API_URL}/api/citas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setAppointments(data)
      } else {
        setError('Error al cargar citas')
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
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
    fetchAppointments()
    fetchPatients()
    fetchDoctors()
  }, [fetchAppointments, fetchPatients, fetchDoctors])

  const handleViewDetails = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_URL}/api/citas/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setSelectedAppointment(data)
        setIsDialogOpen(true)
        setIsEditMode(false)
      } else {
        setError('Error al obtener detalles de la cita')
      }
    } catch (error) {
      console.error('Error fetching appointment details:', error)
      setError('Error de conexión')
    }
  }

  const handleCreate = () => {
    setSelectedAppointment({
      id: '',
      pacienteId: '',
      pacienteNombre: '',
      medicoId: '',
      medicoNombre: '',
      fecha: '',
      hora: '',
      motivo: '',
      estado: 'Programada'
    })
    setIsDialogOpen(true)
    setIsEditMode(true)
  }

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsDialogOpen(true)
    setIsEditMode(true)
  }

  const handleSave = async () => {
    if (!selectedAppointment) return
    try {
      const token = localStorage.getItem('token')
      const method = selectedAppointment.id ? 'PUT' : 'POST'
      const url = selectedAppointment.id 
        ? `${config.API_URL}/api/citas/${selectedAppointment.id}`
        : `${config.API_URL}/api/citas`
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedAppointment)
      })
      if (response.ok) {
        setIsDialogOpen(false)
        fetchAppointments()
      } else {
        setError(selectedAppointment.id ? 'Error al actualizar cita' : 'Error al crear cita')
      }
    } catch (error) {
      console.error('Error saving appointment:', error)
      setError('Error de conexión')
    }
  }

  const handleCancel = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_URL}/api/citas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        fetchAppointments()
      } else {
        setError('Error al cancelar cita')
      }
    } catch (error) {
      console.error('Error canceling appointment:', error)
      setError('Error de conexión')
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Citas</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <Button onClick={handleCreate} className="mb-4">Crear Nueva Cita</Button>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Médico</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{appointment.pacienteNombre}</TableCell>
                  <TableCell>{appointment.medicoNombre}</TableCell>
                  <TableCell>{format(parseISO(appointment.fecha), 'dd/MM/yyyy', { locale: es })}</TableCell>
                  <TableCell>{appointment.hora}</TableCell>
                  <TableCell>{appointment.estado}</TableCell>
                  <TableCell>
                    <Button variant="outline" className="mr-2" onClick={() => handleViewDetails(appointment.id)}>
                      Ver
                    </Button>
                    <Button variant="outline" className="mr-2" onClick={() => handleEdit(appointment)}>
                      Editar
                    </Button>
                    <Button variant="destructive" onClick={() => handleCancel(appointment.id)}>
                      Cancelar
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
            <DialogTitle>{isEditMode ? (selectedAppointment?.id ? 'Editar Cita' : 'Crear Cita') : 'Detalles de la Cita'}</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paciente" className="text-right">
                  Paciente
                </Label>
                <Select
                  disabled={!isEditMode}
                  value={selectedAppointment.pacienteId}
                  onValueChange={(value) => setSelectedAppointment({ ...selectedAppointment, pacienteId: value })}
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
                  value={selectedAppointment.medicoId}
                  onValueChange={(value) => setSelectedAppointment({ ...selectedAppointment, medicoId: value })}
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
                <Label htmlFor="fecha" className="text-right">
                  Fecha
                </Label>
                <Input
                  id="fecha"
                  type="date"
                  value={selectedAppointment.fecha ? selectedAppointment.fecha.split('T')[0] : ''}
                  onChange={(e) => setSelectedAppointment({ ...selectedAppointment, fecha: e.target.value })}
                  className="col-span-3"
                  disabled={!isEditMode}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="hora" className="text-right">
                  Hora
                </Label>
                <Input
                  id="hora"
                  type="time"
                  value={selectedAppointment.hora}
                  onChange={(e) => setSelectedAppointment({ ...selectedAppointment, hora: e.target.value })}
                  className="col-span-3"
                  disabled={!isEditMode}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="motivo" className="text-right">
                  Motivo
                </Label>
                <Input
                  id="motivo"
                  value={selectedAppointment.motivo}
                  onChange={(e) => setSelectedAppointment({ ...selectedAppointment, motivo: e.target.value })}
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
                  value={selectedAppointment.estado}
                  onValueChange={(value: 'Programada' | 'Completada' | 'Cancelada') => setSelectedAppointment({ ...selectedAppointment, estado: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Programada">Programada</SelectItem>
                    <SelectItem value="Completada">Completada</SelectItem>
                    <SelectItem value="Cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            {isEditMode && (
              <Button onClick={handleSave}>
                {selectedAppointment?.id ? 'Guardar Cambios' : 'Crear Cita'}
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