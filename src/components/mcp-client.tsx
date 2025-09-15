"use client";

import { useState, useEffect, useRef } from "react";
import type { Preset, OutputLine } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Server,
  Send,
  History,
  Star,
  Plus,
  Trash2,
  Sparkles,
  LoaderCircle,
  Box,
  Power,
  PowerOff,
  Terminal,
  ChevronRight,
  BookUser
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";

const PRESETS_STORAGE_KEY = "mcp-client-presets";
const HISTORY_STORAGE_KEY = "mcp-client-history";

export function McpClient() {
  const [isMounted, setIsMounted] = useState(false);
  const [serverAddress, setServerAddress] = useState("mcp.example.com");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [newPresetName, setNewPresetName] = useState("");
  const [newPresetCommand, setNewPresetCommand] = useState("");
  const [isPresetDialogOpen, setIsPresetDialogOpen] = useState(false);

  const outputRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedPresets = localStorage.getItem(PRESETS_STORAGE_KEY);
      if (storedPresets) {
        setPresets(JSON.parse(storedPresets));
      }
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      toast({
        title: "Error",
        description: "Failed to load saved data.",
        variant: "destructive"
      });
    }

    addOutputLine("system", "Welcome to Client Hub! Enter a server address and connect.");
  }, [toast]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    if(!isMounted) return;
    try {
        localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
    } catch (error) {
        console.error("Failed to save presets to localStorage", error);
    }
  }, [presets, isMounted]);

  useEffect(() => {
    if(!isMounted) return;
    try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
        console.error("Failed to save history to localStorage", error);
    }
  }, [history, isMounted]);

  const addOutputLine = (type: OutputLine["type"], text: string) => {
    setOutput((prev) => [
      ...prev,
      { id: prev.length, type, text },
    ]);
  };

  const handleConnect = () => {
    if (!serverAddress) {
      toast({ title: "Invalid server address", description: "Please enter a server address.", variant: "destructive" });
      return;
    }
    setIsConnecting(true);
    addOutputLine("system", `Connecting to ${serverAddress}...`);
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      addOutputLine(
        "system",
        `Successfully connected to ${serverAddress}. Type 'help' for commands.`
      );
    }, 1500);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    addOutputLine("system", "Disconnected from server.");
  };
  
  const mockServerResponse = (sentCommand: string) => {
    const responses: { [key: string]: string } = {
        help: "Available commands: help, status, players, kick <player>",
        status: `Server Status: Online\nVersion: 1.20.1\nPlayers: ${Math.floor(Math.random() * 10)}/20`,
        players: "Online players: player1, player2, another_user",
    };
    if (sentCommand.startsWith("kick")) {
        return `Player ${sentCommand.split(" ")[1]} has been kicked.`;
    }
    return responses[sentCommand.toLowerCase()] || `Unknown command: "${sentCommand}"`;
  }

  const handleSendCommand = () => {
    if (!command.trim() || !isConnected) return;

    addOutputLine("out", command);
    
    if (history[0] !== command) {
        const newHistory = [command, ...history].slice(0, 50);
        setHistory(newHistory);
    }
    setHistoryIndex(-1);
    
    setTimeout(() => {
        addOutputLine("in", mockServerResponse(command));
    }, 300 + Math.random() * 300);

    setCommand("");
  };

  const handleCommandKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendCommand();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(newIndex);
        setCommand(history[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = Math.max(historyIndex - 1, 0);
        setHistoryIndex(newIndex);
        setCommand(history[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand("");
      }
    }
  };

  const handleAddPreset = () => {
    if (!newPresetName.trim() || !newPresetCommand.trim()) {
      toast({ title: "Invalid Preset", description: "Preset name and command cannot be empty.", variant: "destructive" });
      return;
    }
    const newPreset: Preset = {
      id: crypto.randomUUID(),
      name: newPresetName,
      command: newPresetCommand,
    };
    setPresets([...presets, newPreset]);
    setNewPresetName("");
    setNewPresetCommand("");
    setIsPresetDialogOpen(false);
    toast({ title: "Preset Saved!", description: `Preset '${newPreset.name}' has been added.`});
  };

  const handleDeletePreset = (id: string) => {
    setPresets(presets.filter((p) => p.id !== id));
    toast({ title: "Preset removed.", variant: "default"});
  };

  if (!isMounted) {
    return <div className="flex h-screen w-screen items-center justify-center bg-background">
      <LoaderCircle className="h-16 w-16 animate-spin text-primary"/>
    </div>;
  }

  return (
    <div className="grid h-screen w-full grid-cols-[350px_1fr]">
      <aside className="border-r border-border/40 bg-zinc-900/50 flex flex-col p-4">
        <div className="flex items-center gap-3 mb-4 p-2">
            <Box size={32} className="text-primary"/>
            <h1 className="text-2xl font-bold">Client Hub</h1>
        </div>
        <Card className="flex-grow flex flex-col bg-transparent border-0 shadow-none">
            <Tabs defaultValue="presets" className="flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="presets"><Star className="mr-2 h-4 w-4"/>Presets</TabsTrigger>
                <TabsTrigger value="history"><History className="mr-2 h-4 w-4"/>History</TabsTrigger>
            </TabsList>
            <TabsContent value="presets" className="flex-grow flex flex-col h-0 mt-4">
                <div className="px-1 pb-4">
                    <Dialog open={isPresetDialogOpen} onOpenChange={setIsPresetDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full"><Plus className="mr-2 h-4 w-4"/>Add Preset</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                        <DialogTitle>New Preset</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" value={newPresetName} onChange={(e) => setNewPresetName(e.target.value)} className="col-span-3"/>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="command" className="text-right">Command</Label>
                            <Input id="command" value={newPresetCommand} onChange={(e) => setNewPresetCommand(e.target.value)} className="col-span-3"/>
                        </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddPreset}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                    </Dialog>
                </div>
                <ScrollArea className="flex-grow">
                    <div className="px-1 space-y-2">
                        {presets.length === 0 && <p className="text-sm text-muted-foreground text-center p-4">No saved presets.</p>}
                        {presets.map((preset) => (
                            <div key={preset.id} className="flex items-center gap-2 p-2 rounded-md bg-zinc-800/50 hover:bg-zinc-800 transition-colors">
                                <BookUser className="h-4 w-4 text-primary"/>
                                <span className="flex-grow font-mono text-sm">{preset.name}</span>
                                <Button size="icon" variant="ghost" onClick={() => { setCommand(preset.command); }}>
                                    <Send className="h-4 w-4"/>
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => handleDeletePreset(preset.id)}>
                                    <Trash2 className="h-4 w-4 text-red-400/80"/>
                                </Button>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </TabsContent>
            <TabsContent value="history" className="flex-grow h-0 mt-4">
                <ScrollArea className="h-full">
                    <div className="px-1 space-y-1">
                        {history.length === 0 && <p className="text-sm text-muted-foreground text-center p-4">No commands in history.</p>}
                        {history.map((histCmd, i) => (
                            <button key={i} onClick={() => setCommand(histCmd)} className="w-full text-left p-2 rounded-md hover:bg-zinc-800 transition-colors">
                                <p className="font-mono text-sm truncate text-muted-foreground">{histCmd}</p>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </TabsContent>
            </Tabs>
        </Card>
      </aside>

      <main className="flex-grow flex flex-col p-4 gap-4">
        <Card className="bg-transparent">
            <CardContent className="p-4 flex items-center gap-4">
                <Server className="text-primary"/>
                <Input
                    placeholder="Server Address"
                    value={serverAddress}
                    onChange={(e) => setServerAddress(e.target.value)}
                    disabled={isConnected || isConnecting}
                    className="flex-grow"
                />
                {isConnected ? (
                    <Button variant="destructive" onClick={handleDisconnect}><PowerOff className="mr-2 h-4 w-4"/>Disconnect</Button>
                ) : (
                    <Button onClick={handleConnect} disabled={isConnecting}>
                        {isConnecting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin"/> : <Power className="mr-2 h-4 w-4"/>}
                        {isConnecting ? "Connecting..." : "Connect"}
                    </Button>
                )}
                <div className="flex items-center gap-2">
                    <div className={cn("h-3 w-3 rounded-full", isConnected ? "bg-green-500" : "bg-red-500")}/>
                    <span className="text-sm font-medium">{isConnected ? "Connected" : "Disconnected"}</span>
                </div>
            </CardContent>
        </Card>

        <Card className="flex-grow flex flex-col bg-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Terminal/> Server Output</CardTitle>
          </CardHeader>
          <Separator />
            <ScrollArea className="flex-grow p-4" viewportRef={outputRef}>
                <div className="space-y-3 font-mono text-sm">
                {output.map((line) => (
                    <div key={line.id} className="flex flex-col items-start gap-1 animate-in fade-in-0 duration-300">
                        <div className="flex items-center gap-2 w-full">
                            <ChevronRight size={16} className={cn(
                                "transform transition-transform",
                                line.type === "out" && "text-primary -rotate-90",
                                line.type === "in" && "text-green-400 rotate-90",
                                line.type === "system" && "text-blue-400"
                            )} />
                            <div className="flex-grow">
                                <pre className="whitespace-pre-wrap break-words">{line.text}</pre>
                            </div>
                        </div>
                    </div>
                ))}
                </div>
            </ScrollArea>
        </Card>

        <Card className="bg-transparent">
            <CardContent className="p-2">
                <div className="relative">
                    <Input
                        placeholder="Type a command..."
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        onKeyDown={handleCommandKeyDown}
                        disabled={!isConnected}
                        className="pr-12"
                    />
                    <Button 
                        size="icon" 
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" 
                        onClick={handleSendCommand} 
                        disabled={!isConnected || !command.trim()}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}

    