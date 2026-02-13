import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bot, MessageCircle, Wrench, Search, FileText, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden p-8 text-center">
      <div className="pointer-events-none absolute -top-[200px] left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <Bot className="h-4 w-4" />
          RAG-Powered AI Assistant
        </div>

        <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
          Selamat Datang di<br />
          <span className="bg-gradient-to-br from-primary to-foreground bg-clip-text text-transparent">
            Humbet AI
          </span>
        </h1>

        <div className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Asisten cerdas yang menggunakan teknologi Retrieval-Augmented Generation
          untuk menjawab pertanyaan dengan konteks dokumen yang akurat.
        </div>

        <div className="mb-16 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="h-12 px-8 text-base">
            <Link to="/conversation">
              <MessageCircle className="mr-2 h-5 w-5" />
              Mulai Chat
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
            <Link to="/chat">
              <Wrench className="mr-2 h-5 w-5" />
              Debug Chat
            </Link>
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-8 sm:gap-16">
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <Search className="h-8 w-8" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Retrieval Cerdas</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <FileText className="h-8 w-8" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Berbasis Dokumen</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <Zap className="h-8 w-8" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Iterative Refinement</span>
          </div>
        </div>
      </div>
    </div>
  );
}
