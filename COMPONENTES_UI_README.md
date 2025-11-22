# Componentes UI Reutilizables - meskeIA Next.js

Sistema completo de componentes UI para todas las aplicaciones meskeIA Next.js.

---

## 🎨 Componentes Disponibles

### 1. Button (Botón)
### 2. Input (Campo de texto)
### 3. Select (Selector/Dropdown)
### 4. Card (Tarjeta de contenido)
### 5. Modal (Ventana modal/Diálogo)
### 6. Toast (Notificación temporal)

---

## 📦 Instalación y Uso

### Importación

```tsx
// Importar componentes individuales
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card, { CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import Toast, { useToast, ToastContainer } from '@/components/ui/Toast';

// O importar desde el index (recomendado)
import { Button, Input, Select, Card, CardHeader, Modal, Toast, useToast } from '@/components/ui';
```

---

## 1. Button - Botón

### Características
- ✅ 5 variantes: primary, secondary, outline, danger, ghost
- ✅ 3 tamaños: small, medium, large
- ✅ Estado de carga (loading)
- ✅ Soporte para iconos
- ✅ Ancho completo opcional
- ✅ Diseño meskeIA con gradientes

### Uso Básico

```tsx
import { Button } from '@/components/ui';

function MiComponente() {
  return (
    <>
      {/* Botón primario por defecto */}
      <Button onClick={() => console.log('Click')}>
        Guardar
      </Button>

      {/* Variantes */}
      <Button variant="secondary">Cancelar</Button>
      <Button variant="outline">Editar</Button>
      <Button variant="danger">Eliminar</Button>
      <Button variant="ghost">Opciones</Button>

      {/* Tamaños */}
      <Button size="small">Pequeño</Button>
      <Button size="medium">Mediano</Button>
      <Button size="large">Grande</Button>

      {/* Con icono */}
      <Button icon={<span>📁</span>}>
        Abrir archivo
      </Button>

      {/* Estado de carga */}
      <Button loading={true}>
        Guardando...
      </Button>

      {/* Ancho completo */}
      <Button fullWidth>
        Enviar formulario
      </Button>

      {/* Deshabilitado */}
      <Button disabled>
        No disponible
      </Button>
    </>
  );
}
```

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'danger' \| 'ghost'` | `'primary'` | Estilo del botón |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Tamaño del botón |
| `fullWidth` | `boolean` | `false` | Botón ocupa 100% del ancho |
| `loading` | `boolean` | `false` | Muestra spinner de carga |
| `icon` | `React.ReactNode` | - | Icono a mostrar |
| `disabled` | `boolean` | `false` | Deshabilita el botón |

---

## 2. Input - Campo de Texto

### Características
- ✅ Label integrado
- ✅ Mensajes de error
- ✅ Texto de ayuda (helper text)
- ✅ Soporte para iconos
- ✅ Estados de validación
- ✅ Ancho completo opcional

### Uso Básico

```tsx
import { Input } from '@/components/ui';
import { useState } from 'react';

function FormularioEjemplo() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  return (
    <>
      {/* Input básico con label */}
      <Input
        label="Correo electrónico"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
      />

      {/* Con mensaje de error */}
      <Input
        label="Nombre"
        error="Este campo es obligatorio"
        value=""
      />

      {/* Con texto de ayuda */}
      <Input
        label="Contraseña"
        type="password"
        helperText="Mínimo 8 caracteres"
      />

      {/* Con icono */}
      <Input
        label="Buscar"
        icon={<span>🔍</span>}
        placeholder="Buscar aplicaciones..."
      />

      {/* Ancho completo */}
      <Input
        label="Descripción"
        fullWidth
        placeholder="Escribe aquí..."
      />

      {/* Deshabilitado */}
      <Input
        label="Campo bloqueado"
        disabled
        value="No editable"
      />
    </>
  );
}
```

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `label` | `string` | - | Etiqueta del campo |
| `error` | `string` | - | Mensaje de error |
| `helperText` | `string` | - | Texto de ayuda |
| `fullWidth` | `boolean` | `false` | Campo ocupa 100% del ancho |
| `icon` | `React.ReactNode` | - | Icono a mostrar |

---

## 3. Select - Selector/Dropdown

### Características
- ✅ Opciones configurables
- ✅ Label integrado
- ✅ Mensajes de error
- ✅ Texto de ayuda
- ✅ Placeholder personalizado
- ✅ Ancho completo opcional

### Uso Básico

```tsx
import { Select } from '@/components/ui';
import { useState } from 'react';

