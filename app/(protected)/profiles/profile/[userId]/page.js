"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ProfileTab from "@/components/user/ProfileTab";


function UserProfile() {
    const { userId } = useParams()

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
                    full_name: data.full_name,
                    email: data.email,
                    phone: data.phone,
                    company: data.company,
                    departement: data.departement,
                    poste: data.poste,
                    created_at: data.created_at,
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
            const response = await fetch(`/api/profiles/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedUserData)
            });

            if (!response.ok) {
                throw new Error('Failed to update user profile');
            }

            const updatedProfile = await response.json();
            setUser(updatedProfile.profile)
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

    return <ProfileTab user={user} onUpdateUser={handleUpdateUser} />
}

export default UserProfile;