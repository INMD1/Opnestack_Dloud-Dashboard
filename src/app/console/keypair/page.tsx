"use client"

import { useState, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Keypair {
  name: string;
  fingerprint: string;
  created_at: string;
}

export default function KeypairPage() {
  const [keypairs, setKeypairs] = useState<Keypair[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeypairName, setNewKeypairName] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isPrivateKeyDialogOpen, setPrivateKeyDialogOpen] = useState(false);

  async function fetchKeypairs() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/keypairs");
      if (!res.ok) {
        throw new Error("Failed to fetch keypairs");
      }
      const data = await res.json();
      if (data && data.keypairs) {
        setKeypairs(data.keypairs);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchKeypairs();
  }, []);

  async function handleCreateKeypair() {
    try {
      const res = await fetch("/api/v1/keypairs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newKeypairName }),
      });

      if (!res.ok) {
        throw new Error("Failed to create keypair");
      }

      const data = await res.json();
      if (data) {
        setPrivateKey(data.private_key);
        setCreateDialogOpen(false);
        setPrivateKeyDialogOpen(true);
        fetchKeypairs(); // Refresh the list
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDeleteKeypair(keypairName: string) {
    try {
      const res = await fetch(`/api/v1/keypairs`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: keypairName }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete keypair");
      }

      fetchKeypairs(); // Refresh the list
    } catch (error) {
      console.error(error);
    }
  }

  function handleDownloadPrivateKey() {
    const element = document.createElement("a");
    const file = new Blob([privateKey], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${newKeypairName}.pem`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    setPrivateKeyDialogOpen(false);
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">키페어</h1>
          <p className="text-muted-foreground mt-2">
            SSH 키페어를 관리하고 인스턴스에 접근하는 데 사용합니다.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>키페어 생성</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>키페어 생성</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  이름
                </Label>
                <Input
                  id="name"
                  value={newKeypairName}
                  onChange={(e) => setNewKeypairName(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateKeypair}>생성</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <Dialog open={isPrivateKeyDialogOpen} onOpenChange={setPrivateKeyDialogOpen} >
        <DialogContent >
          <DialogHeader>
            <DialogTitle>프라이빗 키</DialogTitle>
            <DialogDescription>
              프라이빗 키는 다시 확인할 수 없으니 안전한 곳에 저장하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-96 my-4">
            <pre className="bg-gray-200 p-4 rounded-md overflow-x-auto">
              <code className="text-black">{privateKey}</code>
            </pre>
          </div>
          <DialogFooter >
            <Button onClick={handleDownloadPrivateKey}>다운로드</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>지문 (Fingerprint)</TableHead>
                <TableHead>생성일</TableHead>
                <TableHead className="text-right pr-6">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-48">
                    <p>키페어 목록을 불러오는 중입니다...</p>
                  </TableCell>
                </TableRow>
              ) : keypairs.length > 0 ? (
                keypairs.map((keypair) => (
                  <TableRow key={keypair.name}>
                    <TableCell className="font-medium">{keypair.name}</TableCell>
                    <TableCell>{keypair.fingerprint}</TableCell>
                    <TableCell>{new Date(keypair.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">메뉴 열기</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => handleDeleteKeypair(keypair.name)}
                          >
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-48">
                    <p>생성된 키페어가 없습니다.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}