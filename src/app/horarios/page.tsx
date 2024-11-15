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
import config from '@/utils/config'

interface Schedule {
  id: string
  personalId: string
  personalNombre: string
  dia: string
  horaInicio: string
  horaFin: string
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [error, setError] = useState('')
  const [staff, setStaff] = useState<{ id: string; nombre: string }[]>([])
  const router = useRouter()

  const fetchSchedules = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      const response = await fetch(`${config.API_URL}/api/horarios`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setSchedules(data)
      } else {
        setError('Error al cargar horarios')
      }
    } catch (error) {
      console.error('Error fetching schedules:', error)
      setError('Error de conexión')
    }
  }, [router])

  const fetchStaff = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_URL}/api/personal`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data: Array<{ id: string; nombre: string; apellido: string }> = await response.json()
        setStaff(data.map((person) => ({ id: person.id, nombre: `${person.nombre} ${person.apellido}` })))
      } else {
        setError('Error al cargar personal')
      }
    } catch (error) {
      console.error('Error fetching staff:', error)
      setError('Error de conexión')
    }
  }, [])

  useEffect(() => {
    fetchSchedules()
    fetchStaff()
  }, [fetchSchedules, fetchStaff])

  const handleViewDetails = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_URL}/api/horarios/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setSelectedSchedule(data)
        setIsDialogOpen(true)
        setIsEditMode(false)
      } else {
        setError('Error al obtener detalles del horario')
      }
    } catch (error) {
      console.error('Error fetching schedule details:', error)
      setError('Error de conexión')
    }
  }

  const handleCreate = () => {
    setSelectedSchedule({
      id: '',
      personalId: '',
      personalNombre: '',
      dia: '',
      horaInicio: '',
      horaFin: ''
    })
    setIsDialogOpen(true)
    setIsEditMode(true)
  }

  const handleEdit = (schedule: Schedule) => {
    setSelectedSchedule(schedule)
    setIsDialogOpen(true)
    setIsEditMode(true)
  }

  const handleSave = async () => {
    if (!selectedSchedule) return
    try {
      const token = localStorage.getItem('token')
      const method = selectedSchedule.id ? 'PUT' : 'POST'
      const url = selectedSchedule.id 
        ? `${config.API_URL}/api/horarios/${selectedSchedule.id}`
        : `${config.API_URL}/api/horarios`
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedSchedule)
      })
      if (response.ok) {
        setIsDialogOpen(false)
        fetchSchedules()
      } else {
        setError(selectedSchedule.id ? 'Error al actualizar horario' : 'Error al crear horario')
      }
    } catch (error) {
      console.error('Error saving schedule:', error)
      setError('Error de conexión')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_URL}/api/horarios/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        fetchSchedules()
      } else {
        setError('Error al eliminar horario')
      }
    } catch (error) {
      console.error('Error deleting schedule:', error)
      setError('Error de conexión')
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Horarios</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-4" role="alert">{error}</p>}
          <Button onClick={handleCreate} className="mb-4">Crear Nuevo Horario</Button>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Personal</TableHead>
                <TableHead>Día</TableHead>
                <TableHead>Hora Inicio</TableHead>
                <TableHead>Hora Fin</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>{schedule.personalNombre}</TableCell>
                  <TableCell>{schedule.dia}</TableCell>
                  <TableCell>{schedule.horaInicio}</TableCell>
                  <TableCell>{schedule.horaFin}</TableCell>
                  <TableCell>
                    <Button variant="outline" className="mr-2" onClick={() => handleViewDetails(schedule.id)}>
                      Ver
                    </Button>
                    <Button variant="outline" className="mr-2" onClick={() => handleEdit(schedule)}>
                      Editar
                    </Button>
                    <Button variant="destructive" onClick={() => handleDelete(schedule.id)}>
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
            <DialogTitle>{isEditMode ? (selectedSchedule?.id ? 'Editar Horario' : 'Crear Horario') : 'Detalles del Horario'}</DialogTitle>
          </DialogHeader>
          {selectedSchedule && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="personal" className="text-right">
                  Personal
                </Label>
                <Select
                  disabled={!isEditMode}
                  value={selectedSchedule.personalId}
                  onValueChange={(value) => setSelectedSchedule({ ...selectedSchedule, personalId: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona un miembro del personal" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((person) => (
                      <SelectItem key={person.id} value={person.id}>{person.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dia" className="text-right">
                  Día
                </Label>
                <Select
                  disabled={!isEditMode}
                  value={selectedSchedule.dia}
                  onValueChange={(value) => setSelectedSchedule({ ...selectedSchedule, dia: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona un día" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lunes">Lunes</SelectItem>
                    <SelectItem value="Martes">Martes</SelectItem>
                    <SelectItem value="Miércoles">Miércoles</SelectItem>
                    <SelectItem value="Jueves">Jueves</SelectItem>
                    <SelectItem value="Viernes">Viernes</SelectItem>
                    <SelectItem value="Sábado">Sábado</SelectItem>
                    <SelectItem value="Domingo">Domingo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="horaInicio" className="text-right">
                  Hora de Inicio
                </Label>
                <Input
                  id="horaInicio"
                  type="time"
                  value={selectedSchedule.horaInicio}
                  onChange={(e) => setSelectedSchedule({ ...selectedSchedule, horaInicio: e.target.value })}
                  className="col-span-3"
                  disabled={!isEditMode}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="horaFin" className="text-right">
                  Hora de Fin
                </Label>
                <Input
                  id="horaFin"
                  type="time"
                  value={selectedSchedule.horaFin}
                  onChange={(e) => setSelectedSchedule({ ...selectedSchedule, horaFin: e.target.value })}
                  className="col-span-3"
                  disabled={!isEditMode}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            {isEditMode && (
              <Button onClick={handleSave}>
                {selectedSchedule?.id ? 'Guardar Cambios' : 'Crear Horario'}
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