# Modèle « Auberge et hôtel » : notes

Site modèle de Maison Dev pour les auberges, hôtels de campagne, chambres d'hôtes et gîtes.
Le commerce affiché, **L'Auberge des Tilleuls**, est fictif : noms, textes, prix, adresse et téléphone sont inventés.

```
modeles/auberge/
├── index.html        structure de la page, les 6 couleurs, le contenu de secours
├── contenu.json      TOUT le contenu : textes, prix, horaires, chambres, avis, liens, photos
├── NOTES.md          ce fichier
└── assets/
    ├── site.css      mise en forme (rien à changer pour un client)
    ├── site.js       lit contenu.json et dessine la page (rien à changer pour un client)
    ├── favicon.svg
    ├── fonts/        Cormorant Garamond et Hanken Grotesk (woff2, licence OFL)
    └── photos/       25 photos en WebP, en deux tailles
```

Pas de framework, pas de Tailwind, pas d'étape de build, aucun appel à Google Fonts.
Pour voir la page en local, il faut un petit serveur (la page lit `contenu.json`) :
`python -m http.server` à la racine du dépôt, puis `http://localhost:8000/modeles/auberge/`.

---

## 1. Ce qu'il faut changer pour un vrai client

### A. `contenu.json` (l'essentiel du travail)

On tape des espaces et des apostrophes ordinaires : le script met tout seul les apostrophes courbes
et les espaces insécables (devant `? ! : ; €`, dans `10 h 30`, `24 m²`).

| Bloc | Ce qu'on y met |
|---|---|
| `modele` | Passer `actif` à `false` (retire les mentions « site modèle »). Changer `signature` en « Site réalisé par Maison Dev ». |
| `etablissement` | Nom, téléphone affiché et `telephoneLien` (format `+33…`), e-mail, adresse, réseaux sociaux. |
| `referencement` | Titre et description pour Google. |
| `menu`, `boutons` | Libellés du menu et des boutons. Les liens (`#chambres`, `#restaurant`…) restent tels quels. |
| `accueil` | Lieu, nom, phrase d'ambiance, photo (grande, petite, version téléphone). |
| `reservation` | **`formsubmit` : l'adresse e-mail du client.** Textes du panneau, de la fenêtre de demande et des messages d'erreur. |
| `univers` | Les quatre panneaux : titre, phrase, bouton, photo. `lien` mène à une section ; `demande` ouvre la fenêtre de demande. |
| `chambres` | Une entrée par chambre : nom, description, surface, personnes, équipements, prix, photo. |
| `restaurant` | Texte, extrait de carte avec prix, menu, horaires, deux photos. |
| `avis` | Les vrais avis. **Vider `mention` et `explication`** (sinon « Avis d'exemple » reste affiché). |
| `offres` | 2 ou 3 offres : titre, texte, prix, photo. `demande` vaut `sejour` ou `evenement`. |
| `galerie` | 10 photos avec leur légende (la grille est dessinée pour des groupes de 10). |
| `faq` | Les questions et les réponses. |
| `contact` | Horaires de la réception, phrase d'accès, `carte.recherche` (l'adresse exacte pour Google Maps). |
| `piedDePage` | Phrase, titres des colonnes, mentions légales. |

Équipements disponibles pour les chambres (clé à écrire dans `equipements`) :
`wifi`, `clim`, `douche`, `bain`, `vue`, `cheminee`, `terrasse`, `cafe`.
Leur libellé se règle dans `chambres.equipements`.

### B. Les photos (`assets/photos/`)

Chaque photo existe en deux fichiers : `nom.webp` (1600 px de large au plus) et `nom-800.webp` (800 px).
Dans `contenu.json`, `src` est la grande, `petite` est la petite. Trois réglages facultatifs :

- pas de `petite` : la grande sert partout (plus lourd, mais ça marche) ;
- `"position": "80% 50%"` : recadre la photo dans son cadre (utile pour les portes en voûte) ;
- pas de `src` : un cadre « Photo à venir » s'affiche avec la légende `alt`. Pratique pour livrer une maquette avant d'avoir les photos.

La photo d'accueil a une troisième version, `accueil-mobile.webp` (recadrage vertical 800 × 1200), pour le téléphone.

Pour fabriquer les deux tailles (avec Python et Pillow) :

```python
from PIL import Image
im = Image.open("photo.jpg").convert("RGB")
for largeur, suffixe, qualite in [(1600, "", 72), (800, "-800", 70)]:
    copie = im.copy(); copie.thumbnail((largeur, largeur))
    copie.save(f"assets/photos/nom{suffixe}.webp", "WEBP", quality=qualite, method=6)
```

Le plus simple est de garder les mêmes noms de fichiers : il n'y a alors rien à toucher dans `contenu.json` pour les chemins.

### C. Les 6 couleurs (`index.html`, bloc `:root` tout en haut)

