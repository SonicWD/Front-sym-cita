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

interface Exam {
  id: string
  pacienteId: string
  pacienteNombre: string
  medicoId: string
  medicoNombre: string
  fecha: string
  tipo: string
  resultados: string
  observaciones: string
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [error, setError] = useState('')
  const [patients, setPatients] = useState<{ id: string; nombre: string }[]>([])
  const [doctors, setDoctors] = useState<{ id: string; nombre: string }[]>([])
  const router = useRouter()

  const fetchExams = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      const response = await fetch(`${config.API_URL}/api/examenes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setExams(data)
      } else {
        setError('Error al cargar exámenes')
      }
    } catch (error) {
      console.error('Error fetching exams:', error)
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
    fetchExams()
    fetchPatients()
    fetchDoctors()
  }, [fetchExams, fetchPatients, fetchDoctors])

  const handleViewDetails = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_URL}/api/examenes/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setSelectedExam(data)
        setIsDialogOpen(true)
        setIsEditMode(false)
      } else {
        setError('Error al obtener detalles del examen')
      }
    } catch (error) {
      console.error('Error fetching exam details:', error)
      setError('Error de conexión')
    }
  }

  const handleCreate = () => {
    setSelectedExam({
      id: '',
      pacienteId: '',
      pacienteNombre: '',
      medicoId: '',
      medicoNombre: '',
      fecha: new Date().toISOString().split('T')[0],
      tipo: '',
      resultados: '',
      observaciones: ''
    })
    setIsDialogOpen(true)
    setIsEditMode(true)
  }

  const handleEdit = (exam: Exam) => {
    setSelectedExam(exam)
    setIsDialogOpen(true)
    setIsEditMode(true)
  }

  const handleSave = async () => {
    if (!selectedExam) return
    try {
      const token = localStorage.getItem('token')
      const method = selectedExam.id ? 'PUT' : 'POST'
      const url = selectedExam.id 
        ? `${config.API_URL}/api/examenes/${selectedExam.id}`
        : `${config.API_URL}/api/examenes`
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedExam)
      })
      if (response.ok) {
        setIsDialogOpen(false)
        fetchExams()
      } else {
        setError(selectedExam.id ? 'Error al actualizar examen' : 'Error al crear examen')
      }
    } catch (error) {
      console.error('Error saving exam:', error)
      setError('Error de conexión')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_URL}/api/examenes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        fetchExams()
      } else {
        setError('Error al eliminar examen')
      }
    } catch (error) {
      console.error('Error deleting exam:', error)
      setError('Error de conexión')
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Exámenes</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-4" role="alert">{error}</p>}
          <Button onClick={handleCreate} className="mb-4">Crear Nuevo Examen</Button>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Médico</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell>{exam.pacienteNombre}</TableCell>
                  <TableCell>{exam.medicoNombre}</TableCell>
                  <TableCell>{format(new Date(exam.fecha), 'dd/MM/yyyy', { locale: es })}</TableCell>
                  <TableCell>{exam.tipo}</TableCell>
                  <TableCell>
                    <Button variant="outline" className="mr-2" onClick={() => handleViewDetails(exam.id)}>
                      Ver
                    </Button>
                    <Button variant="outline" className="mr-2" onClick={() => handleEdit(exam)}>
                      Editar
                    </Button>
                    <Button variant="destructive" onClick={() => handleDelete(exam.id)}>
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
            <DialogTitle>{isEditMode ? (selectedExam?.id ? 'Editar Examen' : 'Crear Examen') : 'Detalles del Examen'}</DialogTitle>
          </DialogHeader>
          {selectedExam && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paciente" className="text-right">
                  Paciente
                </Label>
                <Select
                  disabled={!isEditMode}
                  value={selectedExam.pacienteId}
                  onValueChange={(value) => setSelectedExam({ ...selectedExam, pacienteId: value })}
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
                  value={selectedExam.medicoId}
                  onValueChange={(value) => setSelectedExam({ ...selectedExam, medicoId: value })}
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
                  value={selectedExam.fecha}
                  onChange={(e) => setSelectedExam({ ...selectedExam, fecha: e.target.value })}
                  className="col-span-3"
                  disabled={!isEditMode}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tipo" className="text-right">
                  Tipo de Examen
                </Label>
                <Input
                  id="tipo"
                  value={selectedExam.tipo}
                  onChange={(e) => setSelectedExam({ ...selectedExam, tipo: e.target.value })}
                  className="col-span-3"
                  disabled={!isEditMode}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="resultados" className="text-right">
                  Resultados
                </Label>
                <Textarea
                  id="resultados"
                  value={selectedExam.resultados}
                  onChange={(e) => setSelectedExam({ ...selectedExam, resultados: e.target.value })}
                  className="col-span-3"
                  disabled={!isEditMode}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="observaciones" className="text-right">
                  Observaciones
                </Label>
                <Textarea
                  id="observaciones"
                  value={selectedExam.observaciones}
                  onChange={(e) => setSelectedExam({ ...selectedExam, observaciones: e.target.value })}
                  className="col-span-3"
                  disabled={!isEditMode}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            {isEditMode && (
              <Button onClick={handleSave}>
                {selectedExam?.id ? 'Guardar Cambios' : 'Crear Examen'}
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