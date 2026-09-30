import Navbar from "@/components/layout/NavBar"
import HomePage from "./home/home"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
     
      <main className="flex-1">
        <HomePage />
      </main>
    </div>
  )
}