```css
--fond          fond de page
--surface       surfaces et cartes
--texte         texte
--texte-2       texte secondaire
--accent        boutons et liens
--accent-chaud  détails et survol
```

Tout le reste (traits, voiles, survols) est calculé à partir de ces six valeurs.
À vérifier après changement : `--accent` doit rester assez foncé pour porter du texte clair (boutons, section des avis),
et `--accent-chaud` ne sert jamais de couleur de texte.

### D. Quelques lignes de `index.html` (repérées par « À ADAPTER POUR UN VRAI CLIENT »)

1. `<title>`, description et balises `og:` dans le `<head>`.
2. Le bloc de secours (accueil + section « secours » + pied de page) : c'est ce qui s'affiche si JavaScript ne charge pas. Facultatif mais conseillé.
3. La couleur `theme-color` et `assets/favicon.svg` (la feuille de tilleul).

### E. Avant la mise en ligne

- Retirer `<meta name="robots" content="noindex">` **après validation de Léo**.
- FormSubmit : la première demande envoyée à une nouvelle adresse déclenche un e-mail d'activation, à faire cliquer par le client.
- Relire les mentions légales (`piedDePage.mentions`) avec les vraies informations de l'éditeur.

---

## 2. Comment marche la demande de réservation

Le panneau de l'accueil (arrivée, départ, adultes, enfants) ouvre une fenêtre qui demande le nom, l'e-mail et le téléphone,
puis envoie le tout par e-mail avec FormSubmit. **Aucun paiement, aucune disponibilité en direct** : l'auberge répond à la main.

- Dates : arrivée à partir d'aujourd'hui, départ après l'arrivée. Par défaut, le prochain vendredi et deux nuits.
- La même fenêtre sert pour « Réserver une table » et pour les événements (séminaires, mariages).
- Si l'envoi échoue, un lien e-mail prêt à envoyer s'affiche : une demande n'est jamais perdue.
- Dans le modèle, l'adresse est `contact@maison-dev.com` (la même que le site principal) et la fenêtre le dit clairement.

---

## 3. Inspirations

