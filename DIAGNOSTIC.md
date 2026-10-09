# DIAGNOSTIC — repo `salles-api`

Document établi en explorant le dépôt et en **exécutant** chaque vérification.
Chaque problème indique : **symptôme**, **cause** (fichier), **brique du cours**,
**preuve**, **correctif**.

Environnement : Node `v22.23.3`, npm `10.9.9`, git `2.34.1`, commit de départ `ab57521`.

---

## 1. Problèmes corrigés

### 1.1 Les fichiers de test `.test.ts` n'étaient jamais exécutés
- **Symptôme** : `npm run test:unit` était vert (5 tests) alors que deux fichiers de
  test entiers n'étaient pas collectés.
- **Cause** : `vitest.config.ts:7` — `include: ["test/**/*.spec.ts"]`. Un `include`
  explicite remplace le motif par défaut de Vitest et n'accepte que `.spec.ts` ;
  `test/bookings.test.ts` (5 cas) et `test/price.test.ts` (4 cas) étaient ignorés.
- **Brique** : Tests.
- **Preuve** : avant = 2 fichiers / 5 passés / 4 ignorés ; après = 4 fichiers / 14 passés / 4 ignorés.
  Traces : `/tmp/opencode/tests_before.txt`, `/tmp/opencode/tests_after.txt`.
- **Correctif** : `include: ["test/**/*.{test,spec}.ts"]`.

### 1.2 `overlaps()` refusait deux créneaux consécutifs (bug révélé par les tests)
- **Symptôme** : `POST /bookings` renvoyait `409` pour une réservation commençant
  exactement quand la précédente finissait. Test `bookings.test.ts:85` → `expected 409 to be 201`.
- **Cause** : `src/lib/overlap.ts:11` — `a1 <= b2 && b1 <= a2`, comparaison **non stricte**
  alors que le module documente un créneau semi-ouvert `[début, fin[` (`overlap.ts:4`).
- **Brique** : Tests / logique métier.
- **Preuve** : le test ignoré `test/overlap.spec.ts:27` décrit déjà ce cas (« bout à bout »).
- **Correctif** : `return a1 < b2 && b1 < a2;`. Résultat : `bookings.test.ts` 5/5 verts.

### 1.3 Majoration de week-end : concaténation de chaînes au lieu d'une addition
- **Symptôme** : `price.test.ts:13` → `expected '5020' to be 70`.
- **Cause** : `src/lib/price.ts:5` — `const WEEKEND_SURCHARGE = "20";` (chaîne) ; ligne 19
  `base + WEEKEND_SURCHARGE` concatène (`50 + "20"` → `"5020"`).
- **Brique** : Lint et types.
- **Preuve** : l'erreur montre une chaîne `'5020'` et non un nombre.
- **Correctif** : `const WEEKEND_SURCHARGE = 20;`.

### 1.4 `@ts-nocheck` masquait l'erreur de type ci-dessus
- **Symptôme** : `npm run typecheck` restait vert malgré une fonction annotée `: number`
  qui renvoyait une chaîne.
- **Cause** : `src/lib/price.ts:1` — `// @ts-nocheck` désactive le contrôle de type du module.
- **Brique** : Lint et types.
- **Correctif** : directive retirée ; `tsc --noEmit` reste vert après la correction 1.3.

### 1.5 `AGENTS.md` prescrivait une commande inexistante
- **Symptôme** : `npm test` → `npm error Missing script: "test"`.
- **Cause** : `AGENTS.md` impose `npm test` « avant tout commit », mais `package.json`
  ne définissait que `test:unit`.
- **Brique** : Rules.
- **Correctif** : ajout de `"test": "vitest run"` dans `package.json`.

### 1.6 Le hook Git pré-commit n'était pas branché
- **Symptôme** : `.husky/pre-commit` existait mais ne s'exécutait jamais.
- **Cause** : `husky` absent des dépendances, aucun script `prepare`, `core.hooksPath`
  non défini, `.husky/_/husky.sh` manquant et fichier de hook non exécutable.
- **Brique** : Hooks.
- **Preuve** : `git config core.hooksPath` vide ; exécution directe du hook = lint + typecheck + tests.
- **Correctif** : `husky@8.0.3` en devDependency, script `prepare: husky install`,
  `core.hooksPath=.husky`, `chmod +x .husky/pre-commit`.

### 1.7 La CI ne lançait pas les tests
- **Symptôme** : CI verte sans exécuter la suite de tests.
- **Cause** : `.github/workflows/ci.yml:19` — ligne de test commentée (`# TODO remettre`).
- **Brique** : CI et Git.
- **Correctif** : ligne `npm run test:unit` réactivée.

