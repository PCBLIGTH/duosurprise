# 🔍 Test du Menu Contact - Instructions

## Pour tester si le menu Contact fonctionne :

### 1. Ouvrez votre site
Allez sur : `http://localhost:3000`

### 2. Ouvrez la Console du navigateur
- **Sur Mac** : Appuyez sur `Cmd + Option + J`
- **Sur Windows** : Appuyez sur `F12` puis cliquez sur "Console"

### 3. Tapez cette commande dans la console :
```javascript
document.querySelector('#contact')
```

**Si ça retourne quelque chose** (pas `null`), alors la section contact existe ✅

### 4. Testez le scroll manuellement :
Tapez cette commande dans la console :
```javascript
document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' })
```

**Si la page défile vers Contact**, alors le problème vient du clic sur le lien ❌

### 5. Vérifiez les event listeners :
Tapez :
```javascript
document.querySelectorAll('.nav-links a[href^="#"]').length
```

**Vous devriez voir le nombre `4`** (pour les 4 liens : Accueil, Comment ça marche, Cadeaux, Contact)

---

## 🐛 Si rien ne fonctionne :

Rechargez la page avec **Cmd+Shift+R** (Mac) ou **Ctrl+Shift+R** (Windows) pour vider le cache.

---

## ✅ Solution rapide :

Si vous voulez juste que ça fonctionne MAINTENANT, ajoutez ce code dans la console :

```javascript
document.querySelector('a[href="#contact"]').addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
});
```

Puis cliquez sur "Contact" dans le menu.

---

**Faites ces tests et dites-moi ce qui se passe !** 🚀
