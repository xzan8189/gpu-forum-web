"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Cpu,
  MessageSquare,
  Eye,
  ThumbsUp,
  Search,
  Filter,
  Plus,
  Star,
  Pin,
  Flame,
  ChevronLeft,
  ChevronRight,
  Tag as TagIcon,
  Users,
} from "lucide-react";

// ------------------------------------------------------------
// Tipi
// ------------------------------------------------------------

type Brand = "NVIDIA" | "AMD" | "Intel";

type Category = "Discussione" | "Guide" | "Benchmark" | "Assistenza";

type Thread = {
  id: string;
  title: string;
  brand: Brand;
  category: Category;
  tags: string[];
  author: string;
  avatar?: string;
  createdAt: string; // ISO
  views: number;
  replies: number;
  likes: number;
  pinned?: boolean;
  closed?: boolean;
  trending?: boolean;
};

// ------------------------------------------------------------
// Dati fittizi (puoi sostituirli con una API)
// ------------------------------------------------------------

const initialThreads: Thread[] = [
  {
    id: cryptoId(),
    title: "Consiglio upgrade da RTX 3060 a 4070 Super per 1440p",
    brand: "NVIDIA",
    category: "Assistenza",
    tags: ["upgrade", "1440p", "DLSS"],
    author: "Luca B.",
    createdAt: daysAgo(0.5),
    views: 820,
    replies: 26,
    likes: 18,
    trending: true,
  },
  {
    id: cryptoId(),
    title: "Guida: undervolt RX 7800 XT passo-passo",
    brand: "AMD",
    category: "Guide",
    tags: ["undervolt", "efficienza", "Adrenalin"],
    author: "ValeTech",
    createdAt: daysAgo(2),
    views: 2310,
    replies: 74,
    likes: 210,
    pinned: true,
  },
  {
    id: cryptoId(),
    title: "Arc A770: com'è maturata con gli ultimi driver?",
    brand: "Intel",
    category: "Discussione",
    tags: ["driver", "aggiornamenti"],
    author: "Federico",
    createdAt: daysAgo(5),
    views: 1420,
    replies: 58,
    likes: 67,
  },
  {
    id: cryptoId(),
    title: "Benchmark Starfield: RX 7900 XTX vs RTX 4080 a 4K",
    brand: "AMD",
    category: "Benchmark",
    tags: ["4K", "FSR3", "ray tracing"],
    author: "Greta",
    createdAt: daysAgo(1.2),
    views: 3920,
    replies: 112,
    likes: 254,
    trending: true,
  },
  {
    id: cryptoId(),
    title: "Schermo nero con RTX 3080 dopo resume: idee?",
    brand: "NVIDIA",
    category: "Assistenza",
    tags: ["bug", "resume", "driver"],
    author: "Kenzo",
    createdAt: daysAgo(0.1),
    views: 210,
    replies: 7,
    likes: 2,
  },
  {
    id: cryptoId(),
    title: "Build mini-ITX silenziosa per editing 4K",
    brand: "AMD",
    category: "Discussione",
    tags: ["mini-itx", "silenzio", "editing"],
    author: "Sara",
    createdAt: daysAgo(9),
    views: 980,
    replies: 19,
    likes: 34,
  },
  {
    id: cryptoId(),
    title: "[MEGATHREAD] Driver 24.x AMD: feedback e bug",
    brand: "AMD",
    category: "Discussione",
    tags: ["driver", "bug", "release notes"],
    author: "Mod-Team",
    createdAt: daysAgo(12),
    views: 5210,
    replies: 402,
    likes: 600,
    pinned: true,
  },
  {
    id: cryptoId(),
    title: "RTX 5090: rumor credibili o fuffa?",
    brand: "NVIDIA",
    category: "Discussione",
    tags: ["rumor", "next-gen"],
    author: "Alessio",
    createdAt: daysAgo(3),
    views: 3012,
    replies: 85,
    likes: 170,
  },
];

