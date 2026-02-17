export type RoleValue =
    | ""
    | "siswa"
    | "pengajar"
    | "admin_sekolah"
    | "pengawas"
    | "dinas"

export const TARGET_ROLE_OPTIONS: Array<{ label: string; value: RoleValue }> = [
    { label: "Otomatis", value: "" },
    { label: "Siswa", value: "siswa" },
    { label: "Pengajar", value: "pengajar" },
    { label: "Admin Sekolah", value: "admin_sekolah" },
    { label: "Pengawas", value: "pengawas" },
    { label: "Dinas", value: "dinas" },
]

export const USER_ROLE_OPTIONS: Array<{ label: string; value: RoleValue }> = [
    { label: "Kosong", value: "" },
    { label: "Siswa", value: "siswa" },
    { label: "Pengajar", value: "pengajar" },
    { label: "Admin Sekolah", value: "admin_sekolah" },
    { label: "Pengawas", value: "pengawas" },
    { label: "Dinas", value: "dinas" },
]

export function roleValueToLabel(value?: string | null) {
    switch (value) {
        case "siswa":
            return "Siswa"
        case "pengajar":
            return "Pengajar"
        case "admin_sekolah":
            return "Admin Sekolah"
        case "pengawas":
            return "Pengawas"
        case "dinas":
            return "Dinas"
        default:
            return "Otomatis"
    }
}

export const ROLE_CHIPS: Array<{
    label: string
    value: Exclude<RoleValue, "">
}> = [
    { label: "Siswa", value: "siswa" },
    { label: "Pengajar", value: "pengajar" },
    { label: "Admin Sekolah", value: "admin_sekolah" },
    { label: "Pengawas", value: "pengawas" },
    { label: "Dinas", value: "dinas" },
]
