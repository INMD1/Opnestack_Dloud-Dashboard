import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';

function getDerivedKey(): Buffer {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
        throw new Error('NEXTAUTH_SECRET이 설정되지 않았습니다.');
    }
    // NEXTAUTH_SECRET으로부터 AES-256 키(32바이트) 파생
    return createHash('sha256').update(secret).digest();
}

/**
 * AES-256-GCM으로 평문 암호화
 * 반환 형식: iv_hex:authTag_hex:encrypted_hex
 */
export function encryptText(plaintext: string): string {
    const key = getDerivedKey();
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':');
}

/**
 * AES-256-GCM으로 암호문 복호화
 * 입력 형식: iv_hex:authTag_hex:encrypted_hex
 */
export function decryptText(encryptedData: string): string {
    const key = getDerivedKey();
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
        throw new Error('암호화 데이터 형식이 올바르지 않습니다.');
    }
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}

/**
 * 인증 토큰은 원문을 DB에 저장하지 않는다. DB가 노출되더라도 이메일의
 * 원본 토큰 없이는 인증을 완료할 수 있도록 단방향 해시만 보관한다.
 */
export function hashVerificationToken(token: string): string {
    return createHash('sha256').update(token, 'utf8').digest('hex');
}
