import "server-only"
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app"
import { type Firestore, getFirestore } from "firebase-admin/firestore"

/**
 * Acesso de leitura ao Firebase do admin. A credencial vive só em variável de
 * ambiente do servidor — nunca `NEXT_PUBLIC_*`, nunca no cliente.
 *
 * Sem credencial (CI, clone novo), devolve `null` em vez de explodir: as páginas
 * caem para os valores padrão e o build continua passando. Ver §5 do design doc.
 */
let warned = false

export function firestore(): Firestore | null {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

  if (!projectId || !clientEmail || !privateKey) {
    if (!warned) {
      warned = true
      console.warn("[firebase] credenciais ausentes: o site sobe com o catálogo vazio.")
    }
    return null
  }

  const app = getApps().length
    ? getApp()
    : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
  return getFirestore(app)
}
