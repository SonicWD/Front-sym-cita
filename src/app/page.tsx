'use client'

import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { LogOut, Users, UserPlus, Stethoscope, Calendar, FileText, Pill, Clipboard, TestTube, CreditCard, Clock } from 'lucide-react'
import { useEffect } from 'react'

export default function DashboardPage() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  const menuItems = [
    { title: 'Usuarios', description: 'Gestionar usuarios del sistema', icon: Users, path: '/users' },
    { title: 'Pacientes', description: 'Administrar información de pacientes', icon: UserPlus, path: '/pacientes' },
    { title: 'Personal', description: 'Gestionar personal médico', icon: Stethoscope, path: '/personal' },
    { title: 'Citas', description: 'Agendar y gestionar citas médicas', icon: Calendar, path: '/citas' },
    { title: 'Diagnósticos', description: 'Registrar y consultar diagnósticos', icon: FileText, path: '/diagnosticos' },
    { title: 'Tratamientos', description: 'Administrar tratamientos médicos', icon: Pill, path: '/tratamientos' },
    { title: 'Medicamentos', description: 'Gestionar inventario de medicamentos', icon: Pill, path: '/medicamentos' },
    { title: 'Recetas', description: 'Crear y gestionar recetas médicas', icon: Clipboard, path: '/recetas' },
    { title: 'Exámenes', description: 'Administrar exámenes médicos', icon: TestTube, path: '/examenes' },
    { title: 'Facturación', description: 'Gestionar facturación de servicios', icon: CreditCard, path: '/facturacion' },
    { title: 'Horarios', description: 'Administrar horarios del personal', icon: Clock, path: '/horarios' },
  ]

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Sistema de Gestión Médica
          </h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
          </Button>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map((item, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <item.icon className="mr-2 h-6 w-6" />
                      {item.title}
                    </CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={() => router.push(item.path)}>
                      Acceder
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}