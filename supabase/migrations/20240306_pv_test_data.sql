-- Données de test pour le module de Signature des PV
-- Date: 2024-03-06

-- Utilisateurs de test
-- user 1 : coco.berrada@rma.com  - UID : 58fad3cf-b65a-4f10-a4f2-42a69fc822fa
-- user 2 : mehdi.najeddine@void.fr - UID : 2248f73e-f434-434b-897f-d83b7dc61627

-- Insertion de PV de test
INSERT INTO public.pv_documents (
  id, 
  title, 
  description, 
  project_name, 
  status, 
  created_by, 
  assigned_to, 
  due_date,
  completed_date
) VALUES 
-- PV 1 : Créé par coco, assigné à mehdi
(
  'f8c3de3d-1d35-4b77-9705-8d1d60d1c92c',
  'PV de réception - Projet Alpha',
  'Procès-verbal de réception des travaux du projet Alpha',
  'Projet Alpha',
  'draft',
  '58fad3cf-b65a-4f10-a4f2-42a69fc822fa', -- coco
  '2248f73e-f434-434b-897f-d83b7dc61627', -- mehdi
  (now() + interval '10 days'),
  NULL
),
-- PV 2 : Créé par coco, assigné à coco
(
  '7d9f5e8a-6c2b-4b3a-9d1e-0f5a6b7c8d9e',
  'PV de réception - Projet Beta',
  'Procès-verbal de réception des travaux du projet Beta',
  'Projet Beta',
  'sent',
  '58fad3cf-b65a-4f10-a4f2-42a69fc822fa', -- coco
  '58fad3cf-b65a-4f10-a4f2-42a69fc822fa', -- coco
  (now() + interval '5 days'),
  NULL
),
-- PV 3 : Créé par mehdi, assigné à coco
(
  '3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d',
  'PV de réception - Projet Gamma',
  'Procès-verbal de réception des travaux du projet Gamma',
  'Projet Gamma',
  'signed',
  '2248f73e-f434-434b-897f-d83b7dc61627', -- mehdi
  '58fad3cf-b65a-4f10-a4f2-42a69fc822fa', -- coco
  (now() + interval '15 days'),
  NULL
),
-- PV 4 : Créé par mehdi, assigné à mehdi
(
  '9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d',
  'PV de réception - Projet Delta',
  'Procès-verbal de réception des travaux du projet Delta',
  'Projet Delta',
  'validated',
  '2248f73e-f434-434b-897f-d83b7dc61627', -- mehdi
  '2248f73e-f434-434b-897f-d83b7dc61627', -- mehdi
  (now() - interval '5 days'),
  (now() - interval '2 days')
),
-- PV 5 : Créé par coco, assigné à mehdi, rejeté
(
  'b1c2d3e4-f5a6-b7c8-d9e0-f1a2b3c4d5e6',
  'PV de réception - Projet Epsilon',
  'Procès-verbal de réception des travaux du projet Epsilon',
  'Projet Epsilon',
  'rejected',
  '58fad3cf-b65a-4f10-a4f2-42a69fc822fa', -- coco
  '2248f73e-f434-434b-897f-d83b7dc61627', -- mehdi
  (now() - interval '10 days'),
  NULL
);

