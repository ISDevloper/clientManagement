"use client";
import { useState, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import UserHeader from "@/components/user/UserHeader";
import UserTabs from "@/components/user/UserTabs";
import ProfileTab from "@/components/user/ProfileTab";
import { prepareProfileForAPI, normalizeProfileData } from "@/utils/profiles/formatters";


function UserProfile() {
    const pathname = usePathname();
    const { userId } = useParams()


    // Déterminer l'onglet actif en fonction de l'URL
    const getActiveTab = () => {
        if (pathname.includes("/documents")) return "documents";
        if (pathname.includes("/payments")) return "payments";
        if (pathname.includes("/projects")) return "projects";
        if (pathname.includes("/quotes")) return "quotes";
        return "profile"; // Par défaut
    };

    const activeTab = getActiveTab();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/profiles/${userId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch user profile');
                }

                const data = await response.json();
                setUser({
                    id: data.id,
                    name: data.full_name,
                    email: data.email,
                    phone: data.phone,
                    role: data.role || "Client",
                    company: data.company,
                    department: data.departement,
                    position: data.poste,
                    lastLogin: data.last_login,
                    status: data.status || "active",
                    createdAt: data.created_at,
                    address: data.address

                });
                setError(null);
            } catch (err) {
                console.error('Error fetching user profile:', err);
                setError('Failed to load user profile');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUserProfile();
        }
    }, [userId]);

    // Fonction pour mettre à jour les informations de l'utilisateur
    const handleUpdateUser = async (updatedUserData) => {
        try {
            const response = await fetch(`/api/profiles`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(prepareProfileForAPI(updatedUserData)),
            });

            if (!response.ok) {
                throw new Error('Failed to update user profile');
            }

            const updatedProfile = await response.json();
            setUser(normalizeProfileData(updatedProfile.profile));
        } catch (err) {
            console.error('Error updating user profile:', err);
            setError('Failed to update user profile');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>;
    }

    if (error) {
        return <div className="text-center text-red-600 p-4">{error}</div>;
    }

    if (!user) {
        return <div className="text-center text-gray-600 p-4">User not found</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header avec navigation */}
            <UserHeader user={user} />
            {/* Onglets de navigation */}
            <UserTabs userId={userId} activeTab={activeTab} />
            {/* Contenu du profil */}
            <div className="mt-6">
                <ProfileTab user={user} onUpdateUser={handleUpdateUser} />
            </div>
        </div>
    );
}

export default UserProfile;