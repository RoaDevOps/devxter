# Usamos la imagen base oficial de NGINX (ligera)
FROM nginx:alpine

# Copiamos todo el contenido del repositorio a la carpeta pública de NGINX
COPY . /usr/share/nginx/html

# Exponemos el puerto 80 para que sea accesible en el navegador
EXPOSE 80
