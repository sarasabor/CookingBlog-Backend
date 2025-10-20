# 🤖 Guide de Configuration de l'Assistant IA

Ce guide explique comment configurer l'API OpenAI pour générer de nouvelles recettes avec l'intelligence artificielle.

## 📋 Prérequis

- Un compte OpenAI (gratuit ou payant)
- Une clé API OpenAI
- Node.js et npm installés

## 🔑 Obtenir une Clé API OpenAI

### Étape 1 : Créer un Compte OpenAI

1. Visitez [https://platform.openai.com/signup](https://platform.openai.com/signup)
2. Créez un compte avec votre email
3. Vérifiez votre email

### Étape 2 : Générer une Clé API

1. Connectez-vous à [https://platform.openai.com/](https://platform.openai.com/)
2. Cliquez sur votre profil (en haut à droite)
3. Allez dans **API Keys** ou visitez [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
4. Cliquez sur **"Create new secret key"**
5. Donnez un nom à votre clé (ex: "MoodBite Kitchen")
6. **⚠️ IMPORTANT:** Copiez immédiatement la clé et sauvegardez-la dans un endroit sûr
   - Vous ne pourrez plus la voir après avoir fermé la fenêtre
7. Ne partagez JAMAIS votre clé API publiquement

### Étape 3 : Configurer les Crédits

- OpenAI offre **$5 de crédits gratuits** pour les nouveaux comptes
- Si vous avez épuisé vos crédits gratuits, vous devrez ajouter une méthode de paiement
- Visitez [https://platform.openai.com/account/billing](https://platform.openai.com/account/billing)

## ⚙️ Configuration du Backend

### Option 1 : Variables d'Environnement Locales

1. Dans le dossier `Api/`, créez un fichier `.env` (s'il n'existe pas déjà)
2. Ajoutez votre clé API :

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini
```

3. Redémarrez votre serveur backend

### Option 2 : Configuration Railway/Vercel

#### Sur Railway :

1. Allez dans votre projet Railway
2. Cliquez sur **Variables**
3. Ajoutez :
   - `OPENAI_API_KEY` = `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - `OPENAI_MODEL` = `gpt-4o-mini`
4. Redéployez votre application

#### Sur Vercel :

1. Allez dans votre projet Vercel
2. Settings → Environment Variables
3. Ajoutez :
   - `OPENAI_API_KEY` = `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - `OPENAI_MODEL` = `gpt-4o-mini`
4. Redéployez votre application

## 🧪 Tester la Configuration

### Test Local

```bash
cd Api
node -e "console.log(process.env.OPENAI_API_KEY ? '✅ API Key configured' : '❌ API Key missing')"
```

### Test via l'Application

1. Lancez votre backend : `npm start`
2. Accédez à votre frontend
3. Allez sur la page **Smart Suggestions**
4. Cliquez sur le bouton 🤖 **AI Chef**
5. Essayez un prompt comme : "Je veux un plat réconfortant avec du poulet"
6. Si tout fonctionne, vous verrez 3 nouvelles recettes générées !

## 💰 Coûts et Utilisation

### Modèle Recommandé : `gpt-4o-mini`

- **Prix:** ~$0.00015 par requête (environ 0.015 centime)
- **Très économique** pour un usage normal
- Parfait pour générer des recettes

### Exemple de Coûts

- **100 requêtes** ≈ $0.015 (1.5 centimes)
- **1,000 requêtes** ≈ $0.15 (15 centimes)
- **10,000 requêtes** ≈ $1.50

💡 **Astuce:** Avec $5 de crédits gratuits, vous pouvez faire environ **33,000 requêtes** !

### Alternative : `gpt-3.5-turbo`

Si vous voulez encore plus d'économies :

```env
OPENAI_MODEL=gpt-3.5-turbo
```

- Encore moins cher
- Toujours de bonne qualité

## 🔒 Sécurité

### ✅ Bonnes Pratiques

1. **Ne commitez JAMAIS votre `.env` sur Git**
   - Le fichier `.gitignore` devrait contenir `.env`
2. **Utilisez des variables d'environnement** pour la production
3. **Limitez l'accès** à votre clé API
4. **Régénérez votre clé** si elle est compromise
5. **Configurez des limites de dépenses** sur OpenAI

### ⚠️ Limites de Sécurité Recommandées

Sur votre compte OpenAI, configurez :

1. **Hard Limit:** $10/mois (ou votre budget préféré)
2. **Email Alerts:** Activez les alertes à 50%, 75%, 90% de votre limite

## 🐛 Dépannage

### Erreur : "Invalid API Key"

- ✅ Vérifiez que votre clé commence par `sk-`
- ✅ Assurez-vous qu'il n'y a pas d'espaces avant/après la clé
- ✅ Régénérez une nouvelle clé si nécessaire

### Erreur : "Rate Limit Exceeded"

- ⏱️ Vous faites trop de requêtes trop rapidement
- 💡 Attendez quelques secondes entre les requêtes
- 💰 Vérifiez vos crédits restants

### Erreur : "Insufficient Credits"

- 💳 Ajoutez une méthode de paiement
- 💰 Rechargez vos crédits

### L'IA ne répond pas

1. Vérifiez les logs du backend : `npm start`
2. Vérifiez la console du navigateur (F12)
3. Testez la connexion : `curl https://api.openai.com/v1/models -H "Authorization: Bearer YOUR_KEY"`

## 📊 Monitoring

### Surveiller votre Utilisation

1. Allez sur [https://platform.openai.com/usage](https://platform.openai.com/usage)
2. Consultez vos statistiques :
   - Nombre de requêtes
   - Coût total
   - Tokens utilisés
3. Ajustez vos limites si nécessaire

## 🎯 Fonctionnalités de l'IA

### Ce que l'IA peut faire :

✅ Générer 3 recettes uniques par requête
✅ Adapter les recettes à votre humeur
✅ Utiliser vos ingrédients disponibles
✅ Proposer des recettes rapides ou complexes
✅ Donner des instructions détaillées
✅ Fournir des informations nutritionnelles
✅ Répondre en 3 langues (EN/FR/AR)

### Exemples de Prompts :

- _"Je suis stressé, que puis-je cuisiner pour me détendre ?"_
- _"Plat rapide avec poulet et légumes pour 4 personnes"_
- _"Dessert romantique pour un dîner à deux"_
- _"Recette végétarienne réconfortante"_
- _"Plat énergisant pour après le sport"_

## 🚀 Déploiement en Production

### Checklist

- [ ] Clé API configurée dans les variables d'environnement
- [ ] Limites de dépenses configurées sur OpenAI
- [ ] Alertes email activées
- [ ] Tests effectués en local
- [ ] Variables d'environnement déployées sur Railway/Vercel
- [ ] Application redéployée
- [ ] Tests effectués en production

## 📚 Ressources Supplémentaires

- [Documentation OpenAI](https://platform.openai.com/docs)
- [Pricing OpenAI](https://openai.com/pricing)
- [API Reference](https://platform.openai.com/docs/api-reference)
- [Best Practices](https://platform.openai.com/docs/guides/production-best-practices)

## 💡 Conseils

1. **Commencez petit** : Testez avec le modèle `gpt-4o-mini`
2. **Surveillez les coûts** : Configurez des alertes
3. **Optimisez les prompts** : Des prompts clairs = meilleurs résultats
4. **Cachez les résultats** : Envisagez de sauvegarder les recettes populaires en base de données

---

**Besoin d'aide ?** Consultez la [documentation OpenAI](https://platform.openai.com/docs) ou créez une issue sur GitHub.

🍳 Bon appétit avec votre Assistant Chef IA ! 🤖✨
