# 🚂 Configuration Railway - Action Requise Immédiatement !

## ⚠️ PROBLÈME ACTUEL

L'erreur **500 Internal Server Error** que vous rencontrez est causée par l'absence de la clé API OpenAI dans les variables d'environnement de Railway.

## ✅ SOLUTION (5 minutes)

### Étape 1 : Obtenir une Clé API OpenAI

1. **Créez un compte** : [https://platform.openai.com/signup](https://platform.openai.com/signup)
2. **Connectez-vous** : [https://platform.openai.com/](https://platform.openai.com/)
3. **Générez une clé API** :
   - Allez dans **API Keys** : [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Cliquez sur **"Create new secret key"**
   - Nommez-la : "MoodBite Kitchen"
   - **COPIEZ LA CLÉ** immédiatement (format : `sk-proj-xxxxx...`)
   - ⚠️ Vous ne pourrez plus la voir après !

### Étape 2 : Configurer Railway

#### Option A : Via l'Interface Web (Recommandé)

1. **Connectez-vous à Railway** : [https://railway.app](https://railway.app)
2. **Sélectionnez votre projet** : "CookingBlog Backend" ou similaire
3. **Cliquez sur "Variables"** (dans le menu latéral)
4. **Ajoutez ces 2 variables** :

   | Variable         | Valeur                           |
   | ---------------- | -------------------------------- |
   | `OPENAI_API_KEY` | `sk-proj-votre-clé-complète-ici` |
   | `OPENAI_MODEL`   | `gpt-4o-mini`                    |

5. **Cliquez sur "Add"** pour chaque variable
6. **Railway redéploiera automatiquement** (environ 1-2 minutes)

#### Option B : Via Railway CLI

```bash
# Installez Railway CLI si nécessaire
npm install -g @railway/cli

# Connectez-vous
railway login

# Lien avec votre projet
railway link

# Ajoutez les variables
railway variables set OPENAI_API_KEY=sk-proj-votre-clé-ici
railway variables set OPENAI_MODEL=gpt-4o-mini

# Redéployez
railway up
```

### Étape 3 : Vérifier

1. **Attendez 1-2 minutes** que Railway redéploie
2. **Vérifiez les logs Railway** :
   - Cliquez sur "Deployments"
   - Cliquez sur le dernier déploiement
   - Regardez les logs pour vérifier qu'il n'y a pas d'erreur
3. **Testez sur votre site** :
   - Allez sur votre site web
   - Page **Smart Suggestions**
   - Cliquez sur le bouton 🤖
   - Essayez : "Je veux un plat réconfortant avec du poulet"
   - ✅ Vous devriez voir 3 nouvelles recettes !

## 🔍 Vérification des Variables

Pour vérifier que vos variables sont bien configurées sur Railway :

1. Allez dans **Variables** de votre projet
2. Vous devriez voir :
   - ✅ `OPENAI_API_KEY` = `sk-proj-...` (masqué)
   - ✅ `OPENAI_MODEL` = `gpt-4o-mini`
   - ✅ `MONGO` = votre connexion MongoDB
   - ✅ `JWT_SECRET` = votre secret
   - etc.

## 💰 Informations sur les Coûts

Ne vous inquiétez pas pour les coûts !

- **Crédits gratuits** : OpenAI offre **$5 gratuits** pour les nouveaux comptes
- **Coût par requête** : ~$0.00015 (0.015 centime)
- **Avec $5** : environ **33,000 requêtes** possibles
- **Usage normal** : 10-100 requêtes/jour = quasiment gratuit

### Configurer des Limites (Recommandé)

Pour éviter toute surprise :

1. Allez sur [https://platform.openai.com/account/billing/limits](https://platform.openai.com/account/billing/limits)
2. Configurez **Hard Limit** : `$10.00` par mois
3. Activez les **alertes email** à 50%, 75%, 90%

## 🐛 Dépannage

### L'erreur 500 persiste ?

**Vérifiez les logs Railway** :

```bash
railway logs
```

Ou via l'interface web : Deployments → Dernier déploiement → View Logs

**Erreurs courantes** :

1. **"Invalid API Key"**

   - ✅ Vérifiez que la clé commence par `sk-proj-` ou `sk-`
   - ✅ Pas d'espaces avant/après
   - ✅ La clé est complète (environ 50-100 caractères)

2. **"OpenAI API key is not configured"**

   - ✅ Assurez-vous d'avoir bien ajouté la variable sur Railway
   - ✅ Attendez que le redéploiement soit terminé
   - ✅ Rafraîchissez la page

3. **"Rate limit exceeded"**
   - ⏱️ Attendez quelques secondes entre les requêtes
   - 💰 Vérifiez vos crédits sur OpenAI

### Tester la Connexion OpenAI

Pour tester localement :

```bash
cd Api
npm install
# Créez un fichier .env avec OPENAI_API_KEY=...
npm start
```

Puis testez l'endpoint :

```bash
curl -X POST https://cookingblog-backend-production.up.railway.app/api/recipes/ai-suggestions \
  -H "Content-Type: application/json" \
  -H "Accept-Language: en" \
  -d '{"prompt": "I want comfort food with chicken", "servings": 2}'
```

## 📊 Monitoring

### Surveiller l'Usage OpenAI

1. **Dashboard** : [https://platform.openai.com/usage](https://platform.openai.com/usage)
2. **Consultez** :
   - Nombre de requêtes aujourd'hui
   - Coût cumulé
   - Crédits restants

### Logs Railway

Surveillez les logs en temps réel :

```bash
railway logs --follow
```

Vous verrez :

- `🤖 Calling OpenAI with prompt:...`
- `✅ OpenAI Response received`
- `📦 Parsed OpenAI response:...`

## ✅ Checklist de Configuration

- [ ] Compte OpenAI créé
- [ ] Clé API générée et copiée
- [ ] Variable `OPENAI_API_KEY` ajoutée sur Railway
- [ ] Variable `OPENAI_MODEL` ajoutée sur Railway
- [ ] Railway a redéployé automatiquement
- [ ] Logs Railway vérifiés (pas d'erreur)
- [ ] Test effectué sur le site web
- [ ] Limites de dépenses configurées sur OpenAI
- [ ] Alertes email activées

## 🎯 Résultat Attendu

Une fois configuré, l'assistant IA :

✅ Génère 3 recettes uniques par requête
✅ Adaptées à votre humeur et ingrédients
✅ En moins de 5 secondes
✅ Dans votre langue (EN/FR/AR)
✅ Avec instructions complètes

## 📞 Support

Si le problème persiste après avoir suivi ce guide :

1. **Vérifiez les logs Railway** pour l'erreur exacte
2. **Consultez** [AI_SETUP_GUIDE.md](./AI_SETUP_GUIDE.md) pour plus de détails
3. **Créez une issue** sur GitHub avec les logs d'erreur

---

**🚀 Une fois configuré, votre assistant IA sera opérationnel et créera des recettes incroyables !**

