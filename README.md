# NEXUS LAB

Laboratorio científico interactivo, minimalista y adaptado a móviles. Explora tres simulaciones visuales sin instalar dependencias en el navegador.

## Experimentos
- **Campo de partículas:** ajusta cantidad, energía y atracción.
- **Laboratorio de ondas:** cambia frecuencia, amplitud y atenuación.
- **Mecánica orbital:** experimenta con gravedad, velocidad orbital y masa central.

## Ejecutar
Abre `index.html` en un navegador moderno. Para desarrollo local también puedes usar una extensión de servidor estático o cualquier servidor HTTP sencillo. No hay dependencias de JavaScript que instalar.

## Controles
- Selecciona un experimento desde el panel lateral.
- Mueve los controles deslizantes para actualizar la simulación.
- Usa **Pausar simulación** y **Reiniciar** para controlar el experimento.
- Cambia entre tema oscuro y claro con el botón ☼/☾.

## Comprobación automática
El flujo de GitHub Actions en `.github/workflows/check.yml` ejecuta `node --check app.js` en cada push y pull request a `main`.

## Archivos
- `index.html`: estructura y accesibilidad.
- `style.css`: diseño adaptable y temas.
- `app.js`: simulaciones y controles.
- `package.json`: comando de comprobación de sintaxis.

NEXUS LAB es un proyecto educativo visual: las simulaciones son modelos ilustrativos, no una herramienta de medición científica.
