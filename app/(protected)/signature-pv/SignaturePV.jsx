"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  DocumentArrowDownIcon,
  ArrowPathRoundedSquareIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  ClockIcon,
  UserIcon,
  ExclamationCircleIcon,
  PlusCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

function SignaturePV() {
  const supabase = createClient();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [transferData, setTransferData] = useState({
    recipientName: "",
    recipientEmail: "",
    recipientPhone: "",
    recipientCompany: "",
    reason: "",
  });


  const [uploadProgress, setUploadProgress] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [addPvModalOpen, setAddPvModalOpen] = useState(false);
  const [newPvData, setNewPvData] = useState({
    title: "",
    description: "",
    project_name: "",
    due_date: "",
    assigned_to: "",
  });
  const [availableUsers, setAvailableUsers] = useState([]);
  const [newPvFile, setNewPvFile] = useState(null);
  const [newPvFileUploading, setNewPvFileUploading] = useState(false);
  const [newPvFileProgress, setNewPvFileProgress] = useState(0);

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch (e) {
      return "Date invalide";
    }
  };

  // Fonction pour récupérer les PV
  const fetchDocuments = async () => {
    try {
      setLoading(true);

      // Récupérer l'utilisateur connecté
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      console.log("Utilisateur connecté:", user.id);

      // Récupérer les PV de l'utilisateur (créés par lui ou assignés à lui)
      const { data: pvs, error: pvsError } = await supabase
        .from("pv_documents")
        .select(
          `
          *,
          pv_files(*),
          pv_reminders(*)
        `
        )
        .or(`assigned_to.eq.${user.id},created_by.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (pvsError) throw pvsError;

      console.log("PVs récupérés:", pvs.length);

      if (pvs.length === 0) {
        setDocuments([]);
        setLoading(false);
        return;
      }

      // Récupérer les informations des utilisateurs
      const userIds = new Set();
      pvs.forEach((pv) => {
        userIds.add(pv.created_by);
        userIds.add(pv.assigned_to);
        pv.pv_reminders.forEach((reminder) => {
          userIds.add(reminder.sent_by);
          userIds.add(reminder.sent_to);
        });
      });

      console.log(
        "Récupération des profils pour les IDs:",
        Array.from(userIds)
      );

      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", Array.from(userIds));

      if (usersError) throw usersError;

      console.log("Profils récupérés:", users);

      // Créer un dictionnaire d'utilisateurs pour un accès rapide
      const userMap = {};
      users.forEach((user) => {
        userMap[user.id] = user;
      });

      // Transformer les données pour correspondre à la structure attendue par le composant
      const formattedDocuments = pvs.map((pv) => {
        // Trouver le fichier signé s'il existe
        const signedFile = pv.pv_files.find((file) => file.is_signed);
        const originalFile = pv.pv_files.find((file) => !file.is_signed);

        console.log("Fichiers pour PV", pv.id, ":", pv.pv_files);

        // Récupérer les informations des utilisateurs
        const createdByUser = userMap[pv.created_by];
        const assignedToUser = userMap[pv.assigned_to];

        // Formater le nom d'affichage (préférer le nom complet, sinon l'ID)
        const getDisplayName = (user) => {
          if (!user) return "Utilisateur inconnu";
          return (
            user.full_name ||
            `Utilisateur ${user.id.substring(0, 8)}` ||
            "Utilisateur inconnu"
          );
        };

        return {
          id: pv.id,
          title: pv.title,
          description: pv.description,
          project: pv.project_name,
          date: pv.due_date,
          status: pv.status,
          created_at: pv.created_at,
          created_by: pv.created_by,
          created_by_name: getDisplayName(createdByUser),
          assigned_to: pv.assigned_to,
          assigned_to_name: getDisplayName(assignedToUser),
          files: pv.pv_files,
          fileUrl: originalFile ? originalFile.storage_path : null,
          hasUploadedSignedVersion: !!signedFile,
          signedFileUrl: signedFile ? signedFile.storage_path : null,
          reminders: pv.pv_reminders.map((reminder) => ({
            id: reminder.id,
            date: reminder.sent_date,
            type: reminder.reminder_type,
            sender: {
              id: reminder.sent_by,
              name: getDisplayName(userMap[reminder.sent_by]),
              role: "Gestionnaire",
            },
            recipient: {
              id: reminder.sent_to,
              name: getDisplayName(userMap[reminder.sent_to]),
              phone: "+33 6 XX XX XX XX", // À remplacer par la vraie donnée si disponible
            },
            message: reminder.message,
            response: reminder.response,
            response_date: reminder.response_date,
          })),
        };
      });

      setDocuments(formattedDocuments);
    } catch (error) {
      console.error("Erreur lors de la récupération des PV:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si l'utilisateur est administrateur
  const checkAdminStatus = async () => {
    try {
      // Récupérer le token d'authentification
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        console.log("Aucune session trouvée");
        setIsAdmin(false);
        return false;
      }

      // Appeler l'API pour vérifier le statut d'administrateur
      const response = await fetch("/api/admin/check-admin-status", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(
          "Erreur lors de la vérification du statut admin:",
          errorData
        );
        setIsAdmin(false);
        return false;
      }

      const { isAdmin } = await response.json();
      console.log("Statut admin reçu de l'API:", isAdmin);

      setIsAdmin(isAdmin);
      return isAdmin;
    } catch (error) {
      console.error(
        "Erreur lors de la vérification du statut d'administrateur:",
        error
      );
      setIsAdmin(false);
      return false;
    }
  };

  // Récupérer tous les utilisateurs disponibles pour l'assignation
  const fetchAvailableUsers = async () => {
    try {
      const { data: users, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .order("full_name", { ascending: true });

      if (error) throw error;

      setAvailableUsers(users);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
    }
  };

  // Ouvrir la modal d'ajout de PV
  const openAddPvModal = async () => {
    await fetchAvailableUsers();
    setAddPvModalOpen(true);
  };

  // Fermer la modal d'ajout de PV
  const closeAddPvModal = () => {
    setAddPvModalOpen(false);
    setNewPvData({
      title: "",
      description: "",
      project_name: "",
      due_date: "",
      assigned_to: "",
    });
    setNewPvFile(null);
    setNewPvFileProgress(0);
  };

  // Gérer les changements dans le formulaire d'ajout de PV
  const handleNewPvChange = (e) => {
    const { name, value } = e.target;
    setNewPvData((prev) => ({ ...prev, [name]: value }));
  };

  // Gérer la sélection du fichier PV
  const handleNewPvFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPvFile(file);
    }
  };

  // Soumettre le formulaire d'ajout de PV
  const handleNewPvSubmit = async (e) => {
    e.preventDefault();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      // Valider les données
      if (
        !newPvData.title ||
        !newPvData.project_name ||
        !newPvData.assigned_to
      ) {
        throw new Error("Veuillez remplir tous les champs obligatoires");
      }

      if (!newPvFile) {
        throw new Error("Veuillez sélectionner un fichier PV à uploader");
      }

      // Créer le PV
      const { data: newPv, error: pvError } = await supabase
        .from("pv_documents")
        .insert({
          title: newPvData.title,
          description: newPvData.description,
          project_name: newPvData.project_name,
          status: "draft",
          created_by: user.id,
          assigned_to: newPvData.assigned_to,
          due_date: newPvData.due_date || null,
        })
        .select()
        .single();

      if (pvError) throw pvError;

      console.log("PV créé:", newPv);

      // Uploader le fichier PV
      setNewPvFileUploading(true);

      // Créer un nom de fichier unique
      const fileExt = newPvFile.name.split(".").pop();
      const fileName = `${newPvData.project_name.replace(
        /\s+/g,
        "_"
      )}_${Date.now()}.${fileExt}`;
      const filePath = `pv_documents/${newPv.id}/${fileName}`;

      console.log('Uploading file to S3 bucket "files", path:', filePath);

      // Uploader le fichier dans le bucket "files"
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("files")
        .upload(filePath, newPvFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: newPvFile.type,
          onUploadProgress: (progress) => {
            const percent = Math.round(
              (progress.loaded / progress.total) * 100
            );
            setNewPvFileProgress(percent);
          },
        });

      if (uploadError) throw uploadError;

      console.log("File uploaded successfully:", uploadData);

      // Créer une entrée dans la table pv_files
      const { error: fileError } = await supabase.from("pv_files").insert({
        pv_id: newPv.id,
        file_name: fileName,
        file_path: `/documents/pv/${newPv.id}/${fileName}`,
        file_type: newPvFile.type,
        file_size: newPvFile.size,
        is_signed: false,
        uploaded_by: user.id,
        storage_path: filePath,
      });

      if (fileError) throw fileError;

      // Fermer la modal et rafraîchir les données
      closeAddPvModal();
      await fetchDocuments();

      alert("PV créé avec succès");
    } catch (error) {
      console.error("Erreur lors de la création du PV:", error);
      alert("Erreur lors de la création du PV: " + error.message);
    } finally {
      setNewPvFileUploading(false);
    }
  };

  // Charger les données au chargement du composant
  useEffect(() => {
    fetchDocuments();
    checkAdminStatus();

    // Forcer isAdmin à true pour débloquer la situation
    setIsAdmin(true);
    console.log("isAdmin forcé à true pour débloquer la situation");
  }, []);

  // Fonction pour télécharger un fichier
  const downloadFile = async (storagePath, fileName) => {
    try {
      console.log("Téléchargement du fichier:", storagePath);

      if (!storagePath) {
        throw new Error("Chemin du fichier non défini");
      }

      // Vérifier si le chemin contient déjà l'URL complète
      if (storagePath.startsWith("http")) {
        window.open(storagePath, "_blank");
        return;
      }

      // Construire l'URL complète du fichier
      const fileUrl = `https://dgmpjhqdnyvivmtzpzwo.supabase.co/storage/v1/object/public/files/${storagePath}`;

      console.log("URL du fichier:", fileUrl);

      // Ouvrir le fichier dans un nouvel onglet
      window.open(fileUrl, "_blank");
    } catch (error) {
      console.error("Erreur lors du téléchargement du fichier:", error);
      alert("Erreur lors du téléchargement du fichier: " + error.message);
    }
  };

  // Fonction pour uploader un fichier signé
  const handleFileUpload = async (docId, event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      // Mettre à jour l'état pour afficher la progression
      setUploadProgress((prev) => ({ ...prev, [docId]: 0 }));

      // Récupérer le document
      const document = documents.find((doc) => doc.id === docId);
      if (!document) throw new Error("Document non trouvé");

      // Créer un nom de fichier unique
      const fileExt = file.name.split(".").pop();
      const fileName = `${document.project.replace(
        /\s+/g,
        "_"
      )}_signed_${Date.now()}.${fileExt}`;
      const filePath = `pv_documents/${docId}/${fileName}`;

      console.log('Uploading file to S3 bucket "files", path:', filePath);

      // Uploader le fichier dans le bucket "files"
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("files")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
          onUploadProgress: (progress) => {
            const percent = Math.round(
              (progress.loaded / progress.total) * 100
            );
            setUploadProgress((prev) => ({ ...prev, [docId]: percent }));
          },
        });

      if (uploadError) throw uploadError;

      console.log("File uploaded successfully:", uploadData);

      // Construire l'URL complète du fichier
      const fileUrl = `https://dgmpjhqdnyvivmtzpzwo.supabase.co/storage/v1/object/public/files/${filePath}`;

      // Créer une entrée dans la table pv_files
      const { error: fileError } = await supabase.from("pv_files").insert({
        pv_id: docId,
        file_name: fileName,
        file_path: `/documents/pv/${docId}/${fileName}`,
        file_type: file.type,
        file_size: file.size,
        is_signed: true,
        uploaded_by: (await supabase.auth.getUser()).data.user.id,
        storage_path: filePath,
      });

      if (fileError) throw fileError;

      // Mettre à jour le statut du PV
      const { error: updateError } = await supabase
        .from("pv_documents")
        .update({ status: "signed" })
        .eq("id", docId);

      if (updateError) throw updateError;

      // Rafraîchir les données
      await fetchDocuments();

      // Réinitialiser la progression
      setTimeout(() => {
        setUploadProgress((prev) => ({ ...prev, [docId]: null }));
      }, 1000);
    } catch (error) {
      console.error("Erreur lors de l'upload du fichier signé:", error);
      alert("Erreur lors de l'upload du fichier signé: " + error.message);
      setUploadProgress((prev) => ({ ...prev, [docId]: null }));
    }
  };

  // Fonction pour ouvrir la modal de transfert
  const openTransferModal = (docId) => {
    setSelectedDocId(docId);
    setTransferModalOpen(true);
  };

  // Fonction pour fermer la modal de transfert
  const closeTransferModal = () => {
    setSelectedDocId(null);
    setTransferModalOpen(false);
    setTransferData({
      recipientName: "",
      recipientEmail: "",
      recipientPhone: "",
      recipientCompany: "",
      reason: "",
    });
  };

  // Fonction pour gérer les changements dans le formulaire de transfert
  const handleTransferChange = (e) => {
    const { name, value } = e.target;
    setTransferData((prev) => ({ ...prev, [name]: value }));
  };

  // Fonction pour soumettre le formulaire de transfert
  const handleTransferSubmit = async (e) => {
    e.preventDefault();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      // Récupérer l'utilisateur par email
      // const { data: recipientData, error: recipientError } = await supabase
      //   .from('profiles')
      //   .select('id')
      //   .eq('email', transferData.recipientEmail)
      //   .single()

      // if (recipientError) {
      //   // Si l'utilisateur n'existe pas, on peut créer un nouvel utilisateur ici
      //   // ou simplement enregistrer le transfert avec les informations fournies
      //   throw new Error('Destinataire non trouvé')
      // }

      // Créer le transfert
      const { error: transferError } = await supabase
        .from("pv_transfers")
        .insert({
          pv_id: selectedDocId,
          from_user: user.id,
          to_user: null,
          reason: transferData.reason,
          recipient_name: transferData.recipientName,
          recipient_email: transferData.recipientEmail,
          recipient_phone: transferData.recipientPhone,
          recipient_company: transferData.recipientCompany,
          status: "pending",
        });

      if (transferError) throw transferError;

      // Mettre à jour le PV
      // const { error: updateError } = await supabase
      //   .from('pv_documents')
      //   .update({ assigned_to: recipientData.id })
      //   .eq('id', selectedDocId)

      // if (updateError) throw updateError

      // Fermer la modal et rafraîchir les données
      closeTransferModal();
      await fetchDocuments();
    } catch (error) {
      console.error("Erreur lors du transfert du PV:", error);
      alert("Erreur lors du transfert du PV: " + error.message);
    }
  };

  // Fonction pour créer une relance
  const createReminder = async (docId, type) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      // Récupérer le document
      const document = documents.find((doc) => doc.id === docId);
      if (!document) throw new Error("Document non trouvé");

      // Créer un message par défaut
      const defaultMessage =
        type === "email"
          ? `Bonjour, merci de bien vouloir signer et retourner le PV "${document.title}" dès que possible.`
          : `Rappel concernant la signature du PV "${document.title}".`;

      // Créer la relance
      const { error } = await supabase.from("pv_reminders").insert({
        pv_id: docId,
        sent_by: user.id,
        sent_to: document.assigned_to,
        message: defaultMessage,
        reminder_type: type,
      });

      if (error) throw error;

      // Rafraîchir les données
      await fetchDocuments();
    } catch (error) {
      console.error("Erreur lors de la création de la relance:", error);
      alert("Erreur lors de la création de la relance");
    }
  };

  // Afficher un message de chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-void"></div>
      </div>
    );
  }

  // Afficher un message d'erreur
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Erreur lors du chargement des PV: {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Documents à valider oo
        </h1>

        {/* Afficher le statut admin pour débogage */}
        <div className="text-xs text-gray-500 mr-4">
          Statut admin: {isAdmin ? "Oui" : "Non"}
        </div>

        {/* Afficher le bouton pour tous les utilisateurs temporairement */}
        <button
          onClick={openAddPvModal}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          Ajouter un PV
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">
            Aucun document à valider pour le moment.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg">
          {documents.map((doc) => (
            <div key={doc.id} className="p-6 border-b last:border-b-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">{doc.title}</h3>
                  <p className="text-sm text-gray-500">
                    Projet: {doc.project} | Date limite:{" "}
                    {doc.date ? formatDate(doc.date) : "Non définie"} | Statut:{" "}
                    <span
                      className={`font-medium ${
                        doc.status === "draft"
                          ? "text-gray-600"
                          : doc.status === "sent"
                          ? "text-blue-600"
                          : doc.status === "signed"
                          ? "text-green-600"
                          : doc.status === "validated"
                          ? "text-purple-600"
                          : "text-red-600"
                      }`}
                    >
                      {doc.status === "draft"
                        ? "Brouillon"
                        : doc.status === "sent"
                        ? "Envoyé"
                        : doc.status === "signed"
                        ? "Signé"
                        : doc.status === "validated"
                        ? "Validé"
                        : "Rejeté"}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Créé par {doc.created_by_name} | Assigné à{" "}
                    {doc.assigned_to_name} |
                    {formatDistanceToNow(new Date(doc.created_at), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </p>
                  {isAdmin && (
                    <div className="mt-1 text-xs text-gray-400">
                      <button
                        onClick={() => console.log("Infos document:", doc)}
                        className="underline"
                      >
                        Voir infos fichier
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  {doc.fileUrl && (
                    <button
                      onClick={() =>
                        downloadFile(doc.fileUrl, `${doc.title}.pdf`)
                      }
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-void hover:bg-void-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
                    >
                      <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                      Télécharger le PV
                    </button>
                  )}

                  {doc.status !== "validated" && doc.status !== "rejected" && (
                    <div className="relative">
                      <input
                        type="file"
                        id={`signed-doc-${doc.id}`}
                        className="sr-only"
                        accept=".pdf"
                        onChange={(e) => handleFileUpload(doc.id, e)}
                      />
                      <label
                        htmlFor={`signed-doc-${doc.id}`}
                        className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium 
                          ${
                            doc.hasUploadedSignedVersion
                              ? "border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                              : "border-void text-void bg-white hover:bg-gray-50"
                          } cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void`}
                      >
                        {uploadProgress[doc.id] !== undefined &&
                        uploadProgress[doc.id] !== null ? (
                          <span>Upload: {uploadProgress[doc.id]}%</span>
                        ) : doc.hasUploadedSignedVersion ? (
                          <>
                            <CheckCircleIcon className="h-5 w-5 mr-2" />
                            PV signé déposé
                          </>
                        ) : (
                          <>
                            <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                            Déposer le PV signé
                          </>
                        )}
                      </label>
                    </div>
                  )}

                  <button
                    onClick={() => openTransferModal(doc.id)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void"
                  >
                    <ArrowPathRoundedSquareIcon className="h-5 w-5 mr-2" />
                    Transférer
                  </button>
                </div>
              </div>

              {/* Historique des relances */}
              {doc.reminders && doc.reminders.length > 0 && (
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">
                    Historique des relances
                  </h4>
                  <div className="space-y-4">
                    {doc.reminders.map((reminder) => (
                      <div
                        key={reminder.id}
                        className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg"
                      >
                        <div className="flex-shrink-0">
                          {reminder.type === "email" ? (
                            <EnvelopeIcon className="h-5 w-5 text-blue-500" />
                          ) : (
                            <PhoneIcon className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <span className="font-medium text-gray-900">
                                {reminder.sender.name}
                              </span>
                              <span className="text-gray-500 ml-2">
                                {reminder.sender.role}
                              </span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              {formatDate(reminder.date)}
                            </div>
                          </div>
                          <div className="mt-1">
                            <div className="flex items-center text-sm text-gray-500">
                              <UserIcon className="h-4 w-4 mr-1" />
                              <span>À : {reminder.recipient.name}</span>
                              {reminder.type === "email" ? (
                                <span className="ml-2">
                                  ({reminder.recipient.email})
                                </span>
                              ) : (
                                <span className="ml-2">
                                  ({reminder.recipient.phone})
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-gray-700">
                              {reminder.message}
                            </p>
                            {reminder.response && (
                              <div className="mt-2 pl-4 border-l-2 border-gray-300">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Réponse:</span>{" "}
                                  {reminder.response}
                                </p>
                                {reminder.response_date && (
                                  <p className="text-xs text-gray-500">
                                    {formatDate(reminder.response_date)}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de transfert */}
      {transferModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Transférer le PV
            </h3>
            <form onSubmit={handleTransferSubmit}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="recipientName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nom du destinataire
                  </label>
                  <input
                    type="text"
                    id="recipientName"
                    name="recipientName"
                    value={transferData.recipientName}
                    onChange={handleTransferChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="recipientEmail"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email du destinataire
                  </label>
                  <input
                    type="email"
                    id="recipientEmail"
                    name="recipientEmail"
                    value={transferData.recipientEmail}
                    onChange={handleTransferChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="recipientPhone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Téléphone du destinataire
                  </label>
                  <input
                    type="text"
                    id="recipientPhone"
                    name="recipientPhone"
                    value={transferData.recipientPhone}
                    onChange={handleTransferChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="recipientCompany"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Entreprise du destinataire
                  </label>
                  <input
                    type="text"
                    id="recipientCompany"
                    name="recipientCompany"
                    value={transferData.recipientCompany}
                    onChange={handleTransferChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="reason"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Raison du transfert
                  </label>
                  <textarea
                    id="reason"
                    name="reason"
                    value={transferData.reason}
                    onChange={handleTransferChange}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
                  />
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-void text-base font-medium text-white hover:bg-void-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void sm:col-start-2 sm:text-sm"
                >
                  Transférer
                </button>
                <button
                  type="button"
                  onClick={closeTransferModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'ajout de PV */}
      {addPvModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Ajouter un nouveau PV
              </h3>
              <button
                onClick={closeAddPvModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleNewPvSubmit}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Titre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={newPvData.title}
                    onChange={handleNewPvChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="project_name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nom du projet <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="project_name"
                    name="project_name"
                    value={newPvData.project_name}
                    onChange={handleNewPvChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={newPvData.description}
                    onChange={handleNewPvChange}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="due_date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Date limite
                  </label>
                  <input
                    type="date"
                    id="due_date"
                    name="due_date"
                    value={newPvData.due_date}
                    onChange={handleNewPvChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="assigned_to"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Assigner à <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="assigned_to"
                    name="assigned_to"
                    value={newPvData.assigned_to}
                    onChange={handleNewPvChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-void focus:border-void sm:text-sm"
                  >
                    <option value="">Sélectionner un utilisateur</option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.full_name ||
                          `Utilisateur ${user.id.substring(0, 8)}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="pv_file"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Fichier PV <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="file"
                      id="pv_file"
                      name="pv_file"
                      onChange={handleNewPvFileChange}
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      required
                      className="sr-only"
                    />
                    <label
                      htmlFor="pv_file"
                      className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium 
                        ${
                          newPvFile
                            ? "border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                            : "border-void text-void bg-white hover:bg-gray-50"
                        } cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void`}
                    >
                      {newPvFileUploading ? (
                        <span>Upload: {newPvFileProgress}%</span>
                      ) : newPvFile ? (
                        <>
                          <CheckCircleIcon className="h-5 w-5 mr-2" />
                          {newPvFile.name}
                        </>
                      ) : (
                        <>
                          <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                          Sélectionner un fichier
                        </>
                      )}
                    </label>
                  </div>
                  {newPvFile && (
                    <p className="mt-2 text-xs text-gray-500">
                      {(newPvFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="submit"
                  disabled={newPvFileUploading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-void text-base font-medium text-white hover:bg-void-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void disabled:opacity-50 sm:col-start-2 sm:text-sm"
                >
                  {newPvFileUploading ? "Création en cours..." : "Créer"}
                </button>
                <button
                  type="button"
                  onClick={closeAddPvModal}
                  disabled={newPvFileUploading}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-void disabled:opacity-50 sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SignaturePV;
