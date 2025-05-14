# Acortador de URL

Aplicación web para el acortamiento de enlaces, inspirada en TinyURL. Desarrollada con React, PHP y contenerizada con Docker.

![Captura de pantalla de la aplicación web](/screenshot.png)

## Instalación y configuración

1. Asegúrate de tener instalado Docker y su servicio en ejecución.
2. Descarga o clona este repositorio e ingresa a él.
3. Renombra el archivo `.env.example` a `.env`.
4. Opcional. Abre el archivo `.env` y agrega la clave del sitio y la clave secreta de tu reCAPTCHA en las variables correspondientes:

```
RECAPTCHA_SITE_KEY=CLAVE_SITIO
RECAPTCHA_SECRETE_KEY=CLAVE_SECRETA
```

5. Abre el terminal y ejecuta lo siguiente para instalar y poner en marcha los contenedores:

```
docker compose up --watch --build
```

6. Abre el navegador web y visita la dirección `http://localhost/`.
