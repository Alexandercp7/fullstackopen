import { useState, useEffect } from 'react'
import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import servicioDePersonas from './services/persons'
import Notification from './components/Notification'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [nuevoNumero, setNuevoNumero] = useState('')
  const [nuevaBusqueda, setNuevaBusqueda] = useState('')
  const [mensaje, setMensaje] = useState(null)

  useEffect(() => {
    servicioDePersonas.obtenerTodo().then((personasIniciales) => {
      setPersons(personasIniciales)
    })
  }, [])

  const mostrarNotificacion = (texto, tipo) => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 5000)
  }

  const agregarNombre = (evento) => {
    evento.preventDefault()

    const nombreNormalizado = newName.trim()
    const personaExistente = persons.find(
      (p) => p.name.toLowerCase() === nombreNormalizado.toLowerCase()
    )

    if (personaExistente) {
      if (
        window.confirm(
          `${personaExistente.name} ya está agregado a la agenda telefónica, ¿reemplazar el número antiguo por uno nuevo?`
        )
      ) {
        const personaActualizada = {
          ...personaExistente,
          number: nuevoNumero,
        }

        servicioDePersonas
          .actualizar(personaExistente.id, personaActualizada)
          .then((respuesta) => {
            setPersons((prev) =>
              prev.map((p) => (p.id !== respuesta.id ? p : respuesta))
            )
            setNewName('')
            setNuevoNumero('')
            mostrarNotificacion(`Se actualizó el número de ${respuesta.name}`, 'exito')
          })
          .catch(() => {
            mostrarNotificacion(
              `La información de ${personaExistente.name} ya fue eliminada del servidor`,
              'error'
            )
            setPersons((prev) => prev.filter((p) => p.id !== personaExistente.id))
          })
      }
      return
    }

    const objetoNombre = {
      name: nombreNormalizado,
      number: nuevoNumero,
    }

    servicioDePersonas
      .crear(objetoNombre)
      .then((personaCreada) => {
        setPersons((prev) => prev.concat(personaCreada))
        setNewName('')
        setNuevoNumero('')
        mostrarNotificacion(`Se agregó a ${personaCreada.name}`, 'exito')
      })
      .catch((error) => {
        mostrarNotificacion(
          error.response?.data?.error || 'No se pudo crear el contacto.',
          'error'
        )
      })
  }

  const handleEliminar = (id, nombre) => {
    if (window.confirm(`¿Eliminar ${nombre}?`)) {
      servicioDePersonas
        .eliminar(id)
        .then(() => {
          setPersons((prev) => prev.filter((p) => p.id !== id))
        })
        .catch(() => {
          mostrarNotificacion(
            `La persona '${nombre}' ya fue eliminada del servidor.`,
            'error'
          )
          setPersons((prev) => prev.filter((p) => p.id !== id))
        })
    }
  }

  const contactosFiltrados = persons.filter((persona) =>
    persona.name.toLowerCase().includes(nuevaBusqueda.toLowerCase())
  )

  return (
    <div>
      <h2>Agenda Telefónica</h2>
      <Notification mensaje={mensaje} />

      <Filter
        nuevaBusqueda={nuevaBusqueda}
        handleCambioDeBusqueda={(e) => setNuevaBusqueda(e.target.value)}
      />

      <h3>Agregar nuevo contacto</h3>
      <PersonForm
        agregarNombre={agregarNombre}
        newName={newName}
        handleCambioDeNombre={(e) => setNewName(e.target.value)}
        nuevoNumero={nuevoNumero}
        handleCambioDeNumero={(e) => setNuevoNumero(e.target.value)}
      />

      <h3>Números</h3>
      <Persons personas={contactosFiltrados} handleEliminar={handleEliminar} />
    </div>
  )
}

export default App