-- Insertion de fichiers de test
INSERT INTO public.pv_files (
  id,
  pv_id,
  file_name,
  file_path,
  file_type,
  file_size,
  is_signed,
  uploaded_by,
  storage_path
) VALUES
-- Fichier 1 : PV Alpha - Non signé
(
  'a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6',
  'f8c3de3d-1d35-4b77-9705-8d1d60d1c92c', -- PV Alpha
  'PV_Alpha_draft.pdf',
  '/documents/pv/alpha/draft.pdf',
  'application/pdf',
  1024576, -- 1MB
  FALSE,
  '58fad3cf-b65a-4f10-a4f2-42a69fc822fa', -- coco
  'pv_documents/f8c3de3d-1d35-4b77-9705-8d1d60d1c92c/draft.pdf'
),
-- Fichier 2 : PV Beta - Non signé
(
  'b2c3d4e5-f6a7-b8c9-d0e1-f2a3b4c5d6e7',
  '7d9f5e8a-6c2b-4b3a-9d1e-0f5a6b7c8d9e', -- PV Beta
  'PV_Beta_draft.pdf',
  '/documents/pv/beta/draft.pdf',
  'application/pdf',
  2048576, -- 2MB
  FALSE,
  '58fad3cf-b65a-4f10-a4f2-42a69fc822fa', -- coco
  'pv_documents/7d9f5e8a-6c2b-4b3a-9d1e-0f5a6b7c8d9e/draft.pdf'
),
-- Fichier 3 : PV Gamma - Signé
(
  'c3d4e5f6-a7b8-c9d0-e1f2-a3b4c5d6e7f8',
  '3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d', -- PV Gamma
  'PV_Gamma_signed.pdf',
  '/documents/pv/gamma/signed.pdf',
  'application/pdf',
  3072576, -- 3MB
  TRUE,
  '58fad3cf-b65a-4f10-a4f2-42a69fc822fa', -- coco
  'pv_documents/3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d/signed.pdf'
),
-- Fichier 4 : PV Delta - Signé et validé
(
  'd4e5f6a7-b8c9-d0e1-f2a3-b4c5d6e7f8a9',
  '9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d', -- PV Delta
  'PV_Delta_validated.pdf',
  '/documents/pv/delta/validated.pdf',
  'application/pdf',
  4096576, -- 4MB
  TRUE,
  '2248f73e-f434-434b-897f-d83b7dc61627', -- mehdi
  'pv_documents/9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d/validated.pdf'
),
-- Fichier 5 : PV Epsilon - Rejeté
(
  'e5f6a7b8-c9d0-e1f2-a3b4-c5d6e7f8a9b0',
  'b1c2d3e4-f5a6-b7c8-d9e0-f1a2b3c4d5e6', -- PV Epsilon
  'PV_Epsilon_rejected.pdf',
  '/documents/pv/epsilon/rejected.pdf',
  'application/pdf',
  5120576, -- 5MB
  FALSE,
  '2248f73e-f434-434b-897f-d83b7dc61627', -- mehdi
  'pv_documents/b1c2d3e4-f5a6-b7c8-d9e0-f1a2b3c4d5e6/rejected.pdf'
);

-- Insertion de transferts de test
INSERT INTO public.pv_transfers (
  id,
  pv_id,
  from_user,
  to_user,
  reason,
  recipient_name,
  recipient_email,
  recipient_phone,
  recipient_company,
  status
) VALUES
-- Transfert 1 : PV Alpha de coco à mehdi
(
  'f6a7b8c9-d0e1-f2a3-b4c5-d6e7f8a9b0c1',
  'f8c3de3d-1d35-4b77-9705-8d1d60d1c92c', -- PV Alpha
  '58fad3cf-b65a-4f10-a4f2-42a69fc822fa', -- coco
  '2248f73e-f434-434b-897f-d83b7dc61627', -- mehdi
  'Transfert pour validation technique',
  'Mehdi Najeddine',
  'mehdi.najeddine@void.fr',
  '+33612345678',
  'VOID',
  'accepted'
),
-- Transfert 2 : PV Gamma de mehdi à coco
(
  'a7b8c9d0-e1f2-a3b4-c5d6-e7f8a9b0c1d2',
  '3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d', -- PV Gamma
  '2248f73e-f434-434b-897f-d83b7dc61627', -- mehdi
  '58fad3cf-b65a-4f10-a4f2-42a69fc822fa', -- coco
  'Transfert pour signature client',
  'Coco Berrada',
  'coco.berrada@rma.com',
  '+33698765432',
  'RMA',
  'accepted'
),
-- Transfert 3 : PV Epsilon de coco à mehdi (rejeté)
(
  'b8c9d0e1-f2a3-b4c5-d6e7-f8a9b0c1d2e3',
  'b1c2d3e4-f5a6-b7c8-d9e0-f1a2b3c4d5e6', -- PV Epsilon
  '58fad3cf-b65a-4f10-a4f2-42a69fc822fa', -- coco
  '2248f73e-f434-434b-897f-d83b7dc61627', -- mehdi
  'Transfert pour correction technique',
  'Mehdi Najeddine',
  'mehdi.najeddine@void.fr',
  '+33612345678',
  'VOID',
  'rejected'
);

