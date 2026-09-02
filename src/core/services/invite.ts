import {
    Timestamp,
    doc,
    getDoc,
    writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';

const INVITE_CODE_LENGTH = 6;
const INVITE_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const INVITE_CODE_LIFETIME_MS = 24 * 60 * 60 * 1000;

function createInviteCode(): string {
    const randomValues = new Uint32Array(INVITE_CODE_LENGTH);
    crypto.getRandomValues(randomValues);

    return Array.from(
        randomValues,
        (value) => INVITE_CODE_ALPHABET[value % INVITE_CODE_ALPHABET.length],
    ).join('');
}

export type GeneratedInviteCode = {
    code: string;
    expiresAt: Date;
};

export async function generateInviteCode(
    householdId: string,
    uid: string,
): Promise<GeneratedInviteCode> {
    const householdRef = doc(db, 'households', householdId);
    const householdSnap = await getDoc(householdRef);

    if (!householdSnap.exists() || householdSnap.data().ownerId !== uid) {
        throw new Error('Only the household owner can generate invite codes.');
    }

    const code = createInviteCode();
    const expiresAt = Timestamp.fromMillis(Date.now() + INVITE_CODE_LIFETIME_MS);
    const inviteCodeRef = doc(db, 'inviteCodes', code);
    const batch = writeBatch(db);

    batch.update(householdRef, {
        inviteCode: code,
        inviteExpiresAt: expiresAt,
    });
    batch.set(inviteCodeRef, { householdId });

    await batch.commit();

    return {
        code,
        expiresAt: expiresAt.toDate(),
    };
}
