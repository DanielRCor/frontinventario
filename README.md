# React + TypeScript + Vite

# Inventario Frontend

Interfaz web para la gestión de inventario, compras, ventas, facturación, despachos y almacenes.

---

# Descripción

Este proyecto proporciona una interfaz moderna desarrollada con React para administrar los principales procesos operativos de una empresa desde el navegador.

Los módulos disponibles incluyen:

* Inicio de sesión y autenticación.
* Gestión de productos.
* Gestión de almacenes.
* Órdenes de compra.
* Ingreso de mercadería.
* Facturación.
* Despachos.
* Dashboard y consultas generales.

---

# Tecnologías Utilizadas

* React
* Vite
* TypeScript
* Tailwind CSS
* React Query
* Axios
* React Router DOM

---

# Requisitos Previos

Antes de ejecutar el proyecto asegúrate de tener instalado:

* Node.js
* npm
* Backend del sistema funcionando correctamente

---

# Instalación

## 1. Clonar el repositorio

Descarga el proyecto o clónalo desde GitHub.

## 2. Ingresar a la carpeta del proyecto

```bash
cd inventario-frontend
```

## 3. Instalar dependencias

```bash
npm install
```

---

# Configuración del Backend

Este frontend consume una API REST independiente.

Debes asegurarte de que el backend se encuentre ejecutándose y accesible desde el frontend.

Por defecto, la aplicación espera la siguiente URL:

```text
http://localhost:3000/api
```

Si utilizas otra dirección o puerto, modifica el archivo `.env`.

## Archivo .env

```env
VITE_API_URL=http://localhost:3000/api
```

---

# Ejecutar el Frontend

## Modo Desarrollo

```bash
npm run dev
```

Luego abre tu navegador en:

```text
http://localhost:5173
```

## Modo Producción

Generar build:

```bash
npm run build
```

Vista previa local:

```bash
npm run preview
```

---

# Funcionalidades Principales

* Autenticación de usuarios.
* Registro y mantenimiento de productos.
* Administración de almacenes.
* Consulta de stock por almacén.
* Gestión de órdenes de compra.
* Registro de ingreso de mercadería.
* Emisión de facturas y boletas.
* Gestión de despachos.
* Dashboard operativo.
* Consultas y reportes.

---

# Estructura del Proyecto

```text
src/
│
├── api/          # Servicios y llamadas HTTP
├── components/   # Componentes reutilizables
├── layout/       # Layouts de la aplicación
├── pages/        # Vistas y pantallas
├── router/       # Configuración de rutas
├── hooks/        # Hooks personalizados
├── utils/        # Utilidades generales
└── assets/       # Recursos estáticos
```

---

# Scripts Disponibles

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

---

# Flujo General del Sistema

1. El usuario inicia sesión.
2. Consulta información del dashboard.
3. Gestiona productos y almacenes.
4. Registra órdenes de compra.
5. Registra ingresos de mercadería.
6. Consulta el stock actualizado.
7. Emite comprobantes de venta.
8. Gestiona despachos y seguimiento.
9. Consulta reportes e indicadores.

---

# Notas Importantes

* El frontend depende completamente del backend.
* Verifica que la API esté disponible antes de iniciar sesión.
* Si cambias el dominio o puerto del backend, actualiza la variable `VITE_API_URL`.
* El proyecto está optimizado para desarrollo con Vite.
* Se recomienda utilizar Node.js LTS para evitar problemas de compatibilidad.

---