-- Insertion de relances de test
INSERT INTO public.pv_reminders (
  id,
  pv_id,
  sent_by,
  sent_to,
  message,
  reminder_type,
  response,
  response_date
) VALUES
-- Relance 1 : PV Beta - Email
(
  'c9d0e1f2-a3b4-c5d6-e7f8-a9b0c1d2e3f4',
  '7d9f5e8a-6c2b-4b3a-9d1e-0f5a6b7c8d9e', -- PV Beta
  '58fad3cf-b65a-4f10-a4f2-42a69fc822fa', -- coco
  '58fad3cf-b65a-4f10-a4f2-42a69fc822fa', -- coco (auto-relance)
  'Merci de bien vouloir signer et retourner le PV du projet Beta',
  'email',
  'Je vais le faire dans la journée',
  (now() - interval '2 days')
),
-- Relance 2 : PV Gamma - Téléphone
(
  'd0e1f2a3-b4c5-d6e7-f8a9-b0c1d2e3f4a5',
  '3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d', -- PV Gamma
  '2248f73e-f434-434b-897f-d83b7dc61627', -- mehdi
  '58fad3cf-b65a-4f10-a4f2-42a69fc822fa', -- coco
  'Rappel concernant la signature du PV du projet Gamma',
  'phone',
  'Document signé et envoyé',
  (now() - interval '5 days')
),
-- Relance 3 : PV Epsilon - Email (sans réponse)
(
  'e1f2a3b4-c5d6-e7f8-a9b0-c1d2e3f4a5b6',
  'b1c2d3e4-f5a6-b7c8-d9e0-f1a2b3c4d5e6', -- PV Epsilon
  '58fad3cf-b65a-4f10-a4f2-42a69fc822fa', -- coco
  '2248f73e-f434-434b-897f-d83b7dc61627', -- mehdi
  'Urgent : Merci de valider le PV du projet Epsilon',
  'email',
  NULL,
  NULL
);

-- Insertion de commentaires de test
INSERT INTO public.pv_comments (
  id,
  pv_id,
  user_id,
  comment,
  is_internal
) VALUES
-- Commentaire 1 : PV Alpha - Interne
(
  'f2a3b4c5-d6e7-f8a9-b0c1-d2e3f4a5b6c7',
  'f8c3de3d-1d35-4b77-9705-8d1d60d1c92c', -- PV Alpha
  '58fad3cf-b65a-4f10-a4f2-42a69fc822fa', -- coco
  'Document à faire valider par le service technique avant envoi au client',
  TRUE
),
-- Commentaire 2 : PV Beta - Externe
(
  'a3b4c5d6-e7f8-a9b0-c1d2-e3f4a5b6c7d8',
  '7d9f5e8a-6c2b-4b3a-9d1e-0f5a6b7c8d9e', -- PV Beta
  '58fad3cf-b65a-4f10-a4f2-42a69fc822fa', -- coco
  'Merci de bien vouloir signer ce document et nous le retourner',
  FALSE
),
-- Commentaire 3 : PV Gamma - Interne
(
  'b4c5d6e7-f8a9-b0c1-d2e3-f4a5b6c7d8e9',
  '3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d', -- PV Gamma
  '2248f73e-f434-434b-897f-d83b7dc61627', -- mehdi
  'Attention, ce client est prioritaire. Merci de traiter rapidement.',
  TRUE
),
-- Commentaire 4 : PV Delta - Externe
(
  'c5d6e7f8-a9b0-c1d2-e3f4-a5b6c7d8e9f0',
  '9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d', -- PV Delta
  '2248f73e-f434-434b-897f-d83b7dc61627', -- mehdi
  'Document validé et archivé',
  FALSE
),
-- Commentaire 5 : PV Epsilon - Interne
(
  'd6e7f8a9-b0c1-d2e3-f4a5-b6c7d8e9f0a1',
  'b1c2d3e4-f5a6-b7c8-d9e0-f1a2b3c4d5e6', -- PV Epsilon
  '58fad3cf-b65a-4f10-a4f2-42a69fc822fa', -- coco
  'Document rejeté pour cause de non-conformité technique',
  TRUE
);

-- Les activités seront générées automatiquement par les triggers 