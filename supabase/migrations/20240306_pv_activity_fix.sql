-- Migration pour corriger la fonction log_pv_activity
-- Date: 2024-03-06

-- Suppression du trigger existant pour éviter les conflits
DROP TRIGGER IF EXISTS on_pv_document_change ON public.pv_documents;

-- Mise à jour de la fonction pour gérer le cas où auth.uid() est NULL
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

-- Recréation du trigger
CREATE TRIGGER on_pv_document_change
  AFTER INSERT OR UPDATE OR DELETE ON public.pv_documents
  FOR EACH ROW EXECUTE PROCEDURE public.log_pv_activity(); 