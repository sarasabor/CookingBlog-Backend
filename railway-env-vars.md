# Variables d'environnement pour Railway

Ajoutez ces variables dans l'onglet "Variables" de votre projet Railway :

```
PORT=5000
MONGO=mongodb+srv://username:password@cluster.mongodb.net/cookingblog
JWT_SECRET=votre_secret_jwt_super_securise_123456
CLOUDINARY_CLOUD_NAME=votre_nom_cloudinary
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

## Comment obtenir ces valeurs :

### 1. MongoDB Atlas (Base de données)

- Allez sur mongodb.com/atlas
- Créez un cluster gratuit
- Obtenez l'URL de connexion

### 2. Cloudinary (Images)

- Allez sur cloudinary.com
- Créez un compte gratuit
- Trouvez vos clés API dans le dashboard

### 3. JWT Secret

- Générez une chaîne aléatoire sécurisée
- Ou utilisez : node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