const trendsData = [
  { day: "Lun", posts: 42 },
  { day: "Mar", posts: 38 },
  { day: "Mer", posts: 61 },
  { day: "Gio", posts: 55 },
  { day: "Ven", posts: 80 },
  { day: "Sab", posts: 72 },
  { day: "Dom", posts: 48 },
];

// ------------------------------------------------------------
// Component principale
// ------------------------------------------------------------

export default function GpuForum() {
  const [threads, setThreads] = useState<Thread[]>(initialThreads);
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState<Brand | "tutti">("tutti");
  const [category, setCategory] = useState<Category | "tutte">("tutte");
  const [sort, setSort] = useState<"recenti" | "risposte" | "visti" | "miPiace">(
    "recenti"
  );
  const [page, setPage] = useState(1);
  const perPage = 6;

  const filtered = useMemo(() => {
    let list = [...threads];

    // Ricerca
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.tags.some((x) => x.toLowerCase().includes(q)) ||
          t.author.toLowerCase().includes(q)
      );
    }

    // Filtri
    if (brand !== "tutti") list = list.filter((t) => t.brand === brand);
    if (category !== "tutte") list = list.filter((t) => t.category === category);

    // Ordina
    list.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      switch (sort) {
        case "risposte":
          return b.replies - a.replies;
        case "visti":
          return b.views - a.views;
        case "miPiace":
          return b.likes - a.likes;
        default: {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      }
    });

    return list;
  }, [threads, query, brand, category, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  React.useEffect(() => {
    // reset pagina quando cambiano filtri/ricerca/ordinamento
    setPage(1);
  }, [query, brand, category, sort]);

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="border-b sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <header className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-2xl grid place-items-center border">
                <Cpu className="size-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold leading-tight">GPU Forum</h1>
                <p className="text-xs text-muted-foreground -mt-1">
                  Community italiana su schede video
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2">
                <div className="relative w-72">
                  <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    placeholder="Cerca discussioni, tag, autori..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <CreateThreadDialog onCreate={(t) => setThreads((p) => [t, ...p])} />
              </div>

              <DropdownUser />
            </div>
          </header>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar sinistra */}
        <aside className="hidden lg:block lg:col-span-3">
          <Card className="sticky top-20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Filter className="size-4" />
                <CardTitle className="text-base">Filtri</CardTitle>
              </div>
              <CardDescription>Affina le discussioni</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Marca</Label>
                <Select value={brand} onValueChange={(v) => setBrand(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tutte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tutti">Tutte</SelectItem>
                    <SelectItem value="NVIDIA">NVIDIA</SelectItem>
                    <SelectItem value="AMD">AMD</SelectItem>
                    <SelectItem value="Intel">Intel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tutte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tutte">Tutte</SelectItem>
                    <SelectItem value="Discussione">Discussione</SelectItem>
                    <SelectItem value="Guide">Guide</SelectItem>
                    <SelectItem value="Benchmark">Benchmark</SelectItem>
                    <SelectItem value="Assistenza">Assistenza</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ordina per</Label>
                <Select value={sort} onValueChange={(v) => setSort(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recenti">Più recenti</SelectItem>
                    <SelectItem value="risposte">Più risposte</SelectItem>
                    <SelectItem value="visti">Più visti</SelectItem>
                    <SelectItem value="miPiace">Più mi piace</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Tag popolari</Label>
                <div className="flex flex-wrap gap-2">
                  {["undervolt", "4K", "driver", "DLSS", "FSR3", "mini-itx"].map(
                    (t) => (
                      <Badge
                        key={t}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => setQuery(t)}
                      >
                        <TagIcon className="mr-1 size-3" /> {t}
                      </Badge>
                    )
                  )}
                </div>
              </div>

              <Separator />

              <Card className="border-none shadow-none">
                <CardHeader className="px-0 pt-0 pb-2">
                  <div className="flex items-center gap-2">
                    <Flame className="size-4" />
                    <CardTitle className="text-sm">Trend settimanale</CardTitle>
                  </div>
                  <CardDescription>Post pubblicati al giorno</CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <div className="h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendsData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" tickLine={false} axisLine={false} />
                        <YAxis width={24} tickLine={false} axisLine={false} />
                        <RechartsTooltip />
                        <Area type="monotone" dataKey="posts" fillOpacity={0.25} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </aside>

        {/* Colonna centrale */}
        <section className="lg:col-span-6 space-y-4">
          <div className="flex md:hidden items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Cerca discussioni..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <CreateThreadDialog onCreate={(t) => setThreads((p) => [t, ...p])} />
          </div>

          <Tabs defaultValue="tutte" value={category as string} onValueChange={(v) => setCategory(v as any)}>
            <div className="flex items-center justify-between">
              <TabsList className="grid grid-cols-5 w-full md:w-auto md:inline-grid">
                <TabsTrigger value="tutte">Tutte</TabsTrigger>
                <TabsTrigger value="Guide">Guide</TabsTrigger>
                <TabsTrigger value="Benchmark">Benchmark</TabsTrigger>
                <TabsTrigger value="Assistenza">Assistenza</TabsTrigger>
                <TabsTrigger value="Discussione">Discussione</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value={category as string} className="mt-4">
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {paged.map((t) => (
                    <motion.div
                      key={t.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <ThreadCard thread={t} />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {paged.length === 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Nessun risultato</CardTitle>
                      <CardDescription>
                        Prova a cambiare filtri o a rimuovere la ricerca.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                )}

                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-muted-foreground">
                    {filtered.length} discussioni • pagina {page} di {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="mr-1 size-4" /> Prec
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Succ <ChevronRight className="ml-1 size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Sidebar destra */}
        <aside className="hidden xl:block xl:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Pin className="size-4" />
                <CardTitle className="text-base">In evidenza</CardTitle>
              </div>
              <CardDescription>Thread fissati dallo staff</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {threads
                .filter((t) => t.pinned)
                .slice(0, 3)
                .map((t) => (
                  <div key={t.id} className="flex items-start gap-2">
                    <Star className="size-4 mt-1" />
                    <div className="leading-tight">
                      <p className="text-sm font-medium line-clamp-2">{t.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline">{t.brand}</Badge>
                        <span>{t.category}</span>
                        <span>• {timeAgo(t.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Users className="size-4" />
                <CardTitle className="text-base">Regole rapide</CardTitle>
              </div>
              <CardDescription>Prima di postare, leggi qui</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm list-disc pl-5 space-y-1">
                <li>Usa tag chiari nel titolo.</li>
                <li>Niente flame-war: sii rispettoso.</li>
                <li>Per l'assistenza, includi specifiche e log.</li>
                <li>Niente spam o referral link.</li>
              </ul>
            </CardContent>
          </Card>
        </aside>
      </main>

      <footer className="border-t">
        <div className="container mx-auto px-4 py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} GPU Forum — Realizzato con shadcn/ui
        </div>
      </footer>
    </div>
  );
}

// ------------------------------------------------------------
// Sottocomponenti
// ------------------------------------------------------------

function ThreadCard({ thread }: { thread: Thread }) {
  return (
    <Card className="group hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-10 shrink-0">
            <Avatar>
              <AvatarImage src={thread.avatar} alt={thread.author} />
              <AvatarFallback>{initials(thread.author)}</AvatarFallback>
            </Avatar>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {thread.pinned && (
                <Badge variant="outline" className="border-dashed">
                  <Pin className="mr-1 size-3" /> Fissato
                </Badge>
              )}
              {thread.trending && (
                <Badge className="">
                  <Flame className="mr-1 size-3" /> Trend
                </Badge>
              )}
              {thread.closed && <Badge variant="secondary">Chiuso</Badge>}

              <h3 className="text-base md:text-lg font-semibold leading-tight">
                <a href="#" className="hover:underline">
                  {thread.title}
                </a>
              </h3>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline">{thread.brand}</Badge>
              <span>{thread.category}</span>
              <span>• {timeAgo(thread.createdAt)}</span>
              <div className="flex items-center gap-1">
                {thread.tags.map((t) => (
                  <Badge key={t} variant="secondary">
                    <TagIcon className="mr-1 size-3" /> {t}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Eye className="size-4" /> {formatK(thread.views)}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="size-4" /> {formatK(thread.replies)}
              </span>
              <span className="inline-flex items-center gap-1">
                <ThumbsUp className="size-4" /> {formatK(thread.likes)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateThreadDialog({
  onCreate,
}: {
  onCreate: (thread: Thread) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState<Brand>("NVIDIA");
  const [category, setCategory] = useState<Category>("Discussione");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isQuestion, setIsQuestion] = useState(true);

  function submit() {
    if (!title.trim()) return;
    const newThread: Thread = {
      id: cryptoId(),
      title,
      brand,
      category,
      tags,
      author: "Tu",
      createdAt: new Date().toISOString(),
      views: 0,
      replies: 0,
      likes: 0,
      trending: false,
      pinned: false,
      closed: false,
    };
    onCreate(newThread);
    // reset
    setTitle("");
    setBrand("NVIDIA");
    setCategory("Discussione");
    setContent("");
    setTags([]);
    setIsQuestion(true);
    setOpen(false);
  }

  function addTagFromInput() {
    const clean = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 5);
    if (clean.length) {
      setTags((prev) => Array.from(new Set([...prev, ...clean])).slice(0, 5));
      setTagInput("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" /> Nuovo thread
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nuovo thread</DialogTitle>
          <DialogDescription>
            Crea una discussione per la community. I campi con * sono
            obbligatori.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-4 space-y-2">
              <Label htmlFor="title">Titolo *</Label>
              <Input
                id="title"
                placeholder="Es. Consiglio GPU per monitor 3440×1440"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Marca *</Label>
              <Select value={brand} onValueChange={(v) => setBrand(v as Brand)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NVIDIA">NVIDIA</SelectItem>
                  <SelectItem value="AMD">AMD</SelectItem>
                  <SelectItem value="Intel">Intel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as Category)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Discussione">Discussione</SelectItem>
                  <SelectItem value="Guide">Guide</SelectItem>
                  <SelectItem value="Benchmark">Benchmark</SelectItem>
                  <SelectItem value="Assistenza">Assistenza</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Contenuto</Label>
            <Textarea
              id="content"
              placeholder="Descrivi il problema o condividi dettagli (specifiche, test, ecc.)."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Tag (max 5)</Label>
            <div className="flex items-center gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Es. 4K, undervolt"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTagFromInput();
                  }
                }}
              />
              <Button variant="outline" onClick={addTagFromInput}>
                Aggiungi
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <Badge
                  key={t}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => setTags((prev) => prev.filter((x) => x !== t))}
                  title="Rimuovi"
                >
                  <TagIcon className="mr-1 size-3" /> {t}
                </Badge>
              ))}
              {tags.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Nessun tag aggiunto.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="question"
              checked={isQuestion}
              onCheckedChange={(v) => setIsQuestion(Boolean(v))}
            />
            <Label htmlFor="question" className="text-sm text-muted-foreground">
              È una domanda (consigliato per l'assistenza)
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annulla
          </Button>
          <Button onClick={submit}>Pubblica</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DropdownUser() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
          <Avatar className="h-10 w-10">
            <AvatarImage src={"https://i.pravatar.cc/100?img=13"} alt="Utente" />
            <AvatarFallback>UT</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Il tuo account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profilo</DropdownMenuItem>
        <DropdownMenuItem>Impostazioni</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Esci</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ------------------------------------------------------------
// Utility
// ------------------------------------------------------------

function cryptoId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

function daysAgo(n: number) {
  const d = new Date(Date.now() - n * 24 * 60 * 60 * 1000);
  return d.toISOString();
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.max(1, Math.floor(diff / 1000));
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}g fa`;
  if (h > 0) return `${h}h fa`;
  if (m > 0) return `${m}m fa`;
  return `${s}s fa`;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatK(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `${n}`;
}
