# Configuration du Formulaire de Contact

## 📧 Configuration Resend et Variables d'Environnement

### Variables d'environnement requises

Pour que le formulaire de contact fonctionne, vous devez configurer ces variables d'environnement sur Vercel :

```env
RESEND_API_KEY=re_Cx1oD4s3_79CXk4vsV8SJBGdxtj9iPTdH
FROM_EMAIL=contact@gabriel.bigot.com
CONTACT_EMAIL=gabriel.bigot2005@gmail.com
```

### Configuration sur Vercel

1. **Aller sur Vercel Dashboard** : https://vercel.com
2. **Sélectionner votre projet** : Portfolio-gabriel-bigot
3. **Settings** → **Environment Variables**
4. **Ajouter ces 3 variables** :
   - `RESEND_API_KEY` → Votre clé API Resend
   - `FROM_EMAIL` → L'email d'envoi (doit être sur un domaine vérifié dans Resend)
   - `CONTACT_EMAIL` → Votre email personnel où vous recevez les messages

5. **Cocher les environnements** : Production, Preview, Development
6. **Save** et **Redéployer** l'application

### Configuration du domaine dans Resend

#### Si vous utilisez `gabriel.bigot.com` :

1. **Aller sur Resend** → **Domains** → **gabriel.bigot.com**
2. **Vérifier le statut** : Doit être "Verified" ✅
3. **Si "Pending"** : Configurer les enregistrements DNS

#### Enregistrements DNS à configurer :

Allez chez votre fournisseur de domaine et ajoutez ces enregistrements DNS (fournis par Resend) :

**Exemple d'enregistrements (les vôtres seront différents) :**

| Type  | Name/Host          | Value                              | TTL  |
|-------|-------------------|-------------------------------------|------|
| TXT   | @                 | v=spf1 include:spf.resend.com ~all | 3600 |
| CNAME | resend._domainkey | resend._domainkey.resend.com       | 3600 |
| CNAME | resend2._domainkey| resend2._domainkey.resend.com      | 3600 |

#### Vérification :

- **Attendre 5-30 minutes** après ajout des DNS
- **Resend** → **Domains** → Cliquer sur "Verify" si nécessaire
- Le statut passera à **"Verified"** ✅

### Test du formulaire

1. **Redéployer** sur Vercel après avoir ajouté les variables
2. **Aller sur votre site**
3. **Remplir le formulaire de contact**
4. **Envoyer** un message test
5. **Vérifier** votre boîte mail `gabriel.bigot2005@gmail.com`

### Vérification des logs

#### Logs Vercel :
1. **Vercel Dashboard** → Votre projet
2. **Deployments** → Dernier déploiement
3. **Runtime Logs**
4. Chercher :
   - `📧 Contact form submission received`
   - `✅ Email sent successfully via Resend!`
   - Ou des erreurs

#### Logs Resend :
1. **Resend Dashboard** → **Logs**
2. Vous devriez voir les emails envoyés
3. Status : `Delivered` ✅

## 🔧 Dépannage

### Erreur 403 "validation_error"
→ Le domaine n'est pas vérifié dans Resend
→ Solution : Vérifier les enregistrements DNS

### Variables d'environnement non trouvées
→ `hasApiKey: false` dans les logs
→ Solution : Ajouter les variables sur Vercel et redéployer

### Email non reçu
1. Vérifier les **spams**
2. Vérifier les **logs Resend**
3. Vérifier que `CONTACT_EMAIL` est correct
4. Vérifier que le domaine est bien "Verified"

## 📝 Notes importantes

- **Domaine de test** `onboarding@resend.dev` : Ne fonctionne qu'avec l'email du compte Resend
- **Domaine vérifié** `gabriel.bigot.com` : Peut envoyer à n'importe quelle adresse
- **Limite gratuite Resend** : 100 emails/jour (largement suffisant)
- **Délai DNS** : Peut prendre jusqu'à 24h (généralement 5-30 minutes)

## ✅ Checklist de configuration

- [ ] Domaine `gabriel.bigot.com` créé dans Resend
- [ ] Enregistrements DNS configurés chez le fournisseur
- [ ] Domaine marqué comme "Verified" dans Resend
- [ ] Variable `RESEND_API_KEY` ajoutée sur Vercel
- [ ] Variable `FROM_EMAIL` ajoutée sur Vercel
- [ ] Variable `CONTACT_EMAIL` ajoutée sur Vercel
- [ ] Application redéployée sur Vercel
- [ ] Test du formulaire effectué
- [ ] Email de test reçu

---

**Pour toute question, vérifier d'abord les logs Vercel et Resend.**
