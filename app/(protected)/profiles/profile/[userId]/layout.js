"use client"
import React from 'react';
import UserHeader from "@/components/user/UserHeader";
import UserTabs from "@/components/user/UserTabs";
import { usePathname } from "next/navigation";

export default function ProfileLayout({ children, params }) {
    const unwrappedParams = React.use(params);
    const { userId } = unwrappedParams;
    const pathname = usePathname();
    const getActiveTab = () => {
        const path = pathname
        if (path.includes('/documents')) return 'documents'
        if (path.includes('/payements')) return 'payments'
        if (path.includes('/projects')) return 'projects'
        if (path.includes('/quotations')) return 'quotes'
        return 'profile' // Par défaut
    }

    const activeTab = getActiveTab()
    return (
        <div className="flex flex-col gap-y-6">
            <UserHeader userId={userId} />
            <UserTabs userId={userId} activeTab={activeTab} />
            {children}
        </div>
    )
}