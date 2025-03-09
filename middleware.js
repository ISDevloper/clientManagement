import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  console.log('Middleware appelé pour:', request.nextUrl.pathname, request.nextUrl.search)
  
  // Vérifier si un token d'autologin est présent dans l'URL
  const { searchParams } = new URL(request.url)
  const sessionToken = searchParams.get('session')
  
  let supabaseResponse = NextResponse.next({
    request,
  })
  
  // Créer un client Supabase pour le middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          const cookies = request.cookies.getAll()
          console.log('Cookies disponibles dans le middleware:', cookies.map(c => c.name).join(', '))
          return cookies
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            console.log(`Définition du cookie ${name} dans le middleware`)
            request.cookies.set(name, value)
          })
          
          supabaseResponse = NextResponse.next({
            request,
          })
          
          cookiesToSet.forEach(({ name, value, options }) => {
            console.log(`Définition du cookie ${name} dans la réponse du middleware`)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )
  
  // Si un token d'autologin est présent, vérifier sa validité et authentifier l'utilisateur
  if (sessionToken) {
    console.log('Token d\'autologin détecté dans le middleware:', sessionToken)
    
    try {
      // Créer un client Supabase avec la clé de service pour vérifier le token
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      if (!supabaseServiceKey) {
        console.error('Clé de service Supabase non configurée')
        // Continuer sans autologin
      } else {
        const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        })
        
        // Récupérer le token de la base de données
        console.log('Recherche du token dans la base de données...')
        let userId = null
        
        try {
          const { data: tokenData, error: tokenError } = await adminSupabase
            .from('autologin_tokens')
            .select('*')
            .eq('token', sessionToken)
            .is('used_at', null)
            .gt('expires_at', new Date().toISOString())
            .single()
          
          if (tokenError) {
            console.error('Erreur lors de la récupération du token:', tokenError)
            // Si la table n'existe pas ou si aucun token n'est trouvé, on continue avec un userId null
          } else if (tokenData) {
            console.log('Token trouvé:', tokenData)
            userId = tokenData.user_id
            
            // Marquer le token comme utilisé
            await adminSupabase
              .from('autologin_tokens')
              .update({ used_at: new Date().toISOString() })
              .eq('id', tokenData.id)
          }
        } catch (dbError) {
          console.error('Erreur lors de l\'interaction avec la base de données:', dbError)
          // Continuer avec un userId null
        }
        
        // Si nous n'avons pas trouvé le token en base de données, essayer de décoder le token
        if (!userId && sessionToken.includes('.')) {
          console.log('Token non trouvé en base de données, tentative de décodage...')
          
          try {
            // Essayer de décoder le token (si c'est un JWT)
            const parts = sessionToken.split('.')
            if (parts.length === 3) { // Vérifier que c'est bien un JWT (header.payload.signature)
              const payload = parts[1]
              const decoded = JSON.parse(Buffer.from(payload, 'base64').toString())
              userId = decoded.sub
              console.log('UserId extrait du token:', userId)
            } else {
              console.log('Le token n\'est pas au format JWT')
            }
          } catch (decodeError) {
            console.error('Impossible de décoder le token:', decodeError)
          }
        }
        
        if (userId) {
          // Récupérer l'utilisateur
          console.log('Récupération de l\'utilisateur:', userId)
          const { data: userData, error: userError } = await adminSupabase.auth.admin.getUserById(userId)
          
          if (userError) {
            console.error('Erreur lors de la récupération de l\'utilisateur:', userError)
          } else if (userData && userData.user) {
            console.log('Utilisateur trouvé:', userData.user.email)
            
            try {
              // Générer un lien magique pour l'utilisateur
              console.log('Génération d\'un lien magique pour l\'utilisateur...')
              
              const { data: magicLinkData, error: magicLinkError } = await adminSupabase.auth.admin.generateLink({
                type: 'magiclink',
                email: userData.user.email
              })
              
              if (magicLinkError) {
                console.error('Erreur lors de la génération du lien magique:', magicLinkError)
              } else if (magicLinkData && magicLinkData.properties && magicLinkData.properties.hashed_token) {
                console.log('Lien magique généré avec succès')
                
                // Vérifier le OTP pour créer une session
                console.log('Vérification du OTP pour créer une session...')
                const { data: verifiedData, error: verifyError } = await adminSupabase.auth.verifyOtp({
                  token_hash: magicLinkData.properties.hashed_token,
                  type: 'email'
                })
                
                if (verifyError) {
                  console.error('Erreur lors de la vérification du OTP:', verifyError)
                } else if (verifiedData && verifiedData.session) {
                  console.log('Session créée avec succès')
                  
                  // Créer une réponse de redirection vers la même page sans le paramètre de session
                  const redirectUrl = new URL(request.url)
                  redirectUrl.searchParams.delete('session')
                  
                  const redirectResponse = NextResponse.redirect(redirectUrl)
                  
                  // Extraire le nom du projet Supabase à partir de l'URL
                  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0]
                  console.log('Référence du projet Supabase:', projectRef)
                  
                  // Définir le cookie de session Supabase
                  const supabaseCookieName = `sb-${projectRef}-auth-token`
                  console.log('Nom du cookie Supabase:', supabaseCookieName)
                  
                  try {
                    // Créer l'objet de session au format attendu par Supabase
                    const sessionObj = {
                      access_token: verifiedData.session.access_token,
                      refresh_token: verifiedData.session.refresh_token,
                      expires_at: verifiedData.session.expires_at,
                      expires_in: verifiedData.session.expires_in
                    }
                    
                    // Définir le cookie de session
                    redirectResponse.cookies.set(
                      supabaseCookieName,
                      JSON.stringify(sessionObj),
                      {
                        path: '/',
                        maxAge: 60 * 60 * 24 * 7, // 7 jours
                        sameSite: 'lax',
                        secure: process.env.NODE_ENV === 'production',
                      }
                    )
                    
                    console.log('Cookie de session défini avec succès')
                    
                    // Marquer le token comme utilisé
                    const { error: updateError } = await adminSupabase
                      .from('autologin_tokens')
                      .update({ used_at: new Date().toISOString() })
                      .eq('token', sessionToken)
                    
                    if (updateError) {
                      console.error('Erreur lors de la mise à jour du token:', updateError)
                    } else {
                      console.log('Token marqué comme utilisé')
                    }
                    
                    return redirectResponse
                  } catch (sessionError) {
                    console.error('Erreur lors de la création de la session:', sessionError)
                  }
                }
              }
            } catch (error) {
              console.error('Erreur lors de la génération du lien magique:', error)
            }
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'autologin dans le middleware:', error)
    }
  }

  // Ne pas exécuter de code entre createServerClient et
  // supabase.auth.getUser(). Une simple erreur pourrait rendre difficile le débogage
  // des problèmes où les utilisateurs sont déconnectés aléatoirement.

  // IMPORTANT: NE PAS SUPPRIMER auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log('Utilisateur authentifié:', user ? 'Oui' : 'Non')

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/api/auth')
  ) {
    // pas d'utilisateur, rediriger vers la page de connexion
    console.log('Redirection vers la page de connexion')
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: Vous *devez* retourner l'objet supabaseResponse tel quel.
  console.log('Autorisation accordée pour:', request.nextUrl.pathname)
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Correspond à tous les chemins de requête sauf ceux commençant par:
     * - _next/static (fichiers statiques)
     * - _next/image (fichiers d'optimisation d'image)
     * - favicon.ico (fichier favicon)
     * N'hésitez pas à modifier ce modèle pour inclure plus de chemins.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 