### 1.8 `planner` était un agent principal au lieu d'un subagent
- **Symptôme** : le dépôt comptait 2 agents `primary` (`architect`, `planner`) + 5
  subagents, alors que le README annonce « un agent principal `architect` et six subagents ».
- **Cause** : `.opencode/agent/planner.md:3` — `mode: primary`.
- **Brique** : Subagents.
- **Preuve** : `architect.md` liste `planner` dans son équipe de subagents à qui déléguer.
- **Correctif** : `mode: subagent`. On obtient 1 primary + 6 subagents.

### 1.9 `tester` était absent de la table d'équipe de l'architecte
- **Symptôme** : `tester.md` existe et `architect.md` le cite (« a `tester` run »),
  mais il n'apparaît pas dans la table de délégation → jamais sollicité.
- **Cause** : `.opencode/agent/architect.md` — table « Your team ».
- **Brique** : Subagents.
- **Correctif** : ajout d'une ligne `tester` dans la table.

### 1.10 `explorer` pouvait modifier n'importe quel fichier
- **Symptôme** : `explorer` a pour rôle de lire et d'écrire uniquement ses notes, mais
  disposait de `edit: allow` global.
- **Cause** : `.opencode/agent/explorer.md` — permission `edit: allow`.
- **Brique** : Droits.
- **Correctif** : `edit` restreint à `.opencode/plans/**` (là où il dépose ses notes).

---

## 2. Problèmes repérés, NON corrigés (et pourquoi)

### 2.1 Contradiction de rôle chez `architect`
`architect.md` se décrit comme « Never writes code » mais accorde `edit: allow` et
`bash: {"*": allow}`. Son corps de prompt dit pourtant « you also have full access to the
repository ». Contradiction **interne** : impossible de trancher entre « il ne doit pas
écrire » (description) et « il a un accès complet » (corps + permissions) sans arbitrage
pédagogique. **Signalé, non modifié** pour éviter un faux positif (le sujet prévient que
tout signaler à tort est pénalisé).

### 2.2 La commande `/ship` contourne les garde-fous
`.opencode/command/ship.md` ordonne `git add -A`, `commit`, `push` et interdit de
relancer les checks ou de demander une relecture. C'est cohérent avec l'idée d'un hook
post-écriture, mais entre en tension avec les rôles `reviewer`/`tester`. Choix
possiblement délibéré → **signalé, non modifié**.

### 2.3 Commentaire obsolète dans `scripts/checks.sh`
`scripts/checks.sh:2` affirme être branché via `experimental.hook.file_edited` dans
`opencode.json` ; cette clé **n'existe pas**. Le mécanisme réel est le plugin
`.opencode/plugin/checks.js` (`tool.execute.after`), qui est bien présent et cohérent.
Simple commentaire périmé → **signalé, non modifié**.

### 2.4 MCP
`opencode.json` déclare 6 serveurs MCP. `salles-db` pointe vers
`https://mcp.internal.salles.lan/db` : **injoignable** (DNS non résolu, preuve :
`Could not resolve host`). Les autres (`github`, `notion`, `slack`, `sentry`,
`playwright`) n'ont pas été lancés (nécessitent `npx`/réseau/identifiants). Non modifié :
retirer un MCP pourrait être une perte si l'infrastructure interne est rétablie.

### 2.5 Faux positif assumé : `.env` suivi par Git
`.env` est bien versionné, mais ses valeurs sont explicitement commentées comme
« JEU DE DONNEES PEDAGOGIQUE, aucune valeur reelle ». Ce n'est **pas** une fuite de
secret → volontairement non signalé comme défaut.

### 2.6 Tests ignorés volontaires
Les 4 `skip` de `test/overlap.spec.ts` sont documentés (fixture
`test/fixtures/legacy-bookings.json` jamais versée, INFRA-198). Comportement normal,
laissés en place.

---

## 3. État des filets après correction

| Vérification | Résultat |
|---|---|
| `npm test` / `npm run test:unit` | 4 fichiers, 14 passés, 4 ignorés |
| `npm run lint` | vert |
| `npm run typecheck` | vert |
| `.husky/pre-commit` | branché et vert |

---

## 4. Limites de ce diagnostic (à compléter)

- **Captures avant/après de la tâche de l'exercice 1** : non produites ici. Le sujet
  exige des captures d'écran issues d'une session OpenCode neuve lançant la tâche
  « GET /rooms/:id/availability » avant puis après réparation. À faire depuis le dépôt.
- **Test réel des MCP** : non exécuté (réseau/identifiants).
- **Couverture / mutation testing / contexte consommé** : non mesurés.
- Les correctifs ont été validés par les commandes ci-dessus ; aucun commit n'a été créé.
