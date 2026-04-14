# SasBarberia

> Sistema de gestión SaaS para barberías — clientes, inventario, finanzas y membresías en la nube.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com)
[![License](https://img.shields.io/badge/License-Proprietary-red)](./LICENSE)

---

## ¿Qué es SasBarberia?

SasBarberia es un **SaaS de pago** pensado para digitalizar la gestión de barberías en Bolivia y Latinoamérica. Los dueños de barbería se suscriben mensualmente y acceden a un sistema completo desde cualquier dispositivo, sin instalar nada.

### Módulos incluidos

| Módulo | Descripción |
|--------|-------------|
| **Dashboard** | Resumen del día/semana/mes, gráfico de ingresos vs gastos, alertas de stock y cumpleaños |
| **Clientes** | Registro con teléfono, edad, cumpleaños y notas. Búsqueda en tiempo real |
| **Inventario** | Productos con precio de compra/venta, stock y alerta de mínimo |
| **Finanzas** | Ingresos y gastos por categoría, balance diario y mensual |
| **Membresías** | Planes mensuales, trimestrales y anuales con control de estado |

---

## Modo Demo

La app incluye un **modo demo completo** que se activa automáticamente cuando no hay credenciales de Supabase configuradas. Permite explorar todas las funcionalidades con datos de ejemplo sin necesidad de cuenta.

```
# Sin configurar .env.local → modo demo automático
npm run dev
# Abre http://localhost:3000
```

---

## Instalación

### Requisitos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com) (opcional — sin ella corre en modo demo)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/JuanAntonioZ369/SasBarberia.git
cd SasBarberia

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# 4. Correr en desarrollo
npm run dev
```

### Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Sin estas variables la app corre en modo demo automáticamente.

### Base de datos

Ejecutar el schema en tu proyecto de Supabase:

```bash
# Desde el SQL Editor de Supabase, pegar el contenido de:
supabase/schema.sql
```

---

## Stack tecnológico

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19 + Tailwind CSS v4
- **Base de datos:** Supabase (PostgreSQL + Auth)
- **Gráficos:** Recharts
- **Iconos:** Lucide React
- **Deploy:** Vercel

---

## Scripts

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Linter (ESLint)
```

---

## Despliegue

La forma más rápida es con Vercel:

1. Hacer fork o subir el repo a GitHub
2. Importar en [vercel.com](https://vercel.com)
3. Agregar las variables de entorno en el panel de Vercel
4. Deploy automático en cada push a `main`

---

## Licencia

Este proyecto es software propietario. Ver [LICENSE](./LICENSE) para más detalles.

© 2026 SasBarberia. Todos los derechos reservados.
