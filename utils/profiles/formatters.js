export function normalizeProfileData(data) {

    if (Array.isArray(data)) {
        return data.map(profile => normalizeProfileItem(profile));
    }
    return normalizeProfileItem(data);
}

function normalizeProfileItem(profile) {
    const role = profile.role || "Client";
    const status = profile.status || "active";
    const lastLogin = profile.last_login || profile.updated_at;
    return {
        id: profile.id,
        name: profile.full_name,
        role: role,
        company: profile.company,
        lastLogin: lastLogin,
        status: status,
        phone: profile.phone,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        department: profile.department,
        position: profile.poste,
        address: profile.address,
        email: profile.email
    };
}


export function prepareProfileForAPI(profileData) {
    return {
        id: profileData.id,
        full_name: profileData.name,
        phone: profileData.phone,
        company: profileData.company,
        departement: profileData.department,
        poste: profileData.position,
        address: profileData.address,
    };
} 