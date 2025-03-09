-- Création de la table profiles pour stocker les informations des utilisateurs
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  company TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Création d'une politique RLS (Row Level Security) pour la table profiles
-- Permet à tous les utilisateurs authentifiés de lire tous les profils
CREATE POLICY "Tous les utilisateurs peuvent voir tous les profils" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Permet aux utilisateurs de modifier uniquement leur propre profil
CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Permet aux administrateurs et gestionnaires de modifier tous les profils
CREATE POLICY "Les admins et gestionnaires peuvent modifier tous les profils" 
  ON public.profiles 
  FOR ALL 
  USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'role' = 'gestionnaire'
  );

-- Activer RLS sur la table profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Fonction pour créer automatiquement un profil lors de la création d'un utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour appeler la fonction lors de la création d'un utilisateur
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
