# Image Node officielle
FROM node:20

# Crée le dossier de travail dans le container
WORKDIR /app

# Copie le package.json + lock pour installer les dépendances
COPY package*.json ./

# Install des dépendances
RUN npm install

# Copie le reste de ton projet
COPY . .

# Expose le port Vite
EXPOSE 5171

# Commande par défaut : lance Vite
CMD ["node","server.js"]
