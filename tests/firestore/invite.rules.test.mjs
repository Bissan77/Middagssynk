import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';
import { readFile } from 'node:fs/promises';
import {
    assertFails,
    assertSucceeds,
    initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
    FieldPath,
    Timestamp,
    doc,
    getDoc,
    setDoc,
    writeBatch,
} from 'firebase/firestore';

const PROJECT_ID = 'middagssynk-rules-test';
const HOUSEHOLD_ID = 'household-1';
const OWNER_UID = 'owner-1';
const JOINER_A_UID = 'joiner-a';
const JOINER_B_UID = 'joiner-b';
const INVITE_A = 'ABC234';
const INVITE_B = 'DEF567';

let testEnv;

function householdData(inviteCode, inviteExpiresAt) {
    return {
        name: '',
        ownerId: OWNER_UID,
        members: { [OWNER_UID]: 'owner' },
        inviteCode,
        inviteExpiresAt,
        createdAt: Timestamp.now(),
    };
}

async function seedHousehold({ activeCode, inviteExpiresAt, staleCode }) {
    await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();

        await setDoc(
            doc(db, 'households', HOUSEHOLD_ID),
            householdData(activeCode, inviteExpiresAt),
        );
        await setDoc(doc(db, 'inviteCodes', activeCode), {
            householdId: HOUSEHOLD_ID,
        });

        if (staleCode) {
            await setDoc(doc(db, 'inviteCodes', staleCode), {
                householdId: HOUSEHOLD_ID,
            });
        }
    });
}

function commitJoinBatch(db, uid, code) {
    const householdRef = doc(db, 'households', HOUSEHOLD_ID);
    const inviteCodeRef = doc(db, 'inviteCodes', code);
    const userRef = doc(db, 'users', uid);
    const batch = writeBatch(db);

    batch.update(
        householdRef,
        new FieldPath('members', uid),
        'member',
        'inviteCode',
        null,
        'inviteExpiresAt',
        null,
    );
    batch.delete(inviteCodeRef);
    batch.set(userRef, { householdId: HOUSEHOLD_ID }, { merge: true });

    return batch.commit();
}

async function readFixture(path) {
    let snapshot;

    await testEnv.withSecurityRulesDisabled(async (context) => {
        snapshot = await getDoc(doc(context.firestore(), ...path));
    });

    return snapshot;
}

before(async () => {
    const rules = await readFile('firestore.rules', 'utf8');

    testEnv = await initializeTestEnvironment({
        projectId: PROJECT_ID,
        firestore: {
            host: '127.0.0.1',
            port: 8080,
            rules,
        },
    });
});

after(async () => {
    await testEnv.cleanup();
});

beforeEach(async () => {
    await testEnv.clearFirestore();
});

test('en writeBatch-join godkänns och getAfter ser batchens eftertillstånd', async () => {
    await seedHousehold({
        activeCode: INVITE_A,
        inviteExpiresAt: Timestamp.fromMillis(Date.now() + 60_000),
    });

    const joinerDb = testEnv.authenticatedContext(JOINER_A_UID).firestore();

    await assertSucceeds(commitJoinBatch(joinerDb, JOINER_A_UID, INVITE_A));

    const householdSnap = await getDoc(doc(joinerDb, 'households', HOUSEHOLD_ID));
    const userSnap = await getDoc(doc(joinerDb, 'users', JOINER_A_UID));
    const inviteSnap = await getDoc(doc(joinerDb, 'inviteCodes', INVITE_A));

    assert.equal(householdSnap.data().members[JOINER_A_UID], 'member');
    assert.equal(householdSnap.data().inviteCode, null);
    assert.equal(householdSnap.data().inviteExpiresAt, null);
    assert.equal(userSnap.data().householdId, HOUSEHOLD_ID);
    assert.equal(inviteSnap.exists(), false);
});

test('två samtidiga writeBatch-joins med samma kod ger exakt en vinnare', async () => {
    await seedHousehold({
        activeCode: INVITE_A,
        inviteExpiresAt: Timestamp.fromMillis(Date.now() + 60_000),
    });

    const joinerADb = testEnv.authenticatedContext(JOINER_A_UID).firestore();
    const joinerBDb = testEnv.authenticatedContext(JOINER_B_UID).firestore();

    const results = await Promise.allSettled([
        commitJoinBatch(joinerADb, JOINER_A_UID, INVITE_A),
        commitJoinBatch(joinerBDb, JOINER_B_UID, INVITE_A),
    ]);

    assert.equal(
        results.filter((result) => result.status === 'fulfilled').length,
        1,
    );
    assert.equal(
        results.filter((result) => result.status === 'rejected').length,
        1,
    );

    const householdSnap = await readFixture(['households', HOUSEHOLD_ID]);
    const members = householdSnap.data().members;

    assert.equal(
        Number(Boolean(members[JOINER_A_UID])) + Number(Boolean(members[JOINER_B_UID])),
        1,
    );
});

test('gammal kod A nekas när en ny aktiv kod B finns för samma hushåll', async () => {
    await seedHousehold({
        activeCode: INVITE_B,
        inviteExpiresAt: Timestamp.fromMillis(Date.now() + 60_000),
        staleCode: INVITE_A,
    });

    const joinerDb = testEnv.authenticatedContext(JOINER_A_UID).firestore();

    await assertFails(commitJoinBatch(joinerDb, JOINER_A_UID, INVITE_A));

    const householdSnap = await readFixture(['households', HOUSEHOLD_ID]);
    const activeInviteSnap = await readFixture(['inviteCodes', INVITE_B]);

    assert.equal(householdSnap.data().inviteCode, INVITE_B);
    assert.equal(householdSnap.data().members[JOINER_A_UID], undefined);
    assert.equal(activeInviteSnap.exists(), true);
});

test('den nya aktiva koden B kan fortfarande konsumeras efter att A nekats', async () => {
    await seedHousehold({
        activeCode: INVITE_B,
        inviteExpiresAt: Timestamp.fromMillis(Date.now() + 60_000),
        staleCode: INVITE_A,
    });

    const joinerDb = testEnv.authenticatedContext(JOINER_A_UID).firestore();

    await assertSucceeds(commitJoinBatch(joinerDb, JOINER_A_UID, INVITE_B));

    const householdSnap = await getDoc(doc(joinerDb, 'households', HOUSEHOLD_ID));
    const inviteSnap = await getDoc(doc(joinerDb, 'inviteCodes', INVITE_B));

    assert.equal(householdSnap.data().members[JOINER_A_UID], 'member');
    assert.equal(inviteSnap.exists(), false);
});

test('en utgången kod nekas och lämnas orörd', async () => {
    await seedHousehold({
        activeCode: INVITE_A,
        inviteExpiresAt: Timestamp.fromMillis(Date.now() - 60_000),
    });

    const joinerDb = testEnv.authenticatedContext(JOINER_A_UID).firestore();

    await assertFails(commitJoinBatch(joinerDb, JOINER_A_UID, INVITE_A));

    const householdSnap = await readFixture(['households', HOUSEHOLD_ID]);
    const inviteSnap = await readFixture(['inviteCodes', INVITE_A]);

    assert.equal(householdSnap.data().inviteCode, INVITE_A);
    assert.equal(householdSnap.data().members[JOINER_A_UID], undefined);
    assert.equal(inviteSnap.exists(), true);
});
