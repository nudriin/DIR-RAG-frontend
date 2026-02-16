export function validatePassword(value: string) {
    const errors: string[] = []
    if (value.length < 8) {
        errors.push("Password minimal 8 karakter.")
    }
    if (!/[A-Z]/.test(value)) {
        errors.push("Password harus mengandung huruf besar.")
    }
    if (!/[a-z]/.test(value)) {
        errors.push("Password harus mengandung huruf kecil.")
    }
    if (!/[0-9]/.test(value)) {
        errors.push("Password harus mengandung angka.")
    }
    if (!/[^A-Za-z0-9]/.test(value)) {
        errors.push("Password harus mengandung simbol.")
    }
    return errors
}

export function isValidUsername(value: string) {
    return value.trim().length >= 3
}
