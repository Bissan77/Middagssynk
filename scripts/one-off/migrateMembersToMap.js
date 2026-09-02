/**
 * One-off: konverterar households.members fran array till map.
 *
 *   ["uid1", "uid2"]  ->  { uid1: "owner", uid2: "member" }
 *
 * ownerId-uid far rollen "owner"; ovriga medlemmar far "member".
 * Dokument dar members redan ar en map (icke-array) hoppas over.
 *
 * AUTENTISERING:
 *   Kraver GOOGLE_APPLICATION_CREDENTIALS pekande pa en giltig service account
 *   (eller annan Application Default Credentials-kalla som firebase-admin accepterar).
 *   INGEN ADC-hack via firebase-tools.json — medvetet utelamnat av sakerhetsskal.
 *
 * Korning (efter uttryckligt godkannande):
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json node scripts/one-off/migrateMembersToMap.js
 *
 * Beroende: firebase-admin (installera lokalt eller kor via npx om paketet finns).
 */

import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error(
        'Avbryter: GOOGLE_APPLICATION_CREDENTIALS ar inte satt.\n' +
        'Satt miljövariabeln till en service account-nyckel innan korning.\n' +
        'Detta script anvander INTE firebase-tools.json eller andra auth-genvagar.',
    );
    process.exit(1);
}

initializeApp();
const db = getFirestore();

function membersArrayToMap(members, ownerId) {
    const map = {};
    for (const uid of members) {
        if (typeof uid !== 'string' || uid.length === 0) {
            throw new Error(`Ogiltigt uid i members-array: ${JSON.stringify(uid)}`);
        }
        map[uid] = uid === ownerId ? 'owner' : 'member';
    }
    return map;
}

async function migrateMembersToMap() {
    console.log('Startar migrering members array -> map...\n');

    const snapshot = await db.collection('households').get();

    if (snapshot.empty) {
        console.log('Inga households hittades.');
        return;
    }

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const label = `household ${docSnap.id}`;

        console.log(`--- ${label} ---`);
        console.log('Innan:', JSON.stringify({ members: data.members, ownerId: data.ownerId }, null, 2));

        if (data.members === undefined || data.members === null) {
            console.log('-> Hoppas over: members saknas.\n');
            skippedCount++;
            continue;
        }

        if (!Array.isArray(data.members)) {
            console.log('-> Hoppas over: members ar redan en map (icke-array).\n');
            skippedCount++;
            continue;
        }

        if (data.members.length === 0) {
            console.log('-> Hoppas over: tom members-array — kräver manuell granskning.\n');
            skippedCount++;
            continue;
        }

        const ownerId = data.ownerId;
        if (typeof ownerId !== 'string' || ownerId.length === 0) {
            console.error(`-> FEL: ownerId saknas eller ar ogiltigt for ${label}. Hoppas over.\n`);
            errorCount++;
            continue;
        }

        if (!data.members.includes(ownerId)) {
            console.error(
                `-> Hoppas over: ownerId (${ownerId}) finns inte i members-arrayen.` +
                ' Kräver manuell granskning innan migrering.',
            );
            console.log('');
            errorCount++;
            continue;
        }

        try {
            const membersMap = membersArrayToMap(data.members, ownerId);
            await docSnap.ref.update({ members: membersMap });

            const afterSnap = await docSnap.ref.get();
            console.log('Efter:', JSON.stringify({ members: afterSnap.data()?.members, ownerId: afterSnap.data()?.ownerId }, null, 2));
            console.log('-> Uppdaterad.\n');
            updatedCount++;
        } catch (err) {
            console.error(`-> FEL vid uppdatering av ${label}:`, err.message, '\n');
            errorCount++;
        }
    }

    console.log('Migrering klar.');
    console.log(`  Uppdaterade: ${updatedCount}`);
    console.log(`  Overhoppade: ${skippedCount}`);
    console.log(`  Fel:         ${errorCount}`);

    if (errorCount > 0) {
        process.exitCode = 1;
    }
}

migrateMembersToMap().catch((err) => {
    console.error('Ohanterat fel:', err);
    process.exit(1);
});
