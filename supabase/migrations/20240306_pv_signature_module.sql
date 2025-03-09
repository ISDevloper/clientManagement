-- Migration pour le module de Signature des PV
-- Date: 2024-03-06

-- Table pour stocker les procès-verbaux
CREATE TABLE IF NOT EXISTS public.pv_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  project_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'signed', 'validated', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  assigned_to UUID REFERENCES auth.users(id) NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE
);

-- Table pour stocker les fichiers associés aux PV
CREATE TABLE IF NOT EXISTS public.pv_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pv_id UUID REFERENCES public.pv_documents(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  is_signed BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  storage_path TEXT NOT NULL
);

-- Table pour stocker l'historique des transferts de PV
CREATE TABLE IF NOT EXISTS public.pv_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pv_id UUID REFERENCES public.pv_documents(id) ON DELETE CASCADE NOT NULL,
  from_user UUID REFERENCES auth.users(id) NOT NULL,
  to_user UUID REFERENCES auth.users(id) NOT NULL,
  transfer_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reason TEXT,
  recipient_name TEXT,
  recipient_email TEXT,
  recipient_phone TEXT,
  recipient_company TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  accepted_at TIMESTAMP WITH TIME ZONE
);

-- Table pour stocker l'historique des relances
CREATE TABLE IF NOT EXISTS public.pv_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pv_id UUID REFERENCES public.pv_documents(id) ON DELETE CASCADE NOT NULL,
  sent_by UUID REFERENCES auth.users(id) NOT NULL,
  sent_to UUID REFERENCES auth.users(id) NOT NULL,
  sent_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  message TEXT,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('email', 'phone', 'other')),
  response TEXT,
  response_date TIMESTAMP WITH TIME ZONE
);

-- Table pour stocker les commentaires sur les PV
CREATE TABLE IF NOT EXISTS public.pv_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pv_id UUID REFERENCES public.pv_documents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_internal BOOLEAN DEFAULT FALSE
);

-- Table pour stocker les activités liées aux PV
CREATE TABLE IF NOT EXISTS public.pv_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pv_id UUID REFERENCES public.pv_documents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB
);

-- Politiques RLS pour la table pv_documents
ALTER TABLE public.pv_documents ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir les PV qui leur sont assignés ou qu'ils ont créés
CREATE POLICY "Les utilisateurs peuvent voir leurs PV" 
  ON public.pv_documents 
  FOR SELECT 
  USING (
    auth.uid() = assigned_to OR 
    auth.uid() = created_by OR
    auth.jwt() ->> 'role' = 'admin'
  );

-- Les utilisateurs peuvent modifier les PV qui leur sont assignés ou qu'ils ont créés
CREATE POLICY "Les utilisateurs peuvent modifier leurs PV" 
  ON public.pv_documents 
  FOR UPDATE 
  USING (
    auth.uid() = assigned_to OR 
    auth.uid() = created_by OR
    auth.jwt() ->> 'role' = 'admin'
  );

-- Les utilisateurs peuvent créer des PV
CREATE POLICY "Les utilisateurs peuvent créer des PV" 
  ON public.pv_documents 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Les administrateurs peuvent supprimer des PV
CREATE POLICY "Les administrateurs peuvent supprimer des PV" 
  ON public.pv_documents 
  FOR DELETE 
  USING (auth.jwt() ->> 'role' = 'admin');

-- Politiques RLS pour la table pv_files
ALTER TABLE public.pv_files ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir les fichiers des PV qui leur sont assignés ou qu'ils ont créés
CREATE POLICY "Les utilisateurs peuvent voir les fichiers de leurs PV" 
  ON public.pv_files 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.pv_documents 
      WHERE pv_documents.id = pv_files.pv_id 
      AND (
        pv_documents.assigned_to = auth.uid() OR 
        pv_documents.created_by = auth.uid() OR
        auth.jwt() ->> 'role' = 'admin'
      )
    )
  );

-- Les utilisateurs peuvent ajouter des fichiers aux PV qui leur sont assignés ou qu'ils ont créés
CREATE POLICY "Les utilisateurs peuvent ajouter des fichiers à leurs PV" 
  ON public.pv_files 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pv_documents 
      WHERE pv_documents.id = pv_files.pv_id 
      AND (
        pv_documents.assigned_to = auth.uid() OR 
        pv_documents.created_by = auth.uid() OR
        auth.jwt() ->> 'role' = 'admin'
      )
    )
  );

