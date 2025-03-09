import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    // Récupérer tous les cookies
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    
    console.log('Cookies disponibles dans l\'API de test:', allCookies.map(c => c.name).join(', '))
    
    // Vérifier si les cookies d'authentification sont présents
    const accessToken = cookieStore.get('sb-access-token')
    const refreshToken = cookieStore.get('sb-refresh-token')
    
    // Créer un client Supabase
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return allCookies
          },
          setAll() {
            // Pas besoin de définir des cookies pour ce test
          }
        }
      }
    )
    
    // Vérifier si l'utilisateur est authentifié
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Erreur lors de la vérification de l\'utilisateur:', error)
    }
    
    return NextResponse.json({
      cookies: allCookies.map(c => c.name),
      auth: {
        accessToken: !!accessToken,
        refreshToken: !!refreshToken,
        user: user ? {
          id: user.id,
          email: user.email,
          role: user.role
        } : null,
        authenticated: !!user
      }
    })
  } catch (error) {
    console.error('Erreur lors du test des cookies:', error)
    return NextResponse.json(
      { error: 'Erreur lors du test des cookies' },
      { status: 500 }
    )
  }
} 