**vineyard.co.za** (l'esprit voulu par Léo). Idées de structure reprises : grande image d'accueil plein écran,
barre de réservation toujours à portée (en-tête fixe, barre du bas sur téléphone), quatre grandes entrées thématiques,
cartes de chambres, avis avec leur origine, offres, FAQ.
Rien n'est repris de leur nom, logo, textes, photos, vidéos ou code. La forme signature du modèle, l'arcade de quatre portes en voûte, n'existe pas chez eux.

**Sites vus sur awwwards.com/websites/hotel/** (lecture de leur structure, novembre 2026) :

| Site | Distinction | Ce qui est repris |
|---|---|---|
| Tengile Malamala Collection | Site of the Day, 3 oct. 2026 | La sobriété : deux couleurs dominantes (blanc cassé et vert olive), grandes images, petits mouvements discrets. |
| Masia Mont Rural | Honorable Mention, 21 sept. 2026 | Le téléphone répété aux endroits utiles et la demande par formulaire avec dates et nombre de personnes, adaptée à une petite maison rurale. |
| KUBE Saint-Tropez | Honorable Mention, 27 août 2026 | Deux intentions de réservation (« une chambre », « une table »), mise en page photo + texte en deux colonnes pour le restaurant, cartes image + titre + un seul bouton. |

Animations retenues : le titre d'accueil qui monte au chargement, les quatre portes qui s'ouvrent l'une après l'autre,
une apparition douce des blocs, un léger zoom des photos au survol. Aucune section ne retient le défilement.
Tout s'éteint avec `prefers-reduced-motion`.

---

## 4. Photos (Unsplash, licence gratuite, usage commercial autorisé)

Aucune image générée par IA. Toutes viennent d'Unsplash, hors catalogue payant « Unsplash+ ».

| Fichier | Auteur | Lien |
|---|---|---|
| `accueil` (+ `accueil-mobile`) | Aleksandrs Karevs | https://unsplash.com/photos/_LCnNnM0cyc |
| `univers-dormir` | Clay Banks | https://unsplash.com/photos/UrvtBb0-YEw |
| `univers-manger` | Steffen Lemmerzahl | https://unsplash.com/photos/z9MAxYlXv3s |
| `univers-detendre` | Nick George | https://unsplash.com/photos/cCb5SMpxusA |
| `univers-reunir` | Bruno Ngarukiye | https://unsplash.com/photos/YrThd1lBFu4 |
| `chambre-tilleul` | Clay Banks | https://unsplash.com/photos/OZhn6zYiVVE |
| `chambre-lavande` | Clay Banks | https://unsplash.com/photos/SEnVV0000Z8 |
| `chambre-vignes` | Clay Banks | https://unsplash.com/photos/Ph2AIj8vOwo |
| `chambre-grenier` | Clay Banks | https://unsplash.com/photos/W3bI-XFSu5A |
| `suite-pigeonnier` | Clay Banks | https://unsplash.com/photos/SpDKzy83DmY |
| `restaurant-table` | Kamilla Isalieva | https://unsplash.com/photos/JDjarj_oSyo |
| `restaurant-assiette` | Adam Jaime | https://unsplash.com/photos/oFljzK61O1s |
| `offre-escapade` | Nadia Valko | https://unsplash.com/photos/0hAdietsUrE |
| `offre-seminaire` | sarah b | https://unsplash.com/photos/BJqzjxwQhK8 |
| `offre-sejour` | Ronan Laker | https://unsplash.com/photos/0qPy8pYlG1s |
| `galerie-vallee` | Rich Martello | https://unsplash.com/photos/xd95FDKThNk |
| `galerie-mas` | Jean-Nicolas Fahrenberg | https://unsplash.com/photos/5DdxjQNUmO4 |
| `galerie-volets` | Chantal Garnier | https://unsplash.com/photos/kp0_HmAOF-I |
| `galerie-petit-dejeuner` | Jakub Żerdzicki | https://unsplash.com/photos/Vr2TeXxV7jo |
| `galerie-lavande` | le Sixième Rêve | https://unsplash.com/photos/pTCXPZIcLog |
| `galerie-couchant` | Janko Ferlič | https://unsplash.com/photos/PLE2LylrXfY |
| `galerie-tonnelle` | Mitch Botsford | https://unsplash.com/photos/UAV4Zf8aczw |
| `galerie-terrasse` | Margit Knobloch | https://unsplash.com/photos/ktGEq_ZGjJg |
| `galerie-lumiere` | Lis Dingjan | https://unsplash.com/photos/oebB9bcNhbk |
| `galerie-jardin` | Kamilla Isalieva | https://unsplash.com/photos/NiJ4fEBdnr0 |

Chaque fichier existe aussi en `-800.webp`. Poids total du dossier : environ 5,8 Mo.

À savoir : ces photos sont des images d'ambiance. Les chambres ont un air plus américain que drômois,
et la ferme de l'accueil est toscane. Pour un client, on les remplace par les siennes.

---

## 5. Polices

- **Cormorant Garamond** (titres) : 500, 400 italique, 500 italique. Fichiers statiques : la version variable plaçait mal les accents.
- **Hanken Grotesk** (texte) : fichier variable.

Sous-ensemble latin (tous les caractères français, `œ`, `€`). Licences OFL dans `assets/fonts/`.

---

## 6. Vérifications faites (11 novembre 2026)

| Vérification | Résultat |
|---|---|
| Captures à 390 px et 1366 px, de haut en bas | Aucun débordement horizontal, aucune erreur dans la console. |
| Lighthouse téléphone, performance | 97 à 98 sur trois mesures avec compression (comme GitHub Pages), 94 sans compression. |
| Lighthouse téléphone, accessibilité | 100 |
| Lighthouse téléphone, bonnes pratiques | 100 |
| Lighthouse téléphone, référencement | **66 avec `noindex`** (seul point perdu : la page demande à ne pas être indexée). **100** sur une copie sans cette balise. |
| Formulaire | 46 contrôles automatiques réussis : champs obligatoires, dates cohérentes, e-mail et téléphone, confirmation, échec d'envoi, table, événement, offre. |
| Carrousels | Glisser au doigt testé avec de vrais événements tactiles. Un geste vertical sur un carrousel fait bien défiler la page. |
| Galerie | Clic, flèches, clavier, glisser, Échap. |
| Sans JavaScript, ou si `contenu.json` ne charge pas | Le contenu de secours s'affiche (nom, phrase, téléphone, e-mail, chambres et prix, adresse). |
| `prefers-reduced-motion` | Tout est visible, sans animation. |

Mesures faites en local. Pendant les tests, les appels à FormSubmit étaient interceptés : **aucun vrai e-mail n'a été envoyé**.

---

## 7. Limites connues

- L'envoi réel par FormSubmit n'a pas été essayé de bout en bout (pour ne pas envoyer de faux messages). Le code suit celui du site principal.
- Pas de vidéo à l'accueil : une photo, plus légère. On pourra en ajouter une si un client en fournit.
- La carte Google Maps montre Nyons en général, puisque l'adresse est inventée.
- Les mentions légales sont un texte de départ. Il n'y a pas de page de politique de confidentialité propre au modèle.
- Le format d'affichage des dates dans les champs dépend de la langue de l'appareil du visiteur.
- La grille de la galerie est pensée pour 10 photos. Avec un autre nombre, elle reste propre mais moins équilibrée.
- Pas de données structurées (JSON-LD « LodgingBusiness ») : à ajouter pour un vrai client, avec ses vraies informations.
