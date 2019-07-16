export function isValidKey(key: any): boolean {
    return Number.isSafeInteger(key) && key > 0 && key < 10000000;
}

export function assertValidKey(key: any): void {
    if (!isValidKey(key)) throw 'Invalid key!';
}

export function isValidStudentNumber(studentNumber: any): boolean {
    return Number.isSafeInteger(studentNumber) && studentNumber >= 10101 && studentNumber < 40000;
}

export function assertValidStudentNumber(studentNumber: any): void {
    if (!isValidStudentNumber(studentNumber)) throw 'Invalid student number!';
}

export function isValidAdminPassword(plaintextPassword: any): boolean {
    return typeof plaintextPassword === 'string' && plaintextPassword.length <= 20;
}

export function assertValidAdminPassword(plaintextPassword: any): void {
    if (!isValidAdminPassword(plaintextPassword)) throw 'Invalid admin password!';
}

export function isValidPollName(name: any): boolean {
    return typeof name === 'string' && /^[ㄱ-ㅎ가-힣a-zA-Z0-9:()\-\[\] ]{1,40}$/.test(name);
}

export function isValidPollNameExtended(name: any): boolean {
    return typeof name === 'string' && /^[ㄱ-ㅎ가-힣a-zA-Z0-9:()\-\[\] ]{1,120}$/.test(name);
}
