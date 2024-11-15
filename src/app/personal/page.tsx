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

interface StaffMember {
  id: string
  nombre: string
  apellido: string
  especialidad: string
  email: string
  telefono: string
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const fetchStaff = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      const response = await fetch(`${config.API_URL}/api/personal`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setStaff(data)
      } else {
        setError('Error al cargar personal')
      }
    } catch (error) {
      console.error('Error fetching staff:', error)
      setError('Error de conexión')
    }
  }, [router])

  useEffect(() => {
    fetchStaff()
  }, [fetchStaff])

  const handleViewDetails = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_URL}/api/personal/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setSelectedStaff(data)
        setIsDialogOpen(true)
        setIsEditMode(false)
      } else {
        setError('Error al obtener detalles del personal')
      }
    } catch (error) {
      console.error('Error fetching staff details:', error)
      setError('Error de conexión')
    }
  }

  const handleCreate = () => {
    setSelectedStaff({
      id: '',
      nombre: '',
      apellido: '',
      especialidad: '',
      email: '',
      telefono: ''
    })
    setIsDialogOpen(true)
    setIsEditMode(true)
  }

  const handleEdit = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember)
    setIsDialogOpen(true)
    setIsEditMode(true)
  }

  const handleSave = async () => {
    if (!selectedStaff) return
    try {
      const token = localStorage.getItem('token')
      const method = selectedStaff.id ? 'PUT' : 'POST'
      const url = selectedStaff.id 
        ? `${config.API_URL}/api/personal/${selectedStaff.id}`
        : `${config.API_URL}/api/personal`
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedStaff)
      })
      if (response.ok) {
        setIsDialogOpen(false)
        fetchStaff()
      } else {
        setError(selectedStaff.id ? 'Error al actualizar personal' : 'Error al crear personal')
      }
    } catch (error) {
      console.error('Error saving staff:', error)
      setError('Error de conexión')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_URL}/api/personal/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        fetchStaff()
      } else {
        setError('Error al eliminar personal')
      }
    } catch (error) {
      console.error('Error deleting staff:', error)
      setError('Error de conexión')
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Personal</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <Button onClick={handleCreate} className="mb-4">Crear Nuevo Personal</Button>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Apellido</TableHead>
                <TableHead>Especialidad</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((staffMember) => (
                <TableRow key={staffMember.id}>
                  <TableCell>{staffMember.nombre}</TableCell>
                  <TableCell>{staffMember.apellido}</TableCell>
                  <TableCell>{staffMember.especialidad}</TableCell>
                  <TableCell>{staffMember.email}</TableCell>
                  <TableCell>
                    <Button variant="outline" className="mr-2" onClick={() => handleViewDetails(staffMember.id)}>
                      Ver
                    </Button>
                    <Button variant="outline" className="mr-2" onClick={() => handleEdit(staffMember)}>
                      Editar
                    </Button>
                    <Button variant="destructive" onClick={() => handleDelete(staffMember.id)}>
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
            <DialogTitle>{isEditMode ? (selectedStaff?.id ? 'Editar Personal' : 'Crear Personal') : 'Detalles del Personal'}</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nombre" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="nombre"
                  value={selectedStaff.nombre}
                  onChange={(e) => setSelectedStaff({ ...selectedStaff, nombre: e.target.value })}
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
                  value={selectedStaff.apellido}
                  onChange={(e) => setSelectedStaff({ ...selectedStaff, apellido: e.target.value })}
                  className="col-span-3"
                  disabled={!isEditMode}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="especialidad" className="text-right">
                  Especialidad
                </Label>
                <Select
                  disabled={!isEditMode}
                  value={selectedStaff.especialidad}
                  onValueChange={(value) => setSelectedStaff({ ...selectedStaff, especialidad: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona una especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Médico General">Médico General</SelectItem>
                    <SelectItem value="Pediatra">Pediatra</SelectItem>
                    <SelectItem value="Cardiólogo">Cardiólogo</SelectItem>
                    <SelectItem value="Dermatólogo">Dermatólogo</SelectItem>
                    <SelectItem value="Ginecólogo">Ginecólogo</SelectItem>
                    <SelectItem value="Oftalmólogo">Oftalmólogo</SelectItem>
                    <SelectItem value="Psiquiatra">Psiquiatra</SelectItem>
                    <SelectItem value="Cirujano">Cirujano</SelectItem>
                    <SelectItem value="Enfermero">Enfermero</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={selectedStaff.email}
                  onChange={(e) => setSelectedStaff({ ...selectedStaff, email: e.target.value })}
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
                  value={selectedStaff.telefono}
                  onChange={(e) => setSelectedStaff({ ...selectedStaff, telefono: e.target.value })}
                  className="col-span-3"
                  disabled={!isEditMode}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            {isEditMode && (
              <Button onClick={handleSave}>
                {selectedStaff?.id ? 'Guardar Cambios' : 'Crear Personal'}
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