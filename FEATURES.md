# ClickNGo - Documentación de Características

> **Versión actual:** 1.0.8  
> **Plataforma:** Web (PWA)  
> **URL de producción:** https://clickngo.bdsmbefree.com

---

## 🌐 Características del Sitio Web

### 👤 Sistema de Usuarios

#### Autenticación
- **Registro tradicional** (email + contraseña)
- **Login con Google** (OAuth 2.0)
- **JWT Tokens** para sesiones
- **Roles:** Usuario, Vendedor, Admin

#### Gestión de Cuenta (`/my-account`)
- Editar nombre y teléfono
- Cambiar avatar
- Acceso rápido a CV, clasificados y favoritos

### 🛒 Vendedores

#### Convertirse en Vendedor (`/become-vendor`)
- Formulario de solicitud
- Categorías de negocio
- Ubicación con mapa

#### Dashboard de Vendedor (`/dashboard`)
- Gestión de productos
- Estadísticas de ventas
- Configuración de perfil
- Link a página de Facebook

#### Perfil Público (`/vendor/:id`)
- Información del negocio
- Catálogo de productos
- Reseñas y calificaciones
- Código QR compartible
- Mapa de ubicación

### 📦 Productos

#### Gestión (`/my-products`)
- Crear, editar, eliminar productos
- Múltiples imágenes por producto
- Categorías y precios
- Estado activo/inactivo

#### Detalle de Producto (`/product/:id`)
- Galería de imágenes
- Descripción completa
- Agregar a favoritos
- Contactar vendedor
- Reseñas del producto

### 📢 Clasificados

#### Publicar Clasificados (`/classifieds`)
- Título y descripción
- **Generación de texto con IA** (múltiples estilos)
- Categorías personalizadas
- Imágenes adjuntas

#### Estilos de IA Disponibles
- 🎯 Profesional
- 😄 Casual
- ⚡ Urgente
- 😂 Gracioso
- ❤️ Emocional

### 💬 Chat

#### Sistema de Mensajería (`/chat`)
- Chat en tiempo real
- Conversaciones entre usuarios
- Notificaciones de nuevos mensajes

### 🎫 Cupones

#### Gestión de Cupones (`/my-coupons`)
- Crear cupones de descuento
- Códigos personalizados
- Fecha de expiración
- Límite de usos

### 🎪 Ferias

#### Eventos y Ferias (`/fairs`)
- Listado de ferias activas
- Información de ubicación y fecha
- Vendedores participantes

### 📄 CV / Currículum

#### Constructor de CV (`/resume-builder`)
- Crear currículum profesional
- Secciones personalizables
- Vista pública del CV (`/resume/:id`)

### ⭐ Reseñas y Calificaciones

- Sistema de estrellas (1-5)
- Comentarios de compradores
- Promedio de calificación por vendedor
- Ranking de vendedores

### 🔔 Notificaciones

- **Push notifications** (Firebase)
- **Campana de notificaciones** en navbar
- Alertas de nuevos mensajes
- Avisos de actualizaciones

### 🗺️ Mapa de Vendedores

- Mapa interactivo con Leaflet
- Clustering de markers
- Filtro por categoría
- Ubicación en tiempo real

### 💎 Premium

#### Suscripción Premium (`/premium`)
- Beneficios exclusivos
- Destacar productos
- Estadísticas avanzadas

---

## 🔧 Panel de Administración

### Acceso: `/admin`

#### Funciones Disponibles
- **Gestión de usuarios** (activar/desactivar)
- **Moderación de contenido**
- **Gestión de ferias**
- **Editor de layout** del sitio
- **Modo mantenimiento**
- **Purga de caché**

---

## 📁 Estructura del Proyecto

```
ClickNGo/
├── client/                 # Frontend React + Vite
│   ├── src/
│   │   ├── pages/         # 22 páginas
│   │   ├── components/    # 14 componentes
│   │   ├── context/       # AuthContext
│   │   ├── api/           # Cliente API
│   │   └── utils/         # Utilidades
│   ├── android/           # Proyecto Android
│   └── dist/              # Build de producción
│
├── server/                 # Backend Node.js
│   ├── src/
│   │   ├── routes/        # 18 rutas API
│   │   └── index.js       # Entry point
│   └── prisma/            # Schema de BD
│
└── nginx-clickngo.conf    # Configuración Nginx
```

---

## 🔗 Endpoints API Principales

| Ruta | Descripción |
|------|-------------|
| `/api/auth/*` | Autenticación y registro |
| `/api/vendors/*` | CRUD de vendedores |
| `/api/products/*` | CRUD de productos |
| `/api/classifieds/*` | Clasificados |
| `/api/chat/*` | Sistema de mensajería |
| `/api/reviews/*` | Reseñas y calificaciones |
| `/api/coupons/*` | Gestión de cupones |
| `/api/fairs/*` | Ferias y eventos |
| `/api/notifications/*` | Notificaciones |
| `/api/admin/*` | Panel de administración |

---

## 🚀 Tecnologías Utilizadas

### Frontend
- **React 19** + Vite 7
- **React Router DOM** 7
- **Leaflet** (mapas)
- **Firebase** (notificaciones)

### Backend
- **Node.js** + Express
- **Prisma ORM**
- **JWT** para autenticación
- **Multer** para uploads

### Infraestructura
- **VPS** con Ubuntu
- **Nginx** como proxy reverso
- **PM2** para proceso Node
- **SSL** con Let's Encrypt

---

*Última actualización: Diciembre 2024*
