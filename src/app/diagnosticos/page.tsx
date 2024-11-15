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

interface Diagnosis {
  id: string
  pacienteId: string
  pacienteNombre: string
  medicoId: string
  medicoNombre: string
  fecha: string
  descripcion: string
  tratamiento: string
}

export default function DiagnosisPage() {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([])
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<Diagnosis | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [error, setError] = useState('')
  const [patients, setPatients] = useState<{ id: string; nombre: string }[]>([])
  const [doctors, setDoctors] = useState<{ id: string; nombre: string }[]>([])
  const router = useRouter()

  const fetchDiagnoses = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/diagnosticos')
        return
      }
      const response = await fetch(`${config.API_URL}/api/diagnosticos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setDiagnoses(data)
      } else {
        setError('Error al cargar diagnósticos')
      }
    } catch (error) {
      console.error('Error fetching diagnoses:', error)
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
    fetchDiagnoses()
    fetchPatients()
    fetchDoctors()
  }, [fetchDiagnoses, fetchPatients, fetchDoctors])

  const handleViewDetails = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_URL}/api/diagnosticos/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setSelectedDiagnosis(data)
        setIsDialogOpen(true)
        setIsEditMode(false)
      } else {
        setError('Error al obtener detalles del diagnóstico')
      }
    } catch (error) {
      console.error('Error fetching diagnosis details:', error)
      setError('Error de conexión')
    }
  }

  const handleCreate = () => {
    setSelectedDiagnosis({
      id: '',
      pacienteId: '',
      pacienteNombre: '',
      medicoId: '',
      medicoNombre: '',
      fecha: new Date().toISOString().split('T')[0],
      descripcion: '',
      tratamiento: ''
    })
    setIsDialogOpen(true)
    setIsEditMode(true)
  }

  const handleEdit = (diagnosis: Diagnosis) => {
    setSelectedDiagnosis(diagnosis)
    setIsDialogOpen(true)
    setIsEditMode(true)
  }

  const handleSave = async () => {
    if (!selectedDiagnosis) return
    try {
      const token = localStorage.getItem('token')
      const method = selectedDiagnosis.id ? 'PUT' : 'POST'
      const url = selectedDiagnosis.id 
        ? `${config.API_URL}/api/diagnosticos/${selectedDiagnosis.id}`
        : `${config.API_URL}/api/diagnosticos`
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedDiagnosis)
      })
      if (response.ok) {
        setIsDialogOpen(false)
        fetchDiagnoses()
      } else {
        setError(selectedDiagnosis.id ? 'Error al actualizar diagnóstico' : 'Error al crear diagnóstico')
      }
    } catch (error) {
      console.error('Error saving diagnosis:', error)
      setError('Error de conexión')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_URL}/api/diagnosticos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        fetchDiagnoses()
      } else {
        setError('Error al eliminar diagnóstico')
      }
    } catch (error) {
      console.error('Error deleting diagnosis:', error)
      setError('Error de conexión')
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Diagnósticos</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <Button onClick={handleCreate} className="mb-4">Crear Nuevo Diagnóstico</Button>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Médico</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {diagnoses.map((diagnosis) => (
                <TableRow key={diagnosis.id}>
                  <TableCell>{diagnosis.pacienteNombre}</TableCell>
                  <TableCell>{diagnosis.medicoNombre}</TableCell>
                  <TableCell>{format(new Date(diagnosis.fecha), 'dd/MM/yyyy', { locale: es })}</TableCell>
                  <TableCell>
                    <Button variant="outline" className="mr-2" onClick={() => handleViewDetails(diagnosis.id)}>
                      Ver
                    </Button>
                    <Button variant="outline" className="mr-2" onClick={() => handleEdit(diagnosis)}>
                      Editar
                    </Button>
                    <Button variant="destructive" onClick={() => handleDelete(diagnosis.id)}>
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
            <DialogTitle>{isEditMode ? (selectedDiagnosis?.id ? 'Editar Diagnóstico' : 'Crear Diagnóstico') : 'Detalles del Diagnóstico'}</DialogTitle>
          </DialogHeader>
          {selectedDiagnosis && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paciente" className="text-right">
                  Paciente
                </Label>
                <Select
                  disabled={!isEditMode}
                  value={selectedDiagnosis.pacienteId}
                  onValueChange={(value) => setSelectedDiagnosis({ ...selectedDiagnosis, pacienteId: value })}
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
                  value={selectedDiagnosis.medicoId}
                  onValueChange={(value) => setSelectedDiagnosis({ ...selectedDiagnosis, medicoId: value })}
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
                  value={selectedDiagnosis.fecha}
                  onChange={(e) => setSelectedDiagnosis({ ...selectedDiagnosis, fecha: e.target.value })}
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
                  value={selectedDiagnosis.descripcion}
                  onChange={(e) => setSelectedDiagnosis({ ...selectedDiagnosis, descripcion: e.target.value })}
                  className="col-span-3"
                  disabled={!isEditMode}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tratamiento" className="text-right">
                  Tratamiento
                </Label>
                <Textarea
                  id="tratamiento"
                  value={selectedDiagnosis.tratamiento}
                  onChange={(e) => setSelectedDiagnosis({ ...selectedDiagnosis, tratamiento: e.target.value })}
                  className="col-span-3"
                  disabled={!isEditMode}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            {isEditMode && (
              <Button onClick={handleSave}>
                {selectedDiagnosis?.id ? 'Guardar Cambios' : 'Crear Diagnóstico'}
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