function FormularioCategoria() {
  const [categoria, setCategoria] = useState('');

  const opciones = [
    { value: 'matematicas', label: 'Matemáticas' },
    { value: 'finanzas', label: 'Finanzas' },
    { value: 'productividad', label: 'Productividad' },
    { value: 'salud', label: 'Salud y Bienestar' },
  ];

  return (
    <>
      {/* Select básico */}
      <Select
        label="Categoría"
        options={opciones}
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        placeholder="Selecciona una categoría"
      />

      {/* Con mensaje de error */}
      <Select
        label="Tipo de cálculo"
        options={opciones}
        error="Debes seleccionar una opción"
      />

      {/* Con texto de ayuda */}
      <Select
        label="Prioridad"
        options={opciones}
        helperText="Selecciona la prioridad del evento"
      />

      {/* Ancho completo */}
      <Select
        label="País"
        options={opciones}
        fullWidth
      />
    </>
  );
}
```

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `label` | `string` | - | Etiqueta del campo |
| `options` | `Array<{ value: string; label: string }>` | `[]` | Opciones del selector |
| `placeholder` | `string` | `'Seleccionar...'` | Texto placeholder |
| `error` | `string` | - | Mensaje de error |
| `helperText` | `string` | - | Texto de ayuda |
| `fullWidth` | `boolean` | `false` | Campo ocupa 100% del ancho |

---

## 4. Card - Tarjeta de Contenido

### Características
- ✅ 3 variantes: default, bordered, elevated
- ✅ 4 tamaños de padding: none, small, medium, large
- ✅ Subcomponentes: CardHeader, CardBody, CardFooter
- ✅ Animaciones hover (en variant elevated)

### Uso Básico

```tsx
import { Card, CardHeader, CardBody, CardFooter, Button } from '@/components/ui';

function TarjetaEjemplo() {
  return (
    <>
      {/* Card básica */}
      <Card>
        <h3>Título de la tarjeta</h3>
        <p>Contenido de la tarjeta...</p>
      </Card>

      {/* Card con variantes */}
      <Card variant="bordered">
        Tarjeta con borde más marcado
      </Card>

      <Card variant="elevated">
        Tarjeta con sombra elevada y hover
      </Card>

      {/* Card con subcomponentes */}
      <Card variant="elevated" padding="large">
        <CardHeader>
          <h3>Calculadora de IMC</h3>
        </CardHeader>
        <CardBody>
          <p>Calcula tu índice de masa corporal...</p>
          {/* Formulario aquí */}
        </CardBody>
        <CardFooter>
          <Button variant="secondary">Cancelar</Button>
          <Button>Calcular</Button>
        </CardFooter>
      </Card>

      {/* Card sin padding */}
      <Card padding="none">
        <img src="/imagen.jpg" alt="Ejemplo" style={{ width: '100%' }} />
        <div style={{ padding: '1rem' }}>
          <h4>Título de la imagen</h4>
        </div>
      </Card>
    </>
  );
}
```

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `'default' \| 'bordered' \| 'elevated'` | `'default'` | Estilo de la tarjeta |
| `padding` | `'none' \| 'small' \| 'medium' \| 'large'` | `'medium'` | Tamaño del padding |

---

## 5. Modal - Ventana Modal/Diálogo

### Características
- ✅ 3 tamaños: small, medium, large
- ✅ Cierre con Escape
- ✅ Cierre al hacer clic fuera (opcional)
- ✅ Botón de cerrar (opcional)
- ✅ Bloqueo de scroll del body
- ✅ Subcomponentes: ModalHeader, ModalBody, ModalFooter
- ✅ Animaciones de entrada/salida

### Uso Básico

```tsx
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from '@/components/ui';
import { useState } from 'react';

function EjemploModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Abrir Modal
      </Button>

      {/* Modal básico con título */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirmar acción"
      >
        <p>¿Estás seguro de que quieres continuar?</p>
      </Modal>

      {/* Modal con subcomponentes y tamaños */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="large"
      >
        <ModalHeader>
          <h2>Configuración avanzada</h2>
        </ModalHeader>
        <ModalBody>
          <p>Contenido del modal...</p>
          {/* Formularios, inputs, etc. */}
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={() => {
            // Lógica de guardar
            setIsOpen(false);
          }}>
            Guardar cambios
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal sin cerrar al hacer clic fuera */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        closeOnOverlayClick={false}
        title="Proceso importante"
      >
        <p>Este modal solo se cierra con el botón X o Escape</p>
      </Modal>

      {/* Modal sin botón de cerrar */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        showCloseButton={false}
        title="Confirmación requerida"
      >
        <p>Debes elegir una opción</p>
        <Button onClick={() => setIsOpen(false)}>Aceptar</Button>
      </Modal>
    </>
  );
}
```

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Si el modal está abierto |
| `onClose` | `() => void` | - | Función al cerrar |
| `title` | `string` | - | Título del modal |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Tamaño del modal |
| `closeOnOverlayClick` | `boolean` | `true` | Cerrar al hacer clic fuera |
| `showCloseButton` | `boolean` | `true` | Mostrar botón X |

---

## 6. Toast - Notificación Temporal

### Características
- ✅ 4 tipos: success, error, warning, info
- ✅ Auto-cierre configurable
- ✅ 6 posiciones disponibles
- ✅ Hook `useToast()` para gestión fácil
- ✅ Múltiples toasts simultáneos
- ✅ Animaciones de entrada/salida

### Uso Básico

```tsx
import { useToast, ToastContainer } from '@/components/ui';

function AppConToasts() {
  const { toasts, removeToast, success, error, warning, info } = useToast();

  return (
    <>
      <button onClick={() => success('¡Guardado correctamente!')}>
        Mostrar éxito
      </button>

      <button onClick={() => error('Ha ocurrido un error')}>
        Mostrar error
      </button>

      <button onClick={() => warning('Advertencia: revisa los datos')}>
        Mostrar advertencia
      </button>

      <button onClick={() => info('Información actualizada', 5000)}>
        Mostrar info (5 segundos)
      </button>

      {/* Contenedor para renderizar los toasts */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}
```

### Uso Avanzado con Posiciones

```tsx
import { Toast } from '@/components/ui';
import { useState } from 'react';

function ToastPersonalizado() {
  const [showToast, setShowToast] = useState(false);

  return (
    <>
      <button onClick={() => setShowToast(true)}>
        Mostrar toast
      </button>

      {showToast && (
        <Toast
          message="Operación completada"
          type="success"
          duration={4000}
          position="bottom-right"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
```

### Props de Toast

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `message` | `string` | - | Mensaje a mostrar |
| `type` | `'success' \| 'error' \| 'warning' \| 'info'` | `'info'` | Tipo de notificación |
| `duration` | `number` | `3000` | Duración en milisegundos |
| `position` | `'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left' \| 'top-center' \| 'bottom-center'` | `'top-right'` | Posición del toast |
| `onClose` | `() => void` | - | Función al cerrar |

### Hook useToast()

Métodos disponibles:

```tsx
const {
  toasts,        // Array de toasts activos
  showToast,     // Función genérica para mostrar toast
  removeToast,   // Función para cerrar toast manualmente
  success,       // Atajo para toast de éxito
  error,         // Atajo para toast de error
  warning,       // Atajo para toast de advertencia
  info,          // Atajo para toast de información
} = useToast();
```

---

## 🎨 Temas y Estilos

Todos los componentes usan variables CSS de meskeIA y **soportan dark mode automáticamente**:

```css
/* Variables principales usadas */
--primary: #2E86AB;
--secondary: #48A9A6;
--bg-card: #FFFFFF (light) / #2D2D2D (dark);
--text-primary: #1A1A1A (light) / #E8E8E8 (dark);
--border: #E5E5E5 (light) / #404040 (dark);
```

---

## 📱 Responsive

Todos los componentes son **responsive** y se adaptan automáticamente a móviles:

- **Button**: Tamaños ajustados en móvil
- **Input/Select**: Ancho completo en móvil
- **Card**: Padding reducido en móvil
- **Modal**: Ocupa pantalla completa en móvil
- **Toast**: Ancho completo en móvil

---

## ♿ Accesibilidad

Características de accesibilidad incluidas:

- ✅ Labels asociados correctamente (for/id)
- ✅ Roles ARIA (role="dialog", role="alert")
- ✅ aria-label en botones de acción
- ✅ Estados de foco visibles
- ✅ Tecla Escape para cerrar modales
- ✅ Contraste de colores WCAG AA

---

## 🚀 Ejemplos de Uso en Aplicaciones

### Formulario Completo

```tsx
import { Card, CardHeader, CardBody, CardFooter, Input, Select, Button, useToast, ToastContainer } from '@/components/ui';
import { useState } from 'react';

export default function FormularioApp() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [categoria, setCategoria] = useState('');
  const { toasts, removeToast, success, error } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre || !email || !categoria) {
      error('Por favor completa todos los campos');
      return;
    }

    // Lógica de envío...
    success('¡Formulario enviado correctamente!');
  };

  return (
    <>
      <Card variant="elevated" padding="large">
        <CardHeader>
          <h2>Registro de Usuario</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <Input
              label="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Juan Pérez"
              fullWidth
            />

            <Input
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="juan@ejemplo.com"
              fullWidth
              helperText="Te enviaremos un correo de confirmación"
            />

            <Select
              label="Categoría de interés"
              options={[
                { value: 'matematicas', label: 'Matemáticas' },
                { value: 'finanzas', label: 'Finanzas' },
                { value: 'productividad', label: 'Productividad' },
              ]}
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              fullWidth
            />
          </form>
        </CardBody>
        <CardFooter>
          <Button variant="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            Enviar
          </Button>
        </CardFooter>
      </Card>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}
```

---

## 📝 Notas Importantes

1. **Todos los componentes son 'use client'** (excepto Card que puede ser server)
2. **TypeScript completo** con interfaces exportadas
3. **CSS Modules** para evitar conflictos de estilos
4. **Accesibilidad incluida** por defecto
5. **Dark mode automático** sin configuración adicional
6. **Responsive** sin media queries adicionales necesarias

---

## 🔄 Próximos Componentes (Opcional)

Posibles expansiones futuras:

- Checkbox
- Radio
- Switch/Toggle
- Tabs
- Accordion
- Tooltip
- Badge
- Progress Bar
- Skeleton Loader

---

**Fecha de implementación**: 21 noviembre 2025
**Versión de Next.js**: 16.0.3
**Total de componentes**: 6
**Líneas de código**: ~1.500
**Ahorro estimado**: 30+ horas en desarrollo de apps
