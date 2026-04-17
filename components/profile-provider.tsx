"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { api } from "@/lib/api"

type Profile = {
    user: any;
    userSubscription: any;
    meta: {
      isActive: boolean;
      plan: string;
    };
    projects: any[];
    currentProject: any | null;
  };
  
type ProfileContextType = {
profile: Profile | null;
isLoading: boolean;
refresh: () => Promise<void>;
setProfile: (p: Profile | null) => void;
selectedProjectId: string | null;
setSelectedProjectId: (id: string | null) => void;
selectedProject: any | null;
};

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

    const getProfile = async () => {
        try {
            const response = await api.get("/profile/me");
            setProfile(response.data);
        } catch (error) {
            setError(error instanceof Error ? error.message : "An unknown error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getProfile();
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const saved = window.localStorage.getItem("selectedProjectId");
        if (saved) setSelectedProjectId(saved);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (selectedProjectId) window.localStorage.setItem("selectedProjectId", selectedProjectId);
        else window.localStorage.removeItem("selectedProjectId");
    }, [selectedProjectId]);

    useEffect(() => {
        if (!profile) return;
        const projects = profile.projects ?? [];
        if (!projects.length) return;

        const stillExists = selectedProjectId
            ? projects.some((p: any) => String(p.id) === String(selectedProjectId))
            : false;

        if (!stillExists) {
            const fallback = profile.currentProject?.id ?? projects[0]?.id ?? null;
            if (fallback) setSelectedProjectId(String(fallback));
        }
    }, [profile, selectedProjectId]);

    const selectedProject =
        profile?.projects?.find((p: any) => String(p.id) === String(selectedProjectId)) ??
        profile?.currentProject ??
        null;

    return (
        <ProfileContext.Provider
            value={{
                profile,
                isLoading,
                refresh: getProfile,
                setProfile,
                selectedProjectId,
                setSelectedProjectId,
                selectedProject,
            }}
        >
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfile() {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error("useProfile must be used within a ProfileProvider");
    }
    return context;
}