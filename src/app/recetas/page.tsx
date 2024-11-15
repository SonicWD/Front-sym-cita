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

interface Recipe {
  id: string
  pacienteId: string
  pacienteNombre: string
  medicoId: string
  medicoNombre: string
  fecha: string
  medicamentos: {
    id: string
    nombre: string
    dosis: string
    duracion: string
  }[]
  instrucciones: string
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [error, setError] = useState('')
  const [patients, setPatients] = useState<{ id: string; nombre: string }[]>([])
  const [doctors, setDoctors] = useState<{ id: string; nombre: string }[]>([])
  const [medications, setMedications] = useState<{ id: string; nombre: string }[]>([])
  const router = useRouter()

  const fetchRecipes = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      const response = await fetch(`${config.API_URL}/api/recetas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setRecipes(data)
      } else {
        setError('Error al cargar recetas')
      }
    } catch (error) {
      console.error('Error fetching recipes:', error)
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

  const fetchMedications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_URL}/api/medicamentos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setMedications(data)
      } else {
        setError('Error al cargar medicamentos')
      }
    } catch (error) {
      console.error('Error fetching medications:', error)
      setError('Error de conexión')
    }
  }, [])

  useEffect(() => {
    fetchRecipes()
    fetchPatients()
    fetchDoctors()
    fetchMedications()
  }, [fetchRecipes, fetchPatients, fetchDoctors, fetchMedications])

  const handleViewDetails = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_URL}/api/recetas/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setSelectedRecipe(data)
        setIsDialogOpen(true)
        setIsEditMode(false)
      } else {
        setError('Error al obtener detalles de la receta')
      }
    } catch (error) {
      console.error('Error fetching recipe details:', error)
      setError('Error de conexión')
    }
  }

  const handleCreate = () => {
    setSelectedRecipe({
      id: '',
      pacienteId: '',
      pacienteNombre: '',
      medicoId: '',
      medicoNombre: '',
      fecha: new Date().toISOString().split('T')[0],
      medicamentos: [],
      instrucciones: ''
    })
    setIsDialogOpen(true)
    setIsEditMode(true)
  }

  const handleEdit = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    setIsDialogOpen(true)
    setIsEditMode(true)
  }

  const handleSave = async () => {
    if (!selectedRecipe) return
    try {
      const token = localStorage.getItem('token')
      const method = selectedRecipe.id ? 'PUT' : 'POST'
      const url = selectedRecipe.id 
        ? `${config.API_URL}/api/recetas/${selectedRecipe.id}`
        : `${config.API_URL}/api/recetas`
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedRecipe)
      })
      if (response.ok) {
        setIsDialogOpen(false)
        fetchRecipes()
      } else {
        setError(selectedRecipe.id ? 'Error al actualizar receta' : 'Error al crear receta')
      }
    } catch (error) {
      console.error('Error saving recipe:', error)
      setError('Error de conexión')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_URL}/api/recetas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        fetchRecipes()
      } else {
        setError('Error al eliminar receta')
      }
    } catch (error) {
      console.error('Error deleting recipe:', error)
      setError('Error de conexión')
    }
  }

  const handleAddMedication = () => {
    if (selectedRecipe) {
      setSelectedRecipe({
        ...selectedRecipe,
        medicamentos: [
          ...selectedRecipe.medicamentos,
          { id: '', nombre: '', dosis: '', duracion: '' }
        ]
      })
    }
  }

  const handleRemoveMedication = (index: number) => {
    if (selectedRecipe) {
      const updatedMedications = [...selectedRecipe.medicamentos]
      updatedMedications.splice(index, 1)
      setSelectedRecipe({
        ...selectedRecipe,
        medicamentos: updatedMedications
      })
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Recetas</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-4" role="alert">{error}</p>}
          <Button onClick={handleCreate} className="mb-4">Crear Nueva Receta</Button>
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
              {recipes.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell>{recipe.pacienteNombre}</TableCell>
                  <TableCell>{recipe.medicoNombre}</TableCell>
                  <TableCell>{format(new Date(recipe.fecha), 'dd/MM/yyyy', { locale: es })}</TableCell>
                  <TableCell>
                    <Button variant="outline" className="mr-2" onClick={() => handleViewDetails(recipe.id)}>
                      Ver
                    </Button>
                    <Button variant="outline" className="mr-2" onClick={() => handleEdit(recipe)}>
                      Editar
                    </Button>
                    <Button variant="destructive" onClick={() => handleDelete(recipe.id)}>
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
            <DialogTitle>{isEditMode ? (selectedRecipe?.id ? 'Editar Receta' : 'Crear Receta') : 'Detalles de la Receta'}</DialogTitle>
          </DialogHeader>
          {selectedRecipe && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paciente" className="text-right">
                  Paciente
                </Label>
                <Select
                  disabled={!isEditMode}
                  value={selectedRecipe.pacienteId}
                  onValueChange={(value) => setSelectedRecipe({ ...selectedRecipe, pacienteId: value })}
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
                  value={selectedRecipe.medicoId}
                  onValueChange={(value) => setSelectedRecipe({ ...selectedRecipe, medicoId: value })}
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
                  value={selectedRecipe.fecha}
                  onChange={(e) => setSelectedRecipe({ ...selectedRecipe, fecha: e.target.value })}
                  className="col-span-3"
                  disabled={!isEditMode}
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right mt-2">
                  Medicamentos
                </Label>
                <div className="col-span-3 space-y-2">
                  {selectedRecipe.medicamentos.map((medicamento, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Select
                        disabled={!isEditMode}
                        value={medicamento.id}
                        onValueChange={(value) => {
                          const updatedMedications = [...selectedRecipe.medicamentos]
                          updatedMedications[index] = { ...medicamento, id: value, nombre: medications.find(m => m.id === value)?.nombre || '' }
                          setSelectedRecipe({ ...selectedRecipe, medicamentos: updatedMedications })
                        }}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Selecciona un medicamento" />
                        </SelectTrigger>
                        <SelectContent>
                          {medications.map((med) => (
                            <SelectItem key={med.id} value={med.id}>{med.nombre}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Dosis"
                        value={medicamento.dosis}
                        onChange={(e) => {
                          const updatedMedications = [...selectedRecipe.medicamentos]
                          updatedMedications[index] = { ...medicamento, dosis: e.target.value }
                setSelectedRecipe({ ...selectedRecipe, medicamentos: updatedMedications })
                        }}
                        disabled={!isEditMode}
                      />
                      <Input
                        placeholder="Duración"
                        value={medicamento.duracion}
                        onChange={(e) => {
                          const updatedMedications = [...selectedRecipe.medicamentos]
                          updatedMedications[index] = { ...medicamento, duracion: e.target.value }
                          setSelectedRecipe({ ...selectedRecipe, medicamentos: updatedMedications })
                        }}
                        disabled={!isEditMode}
                      />
                      {isEditMode && (
                        <Button variant="destructive" onClick={() => handleRemoveMedication(index)}>
                          Eliminar
                        </Button>
                      )}
                    </div>
                  ))}
                  {isEditMode && (
                    <Button onClick={handleAddMedication}>
                      Añadir Medicamento
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="instrucciones" className="text-right">
                  Instrucciones
                </Label>
                <Textarea
                  id="instrucciones"
                  value={selectedRecipe.instrucciones}
                  onChange={(e) => setSelectedRecipe({ ...selectedRecipe, instrucciones: e.target.value })}
                  className="col-span-3"
                  disabled={!isEditMode}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            {isEditMode && (
              <Button onClick={handleSave}>
                {selectedRecipe?.id ? 'Guardar Cambios' : 'Crear Receta'}
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