# CuiSoft - Sistema de Gestion para Granja Porcina

ERP para el control integral de una granja porcina. Modulos: animales, reproduccion, sanidad, alimentacion, ventas, reportes.

## Stack

- **Backend**: Python 3.12 + Django 5.1 + Django REST Framework 3.15 + JWT
- **Frontend**: React 19 + TypeScript + Vite 6
- **Base de datos**: PostgreSQL 16 (produccion) / SQLite (desarrollo local)

## Descargar

```bash
git clone https://github.com/gespinales/CuiSoft.git
cd pigfarm
```

## Docker (recomendado)

```bash
docker-compose up -d --build
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py seed_data
```

Abrir http://localhost:3000

## Manual (desarrollo local)

### Backend

```bash
cd backend
python -m venv .venv

# Windows PowerShell:
.venv\Scripts\Activate.ps1
# Linux/Mac:
# source .venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Abrir http://localhost:3000

> El frontend usa proxy de Vite: `/api` redirige a `http://localhost:8000`. No requiere configurar CORS.

### PostgreSQL (opcional)

Si prefieres PostgreSQL en lugar de SQLite:

```bash
# Windows PowerShell:
$env:DATABASE_URL = "postgres://pigfarm:pigfarm_secret_2024@localhost:5432/pigfarm"
```

Sin esta variable, el sistema usa SQLite automaticamente.

## Usuarios de prueba

| Usuario | Password | Rol |
|---|---|---|
| admin | admin123 | Administrador |
| veterinario | vet123 | Veterinario |
| encargado | enc123 | Encargado |

## Endpoints

```
/api/auth/          login, usuarios, token refresh
/api/animals/       cerdos, razas, ubicaciones, pesos
/api/reproduction/  celo, montas, gestaciones, partos, destetes
/api/health/        vacunas, registros, tratamientos, mortalidad
/api/feeding/       alimentos, inventario, consumo, stock
/api/sales/         clientes, ventas, lotes de engorde
/api/reports/       dashboard
```

Documentacion Swagger: http://localhost:8000/api/docs/

## Estructura

```
pigfarm/
  backend/          Django REST API
    accounts/       usuarios y autenticacion
    animals/        cerdos, razas, ubicaciones
    reproduction/   ciclo reproductivo
    health/         sanidad y vacunacion
    feeding/        alimentacion y stock
    sales/          ventas y engorde
    reports/        reportes y dashboard
    config/         settings, urls, schema
  frontend/         React + TypeScript
    src/
      components/   formularios CRUD
      pages/        paginas del sistema
      services/     cliente API (Axios)
      contexts/     AuthContext
      utils/        format
  docker-compose.yml
```

## Comandos utiles

```bash
# Backend
python manage.py migrate              # aplicar migraciones
python manage.py makemigrations       # crear migraciones
python manage.py seed_data            # cargar datos de prueba
python manage.py createsuperuser      # crear superusuario Django admin

# Frontend
npm run dev                           # servidor desarrollo
npm run build                         # build produccion

# Docker
docker-compose up -d                  # iniciar servicios
docker-compose down                   # detener servicios
docker-compose exec backend bash      # terminal backend
docker-compose logs -f                # ver logs

# Git
git pull                              # actualizar codigo
git add -A && git commit -m "mensaje" # commit
git push                              # subir cambios
```
