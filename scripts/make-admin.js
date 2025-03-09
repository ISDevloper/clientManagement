// Script pour attribuer le rôle d'administrateur à un utilisateur dans Supabase
// Exécutez ce script avec : node scripts/make-admin.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Clé de service avec privilèges d'administration

// UUID de l'utilisateur à promouvoir en administrateur
const userId = '3938b5a8-dcbf-4358-b2ea-ea8b3a615d43'

// Vérification des variables d'environnement
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Erreur: Variables d\'environnement manquantes.')
  console.error('Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définis dans .env.local')
  process.exit(1)
}

async function makeUserAdmin() {
  try {
    // Création d'un client Supabase avec la clé de service
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Mise à jour des métadonnées de l'utilisateur
    const { data, error } = await supabase.auth.admin.updateUserById(
      userId,
      { user_metadata: { role: 'admin' } }
    )

    if (error) {
      console.error('Erreur lors de la mise à jour des métadonnées:', error.message)
      process.exit(1)
    }

    console.log('Utilisateur promu en administrateur avec succès!')
    console.log('Détails de l\'utilisateur:', data.user)
    
    // Mise à jour du profil si nécessaire
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
      console.error('Erreur lors de la mise à jour du profil:', profileError.message)
    }

  } catch (error) {
    console.error('Erreur inattendue:', error.message)
    process.exit(1)
  }
}

// Exécution de la fonction
makeUserAdmin() 