# Captures — TP2 « Le repo malade »

C'est **ici** que vont les captures d'écran du rendu. Le sujet est explicite :
les preuves sont des **captures d'écran**, pas des copier-coller de terminal.

## Ce qu'il faut capturer

### A. Exercice 1 — avant / après (obligatoire)
La même tâche, lancée dans une **session OpenCode neuve**, avant puis après réparation :

> « Ajoute un endpoint GET /rooms/:id/availability?date=YYYY-MM-DD qui renvoie les
> créneaux libres d'une salle sur la journée demandée, avec ses tests. »

- `01-avant-<description>.png` : ce que la chaîne produit sur le dépôt d'origine.
- `02-apres-<description>.png` : le même lancement après les correctifs.
- Idéalement : qui travaille / qui ne travaille jamais, ce qui échoue, le résultat final.

### B. Preuves du diagnostic (recommandé)
Pour chaque problème réparé, une capture de **la commande lancée et de sa réponse** :
- tests avant/après l'inclusion des `*.test.ts` ;
- le test « créneau bout à bout » qui échoue puis passe ;
- le prix `'5020'` puis `70` ;
- le hook pré-commit qui s'exécute sur un commit.

### C. Briques du harness (si illustrées)
- subagents réellement joignables (`opencode agent`) ;
- MCP déclarés / qui répondent ;
- CI verte après réactivation des tests.

## Convention de nommage
`<numéro>-<étape>-<sujet>.png` — ex. `01-avant-ex1.png`, `04-hook-precommit.png`.

## Comment produire les captures
Lancer OpenCode **depuis ce dépôt** (`opencode` à la racine), pour que la chaîne
d'agents `.opencode/` soit bien chargée :

```bash
cd tp2-wael-BENMOUSSA
opencode
```
