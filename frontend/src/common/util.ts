export function isValidKey(key: number): boolean {
    return Number.isSafeInteger(key) && key > 0 && key < 10000000;
}

export function assertValidKey(key: number): void {
    if (!isValidKey(key)) throw 'Invalid key!';
}

export function isValidAdminPassword(plaintextPassword: string): boolean {
    return typeof plaintextPassword === 'string' && plaintextPassword.length <= 20;
}

export function assertValidAdminPassword(plaintextPassword: string): void {
    if (!isValidAdminPassword(plaintextPassword)) throw 'Invalid admin password!';
}

export function isValidPollName(name: string): boolean {
    return typeof name === 'string' && /^[ㄱ-ㅎ가-힣a-zA-Z0-9:() ]{1,20}$/.test(name);
}

export function isValidPollNameExtended(name: string): boolean {
    return typeof name === 'string' && /^[ㄱ-ㅎ가-힣a-zA-Z0-9:() ]{1,40}$/.test(name);
}
