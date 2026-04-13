# Visualizador Espacial de DENUE (INEGI)

Este proyecto es una aplicación web interactiva construida con **React**, **Vite** y **MapLibre GL JS**, diseñada para facilitar la carga, análisis exploratorio y visualización en un mapa de los registros comerciales proporcionados por el DENUE (Directorio Estadístico Nacional de Unidades Económicas) de México.

## Fuente de los Datos

Los datos visualizados en esta aplicación pueden ser descargados de manera gratuita desde el portal oficial del INEGI:
🔗 [https://www.inegi.org.mx/app/descarga/default.html](https://www.inegi.org.mx/app/descarga/default.html)

## Características

- 📊 **Carga Local de Datos**: Soporta la lectura y parseo eficiente (con `papaparse`) de los archivos `.csv` en el formato estandarizado del INEG directamente en tu navegador. Tus datos no se envían a ningún servidor, asegurando total privacidad y velocidad.
- 🗺️ **Visualización Geográfica**: Dibuja cada punto sobre un mapa moderno permitiéndote analizar fácilmente las densidades y localizaciones comerciales.
- 🔎 **Búsqueda Integrada**: Filtra rápidamente establecimientos por nombre, categoría de actividad, e incluso por municipio o entidad. 
- 📋 **Visualización Detallada**: Selecciona un negocio de la tabla o pulsa en cualquier punto del mapa para indagar minuciosamente sobre su registro (más de 40 atributos oficiales como tamaño de la empresa, tipo de unidad, fecha de alta, vías que rodean el establecimiento, etc).

## Requisitos Previos

- [Node.js](https://nodejs.org/es/) (Versión 18 o superior es recomendada)
- Un archivo del conjunto de datos **DENUE** (`.csv`) descargado directamente del INEGI para su examinación.

## Instrucciones de Instalación

1. Clona este repositorio o descárgalo en tu computadora y accede a la carpeta con tu terminal:
   ```bash
   cd /ruta/a/tu/proyecto
   ```

2. Instala todas las dependencias necesarias para que la app funcione utilizando npm:
   ```bash
   npm install
   ```

## Ejecución (Modo Desarrollo)

Para iniciar un servidor de pruebas de manera local y ver la aplicación funcionando, corre el siguiente comando:

```bash
npm run dev
```

La terminal te devolverá una dirección con un formato parecido a `http://localhost:5173/`. Da clic en ella (o pégala en tu navegador favorito). Una vez adentro, utiliza el botón de subida de archivo para seleccionar el documento original de datos `.csv` que quieres visualizar.

## Construcción para Producción

Si necesitas preparar el proyecto para publicarlo y alojarlo (por ejemplo en Vercel, Netlify o GitHub Pages), puedes ejecutar:

```bash
npm run build
```

Este comando tomará todo el proyecto y lo optimizará exitosamente dentro de la carpeta `/dist`.