-- Les utilisateurs peuvent modifier les fichiers des PV qui leur sont assignés ou qu'ils ont créés
CREATE POLICY "Les utilisateurs peuvent modifier les fichiers de leurs PV" 
  ON public.pv_files 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.pv_documents 
      WHERE pv_documents.id = pv_files.pv_id 
      AND (
        pv_documents.assigned_to = auth.uid() OR 
        pv_documents.created_by = auth.uid() OR
        auth.jwt() ->> 'role' = 'admin'
      )
    )
  );

-- Les administrateurs peuvent supprimer des fichiers
CREATE POLICY "Les administrateurs peuvent supprimer des fichiers" 
  ON public.pv_files 
  FOR DELETE 
  USING (auth.jwt() ->> 'role' = 'admin');

-- Politiques RLS pour les autres tables
ALTER TABLE public.pv_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pv_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pv_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pv_activities ENABLE ROW LEVEL SECURITY;

-- Fonction pour enregistrer les activités liées aux PV
CREATE OR REPLACE FUNCTION public.log_pv_activity()
RETURNS TRIGGER AS $$
DECLARE
  activity_description TEXT;
  activity_type TEXT;
  user_identifier UUID;
BEGIN
  -- Déterminer le type d'activité et la description en fonction de l'opération
  IF TG_OP = 'INSERT' THEN
    activity_type := 'create';
    activity_description := 'PV créé';
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status <> NEW.status THEN
      activity_type := 'status_change';
      activity_description := 'Statut du PV modifié de ' || OLD.status || ' à ' || NEW.status;
    ELSIF OLD.assigned_to <> NEW.assigned_to THEN
      activity_type := 'assignment_change';
      activity_description := 'PV réassigné';
    ELSE
      activity_type := 'update';
      activity_description := 'PV mis à jour';
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    activity_type := 'delete';
    activity_description := 'PV supprimé';
  END IF;

  -- Déterminer l'utilisateur à utiliser (auth.uid() ou created_by)
  user_identifier := auth.uid();
  IF user_identifier IS NULL THEN
    -- Si auth.uid() est NULL, utiliser created_by du PV
    IF TG_OP = 'DELETE' THEN
      user_identifier := OLD.created_by;
    ELSE
      user_identifier := NEW.created_by;
    END IF;
  END IF;

  -- Insérer l'activité dans la table des activités
  INSERT INTO public.pv_activities (
    pv_id,
    user_id,
    activity_type,
    description,
    metadata
  ) VALUES (
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    user_identifier,
    activity_type,
    activity_description,
    CASE 
      WHEN TG_OP = 'INSERT' THEN jsonb_build_object('new', row_to_json(NEW))
      WHEN TG_OP = 'UPDATE' THEN jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
      WHEN TG_OP = 'DELETE' THEN jsonb_build_object('old', row_to_json(OLD))
    END
  );

  -- Retourner la ligne appropriée en fonction de l'opération
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers pour enregistrer les activités
CREATE TRIGGER on_pv_document_change
  AFTER INSERT OR UPDATE OR DELETE ON public.pv_documents
  FOR EACH ROW EXECUTE PROCEDURE public.log_pv_activity();

-- Fonction pour mettre à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mettre à jour le timestamp updated_at
CREATE TRIGGER update_pv_documents_updated_at
  BEFORE UPDATE ON public.pv_documents
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_pv_comments_updated_at
  BEFORE UPDATE ON public.pv_comments
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_pv_documents_assigned_to ON public.pv_documents(assigned_to);
CREATE INDEX IF NOT EXISTS idx_pv_documents_created_by ON public.pv_documents(created_by);
CREATE INDEX IF NOT EXISTS idx_pv_documents_status ON public.pv_documents(status);
CREATE INDEX IF NOT EXISTS idx_pv_files_pv_id ON public.pv_files(pv_id);
CREATE INDEX IF NOT EXISTS idx_pv_transfers_pv_id ON public.pv_transfers(pv_id);
CREATE INDEX IF NOT EXISTS idx_pv_reminders_pv_id ON public.pv_reminders(pv_id);
CREATE INDEX IF NOT EXISTS idx_pv_comments_pv_id ON public.pv_comments(pv_id);
CREATE INDEX IF NOT EXISTS idx_pv_activities_pv_id ON public.pv_activities(pv_id); 