import { ScrollViewStyleReset } from 'expo-router/html';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#1c1410" />
        <title>Ruta Grano — Cafeterías de Santiago</title>

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap"
          rel="stylesheet"
        />

        <link
          rel="stylesheet"
          href="https://unpkg.com/mapbox-gl@2.15.0/dist/mapbox-gl.css"
          crossOrigin="anonymous"
        />

        {/* 
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native. 
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
        {/* Add any additional <head> elements that you want globally available on web... */}
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #1c1410;
  color: #f5e6d3;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

/* Ensure mapbox container has correct dimensions */
.mapboxgl-map {
  width: 100% !important;
  height: 100% !important;
}

/* Fix mapbox canvas sizing */
.mapboxgl-canvas {
  width: 100% !important;
  height: 100% !important;
}

/* Better mapbox controls on dark theme */
.mapboxgl-ctrl-group {
  background: rgba(28,20,16,0.9) !important;
  border: 1px solid rgba(212,165,116,0.2) !important;
  border-radius: 12px !important;
  overflow: hidden;
}
.mapboxgl-ctrl-group button {
  border-color: rgba(212,165,116,0.1) !important;
}
.mapboxgl-ctrl-group button + button {
  border-top-color: rgba(212,165,116,0.1) !important;
}
.mapboxgl-ctrl-group button span {
  filter: invert(0.85) !important;
}

/* Smooth loading */
#root, #__next {
  min-height: 100vh;
  background-color: #1c1410;
}
`;
