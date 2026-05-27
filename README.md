# 🐷 CuiSoft - Sistema de Gestión para Granja Porcina (ERP)

Sistema ERP completo para el control y gestión integral de una granja porcina.
Desarrollado con Django REST Framework + React + TypeScript.

---

## 📋 Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Stack Tecnológico](#stack-tecnológico)
- [Módulos del Sistema](#módulos-del-sistema)
- [Modelo de Datos](#modelo-de-datos)
- [API REST](#api-rest)
- [Requisitos](#requisitos)
- [Instalación y Ejecución](#instalación-y-ejecución)
  - [Opción 1: Docker (recomendada)](#opción-1-docker-recomendada)
  - [Opción 2: Manual (desarrollo local)](#opción-2-manual-desarrollo-local)
- [Usuarios por Defecto](#usuarios-por-defecto)
- [Comandos Útiles](#comandos-útiles)
- [Estructura del Proyecto](#estructura-del-proyecto)

---

## 🏗️ Arquitectura

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│   React 19   │────▶│  Django REST │────▶│ PostgreSQL │
│  + TypeScript│     │   Framework  │     │  / SQLite  │
│  (Vite 6)    │◀────│   (DRF 3.15) │◀────│            │
└─────────────┘     └──────────────┘     └────────────┘
       │                    │
       │  JWT Auth          │  drf-spectacular
       │  Axios + Proxy     │  Swagger UI
       └────────────────────┘
```

- **Frontend**: SPA con React 19, TypeScript, Vite 6, React Router 7
- **Backend**: API REST con Django 5.1 + DRF 3.15, JWT (SimpleJWT)
- **Base de datos**: PostgreSQL 16 en producción, SQLite para desarrollo local
- **Proxy**: Vite proxy `/api` → `localhost:8000` evita CORS en desarrollo

---

## 🛠️ Stack Tecnológico

### Backend
| Tecnología | Versión | Propósito |
|---|---|---|
| Python | 3.12 | Lenguaje |
| Django | 5.1.4 | Framework web |
| DRF | 3.15.2 | API REST |
| SimpleJWT | 5.4.0 | Autenticación JWT |
| django-filter | 24.3 | Filtros y búsqueda |
| drf-spectacular | 0.28.0 | Documentación OpenAPI/Swagger |
| django-cors-headers | 4.6.0 | CORS |
| psycopg2-binary | 2.9.10 | Conexión PostgreSQL |
| ReportLab / openpyxl | - | Exportación PDF/Excel |

### Frontend
| Tecnología | Versión | Propósito |
|---|---|---|
| React | 19.0.0 | UI |
| TypeScript | 5.7.0 | Tipado estático |
| Vite | 6.0.0 | Build tool / dev server |
| React Router | 7.1.0 | Enrutamiento |
| Axios | 1.7.9 | HTTP client |
| Lucide React | 0.469.0 | Iconos |
| Dayjs | 1.11.13 | Fechas |

---

## 📦 Módulos del Sistema

### 1. Cuentas y Usuarios (`accounts`)
- Registro y autenticación de usuarios (JWT)
- Roles: Administrador, Veterinario, Encargado, Operario, Visor
- Perfil con nombre, email, teléfono
- Cambio de contraseña

### 2. Animales (`animals`)
- Registro de cerdos con ID único (arete)
- Razas, ubicaciones (corrales/jaulas)
- Clasificación: cerdas, verracos, lechones, destetados, engorde
- Estados: activo, vendido, muerto, transferido
- Pesos y seguimiento
- Filtros por estado, ubicación, raza, clasificación

### 3. Reproducción (`reproduction`)
- Detección de celo (calor)
- Montas naturales e inseminación artificial
- Gestación con fecha estimada de parto
- Partos: número de lechones (vivos, muertos, momificados)
- Destetes: peso promedio, edad
- Resumen de productividad por cerda

### 4. Sanidad (`health`)
- Vacunas: tipos, dosis, intervalo entre dosis
- Registro de vacunación aplicada
- Tratamientos veterinarios
- Mortalidad con causa y diagnóstico

### 5. Alimentación (`feeding`)
- Tipos de alimento con costo unitario
- Inventario (entradas por lote)
- Consumo registrado por cerdo o lote
- **Stock disponible**: cálculo automático (∑ entradas - ∑ consumos)
- Alertas visuales por nivel de stock (verde/amarillo/rojo)
- Valor del inventario en Quetzales (Q)

### 6. Ventas y Engorde (`sales`)
- Clientes con datos de contacto
- Ventas con estado (pendiente, completada, cancelada)
- Métodos de pago
- Lotes de engorde (peso inicio, peso objetivo)

### 7. Reportes (`reports`)
- Dashboard con resumen general
- Conteos: cerdas activas, gestantes, lechones, etc.
- Vacunaciones pendientes
- Valor total del inventario de alimento

---

## 🗄️ Modelo de Datos

### accounts
- **User** (modelo personalizado): username, email, role, phone, is_active

### animals
- **Breed**: name, description
- **Location**: name, type (corral/jaula/área), capacity
- **Pig**: earring_id, name, breed, gender, birth_date, location, classification, status, mother, father, notes
- **Weight**: pig, weight_kg, date

### reproduction
- **HeatDetection**: sow, date, detected_by, method, notes
- **Mating**: sow, boar, date, method (natural/ai), technician, notes
- **Gestation**: sow, mating, start_date, expected_farrowing_date, status, notes
- **Farrowing**: sow, gestation, farrowing_date, piglets_alive, piglets_dead, piglets_mummified, notes
- **Weaning**: sow, farrowing, weaning_date, piglets_weaned, avg_weight_kg, age_days, notes

### health
- **Vaccine**: name, description, dose_ml, interval_days
- **VaccinationRecord**: pig, vaccine, application_date, dose_ml, applied_by, notes
- **Treatment**: pig, diagnosis, medication, dose, start_date, end_date, veterinarian, notes
- **MortalityRecord**: pig, death_date, cause, diagnosis, notes

### feeding
- **FeedType**: name, supplier, unit_cost, description
- **FeedInventory**: feed_type, stock_quantity, entry_date, batch_number, notes
- **FeedConsumption**: feed_type, pig, quantity, date, location, notes

### sales
- **Customer**: name, phone, email, address
- **Sale**: customer, sale_date, total_amount, status, payment_method, notes
- **GrowOutBatch**: name, start_date, pigs_count, avg_start_weight, target_weight, status, notes

---

## 🌐 API REST

### Endpoints disponibles

```
/api/auth/          → login, users, token refresh
/api/animals/       → pigs, breeds, locations, weights
/api/reproduction/  → heat-detections, matings, gestations, farrowings, weanings
/api/health/        → vaccines, vaccination-records, treatments, mortality
/api/feeding/       → feed-types, inventory, consumption, stock
/api/sales/         → customers, sales, grow-out-batches
/api/reports/       → dashboard
```

**Documentación interactiva**: http://localhost:8000/api/docs/ (Swagger UI)
**Schema OpenAPI**: http://localhost:8000/api/schema/?format=json

### Autenticación
- Obtener token: `POST /api/auth/login/` con `username` + `password`
- Incluir en requests: `Authorization: Bearer <access_token>`
- Refrescar: `POST /api/auth/token/refresh/` con `refresh` token

---

## 📋 Requisitos

- Python 3.12+
- Node.js 20+
- PostgreSQL 16 (opcional, para producción)
- Docker + Docker Compose (opcional)

---

## 🚀 Instalación y Ejecución

### Opción 1: Docker (recomendada)

```bash
# 1. Clonar el repositorio
git clone https://github.com/gespinales/CuiSoft.git
cd pigfarm

# 2. Iniciar todos los servicios
docker-compose up -d --build

# 3. Ejecutar migraciones
docker-compose exec backend python manage.py migrate

# 4. Cargar datos de prueba
docker-compose exec backend python manage.py seed_data

# 5. Crear superusuario (opcional)
docker-compose exec backend python manage.py createsuperuser

# 6. Abrir en navegador
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# Admin Django: http://localhost:8000/admin/
# Swagger: http://localhost:8000/api/docs/
```

### Opción 2: Manual (desarrollo local)

#### Backend

```bash
# 1. Crear entorno virtual
cd backend
python -m venv .venv

# 2. Activar entorno
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Linux/Mac:
source .venv/bin/activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Migrar base de datos (SQLite por defecto)
python manage.py migrate

# 5. Cargar datos de prueba
python manage.py seed_data

# 6. Iniciar servidor
python manage.py runserver
```

#### Frontend

```bash
# 1. Instalar dependencias
cd frontend
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Abrir http://localhost:3000
```

> El proxy de Vite redirige `/api` → `http://localhost:8000`, no requiere configuración CORS adicional.

#### PostgreSQL (opcional)

```bash
# Configurar variable de entorno para usar PostgreSQL
$env:DATABASE_URL = "postgres://pigfarm:pigfarm_secret_2024@localhost:5432/pigfarm"
```

Si no se define `DATABASE_URL`, el sistema usa SQLite automáticamente.

---

## 👤 Usuarios por Defecto

Después de ejecutar `seed_data`, están disponibles:

| Usuario | Contraseña | Rol | Descripción |
|---|---|---|---|
| `admin` | `admin123` | Administrador | Acceso total al sistema |
| `veterinario` | `vet123` | Veterinario | Gestión de sanidad y reproducción |
| `encargado` | `enc123` | Encargado | Gestión operativa diaria |

---

## 📝 Comandos Útiles

```bash
# === BACKEND ===

# Migraciones
python manage.py migrate              # Aplicar todas las migraciones
python manage.py makemigrations       # Crear migraciones nuevas
python manage.py showmigrations       # Ver estado de migraciones

# Datos
python manage.py seed_data            # Cargar datos de prueba
python manage.py dumpdata > data.json # Exportar datos
python manage.py loaddata data.json   # Importar datos

# Shell
python manage.py shell_plus           # Shell interactivo (si django-extensions)

# Tests
python manage.py test                 # Ejecutar pruebas

# Colección estática
python manage.py collectstatic        # Recopilar archivos estáticos

# === FRONTEND ===

npm run dev                           # Servidor de desarrollo
npm run build                         # Build de producción
npm run preview                       # Vista previa del build
npm run build --watch                 # Build en modo watch (--watch no válido, usar sin --watch)

# === DOCKER ===

docker-compose up -d                  # Iniciar servicios
docker-compose down                   # Detener servicios
docker-compose logs -f                # Ver logs en tiempo real
docker-compose exec backend bash      # Shell dentro del contenedor backend
docker-compose exec frontend sh       # Shell dentro del contenedor frontend

# === GIT ===

git status                            # Estado del repositorio
git add .                             # Agregar cambios
git commit -m "mensaje"               # Crear commit
git push origin main                  # Subir cambios

# === UTILIDADES ===

# Puerto ocupado (Windows)
netstat -ano | findstr :8000

# Ver si el servidor responde
curl http://localhost:8000/api/reports/dashboard/
```

---

## 📁 Estructura del Proyecto

```
pigfarm/
├── backend/                          # Django REST API
│   ├── accounts/                     # Usuarios y autenticación
│   │   ├── management/commands/      # seed_data
│   │   ├── migrations/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── animals/                      # Cerdos, razas, ubicaciones
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── reproduction/                 # Ciclo reproductivo
│   ├── health/                       # Sanidad y vacunación
│   ├── feeding/                      # Alimentación y stock
│   ├── sales/                        # Ventas y engorde
│   ├── reports/                      # Reportes y dashboard
│   ├── config/                       # Configuración principal
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── schema.py
│   │   └── pagination.py
│   ├── Dockerfile
│   ├── manage.py
│   └── requirements.txt
├── frontend/                         # React + TypeScript
│   ├── src/
│   │   ├── components/               # Formularios reutilizables
│   │   ├── contexts/                 # AuthContext
│   │   ├── pages/                    # Páginas del sistema
│   │   ├── services/                 # Cliente API (Axios)
│   │   ├── utils/                    # Utilidades (format)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
├── database/                         # Scripts SQL (vacío, Docker lo gestiona)
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🧪 Notas Técnicas

### JWT
- Access token: 8 horas de duración
- Refresh token: 7 días de duración
- Refresco automático desde el frontend (interceptor Axios)

### Paginación
- 25 registros por página por defecto
- Parámetro `?page_size=100` para cambiar (máx 100)
- Parámetro `?page=2` para navegar

### Filtros
- Filtros exactos con `?field=value`
- Búsqueda con `?search=texto`
- Ordenamiento con `?ordering=field` o `?ordering=-field`

### Esquema OpenAPI
- En Windows, se usa `SafeSpectacularAPIView` que evita el error `Content-Disposition` del servidor
- Disponible en `/api/schema/?format=json` y `/api/docs/` (Swagger UI)

---

## 📄 Licencia

Uso interno. Proyecto privado - CuiSoft.
