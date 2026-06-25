import { useEffect } from "react";

import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";

import { db, isFirebaseConfigured } from "../firebase";

import useAuth from "./useAuth";
import { NameSet, useSetStore, WheelItem } from "./useWheelStore";

// Tvar dat sdílených v cloudu (jeden společný badmintonový dataset).
interface BadmintonDoc {
  sets: NameSet[];
  sharedItems: WheelItem[];
}

// Jeden společný dokument pro všechny – kolekce "badminton", dokument "shared".
const badmintonDocRef = () => doc(db, "badminton", "shared");

// Z badminton scope vytáhne jen to, co se synchronizuje (activeId zůstává lokální).
const extractPayload = (): BadmintonDoc => {
  const scope = useSetStore.getState().scopes.badminton;
  return { sets: scope?.sets ?? [], sharedItems: scope?.sharedItems ?? [] };
};

// Stabilní otisk obsahu pro porovnání lokálního a vzdáleného stavu (echo ochrana).
const hashOf = (payload: BadmintonDoc) => JSON.stringify(payload);

const DEBOUNCE_MS = 500;

// Realtime synchronizace badmintonu s Firestore. Mountuje se jednou (v App).
// Bez přihlášeného uživatele nebo bez konfigurace Firebase je to no-op – appka jede lokálně.
const useBadmintonSync = () => {
  const uid = useAuth(state => state.user?.uid);

  useEffect(() => {
    if (!isFirebaseConfigured || !uid) return;

    const ref = badmintonDocRef();
    // Otisk stavu, který je momentálně shodný se serverem – brání zpětnému zápisu
    // toho, co jsme právě přijali (echo smyčka).
    let syncedHash = hashOf(extractPayload());
    let writeTimer: ReturnType<typeof setTimeout> | null = null;

    const writeToCloud = (payload: BadmintonDoc) => {
      void setDoc(
        ref,
        { ...payload, updatedAt: serverTimestamp(), updatedBy: uid },
        { merge: true }
      );
    };

    // Vzdálené změny → aplikace do lokálního store.
    const unsubscribeRemote = onSnapshot(ref, snapshot => {
      if (!snapshot.exists()) {
        // dokument ještě neexistuje – první přihlášený ho založí z lokálních dat
        const local = extractPayload();
        syncedHash = hashOf(local);
        writeToCloud(local);
        return;
      }

      const data = snapshot.data() as Partial<BadmintonDoc>;
      const remote: BadmintonDoc = {
        sets: data.sets ?? [],
        sharedItems: data.sharedItems ?? [],
      };
      const remoteHash = hashOf(remote);
      syncedHash = remoteHash;

      // aplikujeme jen skutečnou změnu (vlastní zápis přijde zpět se stejným otiskem)
      if (remoteHash !== hashOf(extractPayload())) {
        useSetStore.getState().replaceBadmintonData(remote.sets, remote.sharedItems);
      }
    });

    // Lokální změny → debounced zápis do cloudu.
    const unsubscribeLocal = useSetStore.subscribe(() => {
      const payload = extractPayload();
      const hash = hashOf(payload);
      if (hash === syncedHash) return; // beze změny nebo jen echo z cloudu

      if (writeTimer) clearTimeout(writeTimer);
      writeTimer = setTimeout(() => {
        syncedHash = hash;
        writeToCloud(payload);
      }, DEBOUNCE_MS);
    });

    return () => {
      if (writeTimer) clearTimeout(writeTimer);
      unsubscribeRemote();
      unsubscribeLocal();
    };
  }, [uid]);
};

export default useBadmintonSync;
