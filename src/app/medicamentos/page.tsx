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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import config from '@/utils/config'

interface Medication {
  id: string
  nombre: string
  descripcion: string
  dosis: string
  efectosSecundarios: string
  contraindicaciones: string
}

interface InventoryItem {
  id: string
  medicamentoId: string
  medicamentoNombre: string
  cantidad: number
  fechaCaducidad: string
  lote: string
}

export default function MedicationsAndInventoryPage() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null)
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null)
  const [isMedicationDialogOpen, setIsMedicationDialogOpen] = useState(false)
  const [isInventoryDialogOpen, setIsInventoryDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const fetchMedications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
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
  }, [router])

  const fetchInventory = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      const response = await fetch(`${config.API_URL}/api/inventario`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setInventory(data)
      } else {
        setError('Error al cargar inventario')
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
      setError('Error de conexión')
    }
  }, [router])

  useEffect(() => {
    fetchMedications()
    fetchInventory()
  }, [fetchMedications, fetchInventory])

  const handleViewMedicationDetails = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_URL}/api/medicamentos/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setSelectedMedication(data)
        setIsMedicationDialogOpen(true)
        setIsEditMode(false)
      } else {
        setError('Error al obtener detalles del medicamento')
      }
    } catch (error) {
      console.error('Error fetching medication details:', error)
      setError('Error de conexión')
    }
  }

  const handleCreateMedication = () => {
    setSelectedMedication({
      id: '',
      nombre: '',
      descripcion: '',
      dosis: '',
      efectosSecundarios: '',
      contraindicaciones: ''
    })
    setIsMedicationDialogOpen(true)
    setIsEditMode(true)
  }

  const handleEditMedication = (medication: Medication) => {
    setSelectedMedication(medication)
    setIsMedicationDialogOpen(true)
    setIsEditMode(true)
  }

  const handleSaveMedication = async () => {
    if (!selectedMedication) return
    try {
      const token = localStorage.getItem('token')
      const method = selectedMedication.id ? 'PUT' : 'POST'
      const url = selectedMedication.id 
        ? `${config.API_URL}/api/medicamentos/${selectedMedication.id}`
        : `${config.API_URL}/api/medicamentos`
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedMedication)
      })
      if (response.ok) {
        setIsMedicationDialogOpen(false)
        fetchMedications()
      } else {
        setError(selectedMedication.id ? 'Error al actualizar medicamento' : 'Error al crear medicamento')
      }
    } catch (error) {
      console.error('Error saving medication:', error)
      setError('Error de conexión')
    }
  }

  const handleDeleteMedication = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_URL}/api/medicamentos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        fetchMedications()
      } else {
        setError('Error al eliminar medicamento')
      }
    } catch (error) {
      console.error('Error deleting medication:', error)
      setError('Error de conexión')
    }
  }

  const handleCreateInventoryItem = () => {
    setSelectedInventoryItem({
      id: '',
      medicamentoId: '',
      medicamentoNombre: '',
      cantidad: 0,
      fechaCaducidad: '',
      lote: ''
    })
    setIsInventoryDialogOpen(true)
    setIsEditMode(true)
  }

  const handleSaveInventoryItem = async () => {
    if (!selectedInventoryItem) return
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${config.API_URL}/api/inventario`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedInventoryItem)
      })
      if (response.ok) {
        setIsInventoryDialogOpen(false)
        fetchInventory()
      } else {
        setError('Error al crear registro de inventario')
      }
    } catch (error) {
      console.error('Error saving inventory item:', error)
      setError('Error de conexión')
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Tabs defaultValue="medications">
        <TabsList className="mb-4">
          <TabsTrigger value="medications">Medicamentos</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
        </TabsList>
        <TabsContent value="medications">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Medicamentos</CardTitle>
            </CardHeader>
            <CardContent>
              {error && <p className="text-red-500 mb-4" role="alert">{error}</p>}
              <Button onClick={handleCreateMedication} className="mb-4">Crear Nuevo Medicamento</Button>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medications.map((medication) => (
                    <TableRow key={medication.id}>
                      <TableCell>{medication.nombre}</TableCell>
                      <TableCell>{medication.descripcion}</TableCell>
                      <TableCell>
                        <Button variant="outline" className="mr-2" onClick={() => handleViewMedicationDetails(medication.id)}>
                          Ver
                        </Button>
                        <Button variant="outline" className="mr-2" onClick={() => handleEditMedication(medication)}>
                          Editar
                        </Button>
                        <Button variant="destructive" onClick={() => handleDeleteMedication(medication.id)}>
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventario de Medicamentos</CardTitle>
            </CardHeader>
            <CardContent>
              {error && <p className="text-red-500 mb-4" role="alert">{error}</p>}
              <Button onClick={handleCreateInventoryItem} className="mb-4">Añadir al Inventario</Button>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicamento</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Fecha de Caducidad</TableHead>
                    <TableHead>Lote</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.medicamentoNombre}</TableCell>
                      <TableCell>{item.cantidad}</TableCell>
                      <TableCell>{new Date(item.fechaCaducidad).toLocaleDateString()}</TableCell>
                      <TableCell>{item.lote}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isMedicationDialogOpen} onOpenChange={setIsMedicationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? (selectedMedication?.id ? 'Editar Medicamento' : 'Crear Medicamento') : 'Detalles del Medicamento'}</DialogTitle>
          </DialogHeader>
          {selectedMedication && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nombre" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="nombre"
                  value={selectedMedication.nombre}
                  onChange={(e) => setSelectedMedication({ ...selectedMedication, nombre: e.target.value })}
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
                  value={selectedMedication.descripcion}
                  onChange={(e) => setSelectedMedication({ ...selectedMedication, descripcion: e.target.value })}
                  className="col-span-3"
                  disabled={!isEditMode}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dosis" className="text-right">
                  Dosis
                </Label>
                <Input
                  id="dosis"
                  value={selectedMedication.dosis}
                  onChange={(e) => setSelectedMedication({ ...selectedMedication, dosis: e.target.value })}
                  className="col-span-3"
                  disabled={!isEditMode}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="efectosSecundarios" className="text-right">
                  Efectos Secundarios
                </Label>
                <Textarea
                  id="efectosSecundarios"
                  value={selectedMedication.efectosSecundarios}
                  onChange={(e) => setSelectedMedication({ ...selectedMedication, efectosSecundarios: e.target.value })}
                  className="col-span-3"
                  disabled={!isEditMode}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contraindicaciones" className="text-right">
                  Contraindicaciones
                </Label>
                <Textarea
                  id="contraindicaciones"
                  value={selectedMedication.contraindicaciones}
                  onChange={(e) => setSelectedMedication({ ...selectedMedication, contraindicaciones: e.target.value })}
                  className="col-span-3"
                  disabled={!isEditMode}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            {isEditMode && (
              <Button onClick={handleSaveMedication}>
                {selectedMedication?.id ? 'Guardar Cambios' : 'Crear Medicamento'}
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsMedicationDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isInventoryDialogOpen} onOpenChange={setIsInventoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir al Inventario</DialogTitle>
          </DialogHeader>
          {selectedInventoryItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="medicamento" className="text-right">
                  Medicamento
                </Label>
                <Select
                  value={selectedInventoryItem.medicamentoId}
                  onValueChange={(value) => setSelectedInventoryItem({ ...selectedInventoryItem, medicamentoId: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona un medicamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {medications.map((medication) => (
                      <SelectItem key={medication.id} value={medication.id}>{medication.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cantidad" className="text-right">
                  Cantidad
                </Label>
                <Input
                  id="cantidad"
                  type="number"
                  value={selectedInventoryItem.cantidad}
                  onChange={(e) => setSelectedInventoryItem({ ...selectedInventoryItem, cantidad: parseInt(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fechaCaducidad" className="text-right">
                  Fecha de Caducidad
                </Label>
                <Input
                  id="fechaCaducidad"
                  type="date"
                  value={selectedInventoryItem.fechaCaducidad}
                  onChange={(e) => setSelectedInventoryItem({ ...selectedInventoryItem, fechaCaducidad: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lote" className="text-right">
                  Lote
                </Label>
                <Input
                  id="lote"
                  value={selectedInventoryItem.lote}
                  onChange={(e) => setSelectedInventoryItem({ ...selectedInventoryItem, lote: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleSaveInventoryItem}>
              Añadir al Inventario
            </Button>
            <Button variant="outline" onClick={() => setIsInventoryDialogOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}