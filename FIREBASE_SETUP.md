# Firebase – zprovoznění synchronizace badmintonu

Badminton (a tím i statistika) se synchronizuje živě přes Firebase Firestore mezi všemi
přihlášenými. Wheel a Versus zůstávají lokální. Bez vyplněné konfigurace appka jede
čistě lokálně (synchronizace je vypnutá).

## 1. Založit projekt ve Firebase
1. [console.firebase.google.com](https://console.firebase.google.com) → **Add project**.
2. **Build → Authentication → Get started → Sign-in method → Google → Enable.**
3. **Build → Firestore Database → Create database** (start v produkčním režimu).

## 2. Nasadit pravidla
Ve Firestore → **Rules** vlož obsah [firestore.rules](firestore.rules) a publikuj.
Doporučeno odkomentovat allowlist e-mailů party (viz komentář v souboru).

## 3. Konfigurace v appce
**Project settings → General → Your apps → Web app** (případně registruj novou) →
zkopíruj hodnoty `firebaseConfig`.

- **Lokálně:** zkopíruj [.env.example](.env.example) do `.env.local` a doplň `VITE_FIREBASE_*`.
- **Deploy (GitHub Pages):** v repu **Settings → Secrets and variables → Actions** přidej
  stejné klíče jako *secrets* (`VITE_FIREBASE_API_KEY`, …). Build workflow je injektuje do buildu.

## 4. Povolit domény pro přihlášení
**Authentication → Settings → Authorized domains** → přidej `localhost` (dev) a doménu
GitHub Pages (`<user>.github.io`).

## Jak to funguje
- Synchronizuje se jeden dokument `badminton/shared` (`sets` + `sharedItems`).
- Lokální výběr turnaje (`activeId`) se nesdílí.
- Local-first: funguje i offline, po obnovení sítě se dosyncuje.
- Konflikty: poslední zápis vyhrává na úrovni celého dokumentu (pro jednu partu OK).
