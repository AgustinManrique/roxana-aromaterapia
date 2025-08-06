# 🌸 Roxana Aromaterapia - Tienda Online

Una moderna tienda online de productos de aromaterapia construida con React, TypeScript, Tailwind CSS y Supabase.

## ✨ Características

### 🛍️ **Para Clientes:**
- **Catálogo de productos** con búsqueda y filtros por categoría
- **Carrito de compras** con persistencia local
- **Sistema de autenticación** seguro
- **Checkout completo** con opciones de entrega
- **Integración con MercadoPago** para pagos online
- **Historial de pedidos** personal
- **Modo oscuro/claro** 
- **Diseño responsive** para móviles y desktop
- **Contacto directo** por WhatsApp

### 👩‍💼 **Para Administradores:**
- **Panel de administración** completo
- **Gestión de productos** (crear, editar, eliminar)
- **Gestión de categorías**
- **Gestión de pedidos** con estados
- **Contacto directo** con clientes
- **Notificaciones por email** automáticas

## 🛠️ Tecnologías

- **Frontend:** React 18 + TypeScript + Vite
- **Estilos:** Tailwind CSS
- **Base de datos:** Supabase (PostgreSQL)
- **Autenticación:** Supabase Auth
- **Pagos:** MercadoPago
- **Emails:** Supabase Edge Functions + Resend
- **Iconos:** Lucide React
- **Deploy:** Netlify

## 🚀 Instalación y Desarrollo

### **Prerrequisitos:**
- Node.js 18+
- npm o yarn
- Cuenta de Supabase
- Cuenta de MercadoPago (para pagos)

### **1. Clonar el repositorio:**
```bash
git clone https://github.com/tu-usuario/roxana-aromaterapia.git
cd roxana-aromaterapia
```

### **2. Instalar dependencias:**
```bash
npm install
```

### **3. Configurar variables de entorno:**
Crear archivo `.env` en la raíz:
```bash
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### **4. Ejecutar en desarrollo:**
```bash
npm run dev
```

## 📊 Base de Datos

### **Tablas principales:**
- `profiles` - Perfiles de usuarios
- `categories` - Categorías de productos
- `products` - Productos del catálogo
- `orders` - Pedidos realizados
- `order_items` - Items de cada pedido
- `admin_users` - Usuarios administradores

### **Configurar Supabase:**
1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ejecutar las migraciones en `supabase/migrations/`
3. Configurar Row Level Security (RLS)
4. Crear usuario administrador en tabla `admin_users`

## 💳 Configuración de Pagos

### **MercadoPago:**
1. Crear cuenta en [developers.mercadopago.com](https://developers.mercadopago.com)
2. Obtener Access Token
3. Configurar en variables de entorno de Supabase:
```bash
MERCADOPAGO_ACCESS_TOKEN=tu_access_token
```

## 📧 Configuración de Emails

### **Resend:**
1. Crear cuenta en [resend.com](https://resend.com)
2. Obtener API Key
3. Configurar en Supabase:
```bash
RESEND_API_KEY=tu_api_key
SITE_URL=https://tu-dominio.com
```

## 🚀 Deploy

### **Netlify:**
1. Conectar repositorio de GitHub
2. Configurar variables de entorno
3. Deploy automático en cada push

### **Variables de entorno para producción:**
```bash
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

## 📱 Funcionalidades Destacadas

### **🛒 Sistema de Carrito:**
- Persistencia en localStorage
- Actualización en tiempo real
- Cálculo automático de totales

### **🔐 Autenticación:**
- Registro e inicio de sesión
- Perfiles de usuario editables
- Sistema de roles (admin/cliente)

### **📦 Gestión de Pedidos:**
- Estados: Pendiente → Confirmado → Preparando → Listo → Entregado
- Notificaciones automáticas por email
- Contacto directo con clientes

### **💰 Opciones de Pago:**
- MercadoPago (tarjetas, efectivo)
- Pago en efectivo (solo retiro en local)

### **🚚 Opciones de Entrega:**
- Retiro en local (gratis)
- Envío a domicilio ($2.500)

## 🎨 Diseño

- **Paleta de colores:** Naranja y rosa (aromaterapia)
- **Tipografía:** Sistema de fuentes nativo
- **Componentes:** Diseño modular y reutilizable
- **Responsive:** Mobile-first approach
- **Accesibilidad:** ARIA labels y navegación por teclado

## 📞 Contacto

- **Tienda:** Calle 136, entre 530 y 531. Número 124, La Plata
- **WhatsApp:** +54 9 221 436 3284
- **Email:** roxanaaromaterapia@gmail.com
- **Instagram:** [@roxana_aromaterapia](https://instagram.com/roxana_aromaterapia)

## 📄 Licencia

Este proyecto es privado y pertenece a Roxana Aromaterapia.

---

**Desarrollado con ❤️ para Roxana Aromaterapia** 🌸