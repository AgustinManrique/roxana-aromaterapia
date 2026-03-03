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

## 🔒 Uso del repositorio

Este proyecto está pensado **exclusivamente para el e‑commerce en producción de Roxana Aromaterapia**.

- No es una plantilla genérica ni un starter kit.
- No incluye credenciales reales ni configuración completa de Supabase, MercadoPago o Resend.
- Sin acceso a esos servicios y a la configuración privada, **no se puede reproducir el entorno de producción**.

Si otro desarrollador autorizado necesita trabajar en el proyecto:

- Debe usar sus propias credenciales y proyectos de terceros (Supabase, MercadoPago, Resend, etc.).
- Debe configurar las variables de entorno (`.env`) manualmente. Las secciones de **Base de Datos**, **Pagos** y **Emails** sirven como referencia conceptual, no como guía para levantar un entorno idéntico al de producción.

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

## 🚀 Deploy (referencia interna)

El proyecto está desplegado en un entorno privado (actualmente `roxanaaromaterapia.com`) con:

- Frontend estático generado con Vite.
- Backend de datos y autenticación en Supabase.
- Integraciones externas (MercadoPago, Resend) configuradas con claves privadas **no incluidas en este repositorio**.

Esta sección es solo descriptiva para entender la arquitectura; **no es una guía para que terceros repliquen el entorno de producción.**

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