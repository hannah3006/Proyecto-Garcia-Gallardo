# Buenas prácticas aplicadas

## Organización del proyecto
El proyecto se organizó separando los archivos principales del backend, frontend, datos y documentación.

- server.js: contiene el servidor y los endpoints principales.
- public: contiene la interfaz web.
- data: almacena temporalmente los usuarios en formato JSON.
- docs: contiene la documentación de pruebas, evidencias y buenas prácticas.
- screenshots: carpeta destinada para capturas de evidencia.

## Separación frontend/backend
El backend se desarrolló con Node.js y Express. El frontend se realizó con HTML, CSS y JavaScript. La interfaz consume los endpoints del backend para crear, consultar, editar y eliminar usuarios, además de realizar login y logout.

## Uso de validaciones
Se agregaron validaciones básicas para comprobar que los campos obligatorios no estén vacíos, que el correo tenga un formato válido y que la contraseña tenga una longitud mínima.

## Convenciones de commits
Se utilizaron commits descriptivos para identificar claramente los cambios realizados en cada parte del proyecto.

## Flujo de trabajo colaborativo
El equipo trabajó con Issues, ramas independientes, Pull Requests, revisión de código y merge hacia la rama principal.

## Pruebas manuales
Se realizaron pruebas manuales para validar el funcionamiento del CRUD de usuarios, login y logout.
