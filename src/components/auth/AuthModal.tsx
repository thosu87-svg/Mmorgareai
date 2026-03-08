
"use client"

import { useState } from "react"
import { useAuth, useFirestore } from "@/firebase"
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const auth = useAuth()
  const db = useFirestore()
  const { toast } = useToast()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isSignUp) {
        const { user } = await createUserWithEmailAndPassword(auth, email, password)
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          createdAt: serverTimestamp(),
        })
        toast({ title: "Account created", description: "Welcome to Ouroboros!" })
      } else {
        await signInWithEmailAndPassword(auth, email, password)
        toast({ title: "Welcome back!", description: "Successfully signed in." })
      }
      onClose()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    const provider = new GoogleAuthProvider()
    try {
      const { user } = await signInWithPopup(auth, provider)
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
      }, { merge: true })
      toast({ title: "Welcome!", description: "Successfully signed in with Google." })
      onClose()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline italic uppercase text-accent">
            {isSignUp ? "Create Account" : "Sign In"}
          </DialogTitle>
          <DialogDescription>
            Access the Ouroboros neural network.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAuth} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="pilot@axiom.net" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full axiom-gradient text-white" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSignUp ? "Register" : "Sign In"}
          </Button>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
          Google
        </Button>
        <div className="text-center text-sm">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-accent hover:underline"
          >
            {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
