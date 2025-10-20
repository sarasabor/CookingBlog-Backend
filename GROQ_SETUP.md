# 🚀 Configuration Groq (100% GRATUIT) ⚡

## 🎉 Pourquoi Groq ?

- ✅ **COMPLÈTEMENT GRATUIT** (pas de carte bancaire requise)
- ✅ **PLUS RAPIDE qu'OpenAI** (vraiment !)
- ✅ **Génère de vraies nouvelles recettes**
- ✅ **30 requêtes/minute** (largement suffisant)
- ✅ **Excellente qualité** avec Llama 3.1 70B

## ⚡ Configuration Express (3 minutes)

### Étape 1 : Créer un Compte Groq

1. **Allez sur** : [https://console.groq.com/signup](https://console.groq.com/signup)
2. **Inscrivez-vous** avec :
   - Email + mot de passe
   - Ou Google/GitHub
3. **Vérifiez votre email** (cliquez sur le lien)

### Étape 2 : Obtenir votre Clé API

1. **Connectez-vous** : [https://console.groq.com/](https://console.groq.com/)
2. **Allez dans "API Keys"** : [https://console.groq.com/keys](https://console.groq.com/keys)
3. **Cliquez sur "Create API Key"**
4. **Nommez-la** : `MoodBite Kitchen`
5. **Cliquez sur "Submit"**
6. **COPIEZ LA CLÉ** (format : `gsk_xxxxxxxxxxxxxxxxx`)
   - ⚠️ Sauvegardez-la tout de suite !

### Étape 3 : Configurer Railway

#### Via l'Interface Web (Recommandé) :

1. **Allez sur Railway** : [https://railway.app](https://railway.app)
2. **Sélectionnez votre projet Backend**
3. **Cliquez sur "Variables"**
4. **Ajoutez ces 2 variables** :

   | Variable       | Valeur                       |
   | -------------- | ---------------------------- |
   | `GROQ_API_KEY` | `gsk_votre-clé-complète-ici` |
   | `GROQ_MODEL`   | `llama-3.1-70b-versatile`    |

5. **Cliquez sur "Add"** pour chaque variable
6. **Railway redéploiera automatiquement** (1-2 minutes)

#### Via Railway CLI :

```bash
railway variables set GROQ_API_KEY=gsk_votre-clé-ici
railway variables set GROQ_MODEL=llama-3.1-70b-versatile
```

### Étape 4 : Tester !

1. **Attendez 1-2 minutes** que Railway redéploie
2. **Allez sur votre site** : [https://www.moodbitekitchen.com](https://www.moodbitekitchen.com)
3. **Cliquez sur Smart Suggestions**
4. **Cliquez sur le bouton 🤖**
5. **Essayez** : "Je veux un plat réconfortant avec du poulet"
6. **✨ MAGIE !** 3 nouvelles recettes en 3-5 secondes !

## 🎯 Vérification

### Dans Railway Variables, vous devez avoir :

```
✅ GROQ_API_KEY = gsk_••••••••••••• (masqué)
✅ GROQ_MODEL = llama-3.1-70b-versatile
```

### Dans les Logs Railway, vous devriez voir :

```
🤖 Using AI Provider: Groq
🤖 Calling Groq with prompt: ...
✅ Groq Response received
📦 Parsed Groq response: ...
```

## 📊 Modèles Groq Disponibles

| Modèle                    | Vitesse    | Qualité    | Recommandé pour |
| ------------------------- | ---------- | ---------- | --------------- |
| `llama-3.1-70b-versatile` | ⚡⚡⚡     | ⭐⭐⭐⭐⭐ | **Recettes** ✅ |
| `llama-3.1-8b-instant`    | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐   | Très rapide     |
| `mixtral-8x7b-32768`      | ⚡⚡⚡     | ⭐⭐⭐⭐   | Contexte long   |
| `gemma2-9b-it`            | ⚡⚡⚡⚡   | ⭐⭐⭐     | Léger et rapide |

**Recommandation** : Utilisez `llama-3.1-70b-versatile` (par défaut) - excellent équilibre !

## 💡 Limites Groq (Gratuites)

| Limite          | Valeur      |
| --------------- | ----------- |
| Requêtes/minute | 30          |
| Requêtes/jour   | 14,400      |
| Tokens/minute   | 6,000       |
| **Coût**        | **$0.00 !** |

Pour votre application, c'est largement suffisant ! 🎉

## 🐛 Dépannage

### Erreur : "Invalid API Key"

- ✅ Vérifiez que la clé commence par `gsk_`
- ✅ Pas d'espaces avant/après
- ✅ Attendez que Railway ait fini de redéployer

### Erreur : "Rate limit exceeded"

- ⏱️ Attendez 1 minute
- 💡 Vous faites plus de 30 requêtes/minute
- 📊 Pour 99% des usages, c'est impossible d'atteindre cette limite

### L'IA ne répond pas

1. **Vérifiez les logs Railway** : Deployments → Dernier déploiement → View Logs
2. **Vérifiez les variables** : Variables → GROQ_API_KEY doit être présent
3. **Testez la clé** :

   ```bash
   curl https://api.groq.com/openai/v1/models \
     -H "Authorization: Bearer gsk_votre-clé"
   ```

## 🆚 Groq vs OpenAI

| Critère                | Groq ⚡                 | OpenAI 💰                 |
| ---------------------- | ----------------------- | ------------------------- |
| **Coût**               | **GRATUIT** 🎉          | ~$0.50/mois               |
| **Vitesse**            | **Plus rapide** ⚡⚡⚡  | Rapide ⚡⚡               |
| **Qualité**            | Excellente ⭐⭐⭐⭐     | Excellente ⭐⭐⭐⭐⭐     |
| **Limite**             | 30 requêtes/min         | Très haute                |
| **Configuration**      | Aucune carte requise ✅ | Carte bancaire requise ❌ |
| **Nouvelles recettes** | ✅ Oui                  | ✅ Oui                    |
| **Setup**              | 3 minutes               | 5 minutes                 |

**Verdict** : **Groq est parfait pour votre cas d'usage !** 🏆

## 🎓 Ressources

- **Dashboard Groq** : [https://console.groq.com/](https://console.groq.com/)
- **Documentation** : [https://console.groq.com/docs](https://console.groq.com/docs)
- **Modèles disponibles** : [https://console.groq.com/docs/models](https://console.groq.com/docs/models)
- **Support** : [https://console.groq.com/support](https://console.groq.com/support)

## 🔄 Passer de OpenAI à Groq

Si vous aviez déjà configuré OpenAI :

1. **Ajoutez simplement** `GROQ_API_KEY` sur Railway
2. **L'application utilisera automatiquement Groq** (priorité)
3. **OpenAI reste en fallback** si Groq ne fonctionne pas

Les deux peuvent coexister ! Le code choisit automatiquement Groq car c'est gratuit et rapide.

## ✅ Checklist

- [ ] Compte Groq créé
- [ ] Clé API générée et copiée
- [ ] Variable `GROQ_API_KEY` ajoutée sur Railway
- [ ] Variable `GROQ_MODEL` ajoutée sur Railway
- [ ] Railway a redéployé
- [ ] Test sur le site web réussi
- [ ] 3 nouvelles recettes générées ! 🎉

---

**🚀 Profitez de votre Assistant Chef IA GRATUIT et RAPIDE ! 🤖✨**
