/**
 * One-off: nollstaller aktiva inbjudningskoder pa befintliga households.
 *
 * Hittar alla households dar inviteCode != null och satter:
 *   inviteCode: null
 *   inviteExpiresAt: null
 *
 * Kor EFTER migrateMembersToMap.js (members maste vara map innan nya regler deployas).
 *
 * AUTENTISERING:
 *   Kraver GOOGLE_APPLICATION_CREDENTIALS pekande pa en giltig service account.
 *   INGEN ADC-hack via firebase-tools.json — medvetet utelamnat av sakerhetsskal.
 *
 * Korning (efter uttryckligt godkannande):
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json node scripts/one-off/resetOldInviteCodes.js
 *
 * OBS: Ror inte inviteCodes-collectionen. Befintliga lookup-dokument (om nagra)
 *      paverkas inte — de var inte i bruk i gamla flodet.
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

async function resetOldInviteCodes() {
    console.log('Startar nollstallning av gamla inbjudningskoder...\n');

    const snapshot = await db.collection('households').get();

    if (snapshot.empty) {
        console.log('Inga households hittades.');
        return;
    }

    let resetCount = 0;
    let skippedCount = 0;

    for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const label = `household ${docSnap.id}`;

        if (data.inviteCode === null || data.inviteCode === undefined) {
            console.log(`--- ${label} ---`);
            console.log('-> Hoppas over: inviteCode ar redan null/saknas.\n');
            skippedCount++;
            continue;
        }

        console.log(`--- ${label} ---`);
        console.log('Innan:', JSON.stringify({
            inviteCode: data.inviteCode,
            inviteExpiresAt: data.inviteExpiresAt ?? null,
        }, null, 2));

        await docSnap.ref.update({
            inviteCode: null,
            inviteExpiresAt: null,
        });

        const afterSnap = await docSnap.ref.get();
        const after = afterSnap.data();
        console.log('Efter:', JSON.stringify({
            inviteCode: after?.inviteCode ?? null,
            inviteExpiresAt: after?.inviteExpiresAt ?? null,
        }, null, 2));
        console.log('-> Nollstalld.\n');
        resetCount++;
    }

    console.log('Nollstallning klar.');
    console.log(`  Nollstallda: ${resetCount}`);
    console.log(`  Overhoppade: ${skippedCount}`);
}

resetOldInviteCodes().catch((err) => {
    console.error('Ohanterat fel:', err);
    process.exit(1);
});
