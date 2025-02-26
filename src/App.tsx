import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";

import { invoke } from "@tauri-apps/api/core";
// import { open } from "@tauri-apps/api/dialog";
import { open } from '@tauri-apps/plugin-dialog';
// import { readDir } from "@tauri-apps/api/fs";
import { readDir } from "@tauri-apps/plugin-fs"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { FolderOpen, Search, X } from "lucide-react";

export default function App() {
    const [directory, setDirectory] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [progress, setProgress] = useState(0);
    const [files, setFiles] = useState<string[]>([]);

    const handleDirectorySelect = async () => {
        try {
            // const selected = await open({ directory: true });
            // if (selected) {
            //     setDirectory(selected as string);
            // }
            const selectedDirectory = await open({
                directory: true,
                multiple: false,
                title: 'Selecione um Diretório',
            });

            if (selectedDirectory) {
                console.log('Diretório selecionado:', selectedDirectory);
                alert(`Diretório selecionado: ${selectedDirectory}`);
                setDirectory(selectedDirectory as string);
            } else {
                console.log('Nenhum diretório selecionado.');
            }
        } catch (error) {
            console.error("Erro ao selecionar diretório:", error);
        }
    };

    const handleSearch = async () => {
        console.log(directory);
        if (!directory) return;
        setProgress(30);
        try {
            const entries = await readDir(directory, { recursive: true });
            console.log('Entrada', entries);
            // const filteredFiles = entries
            //     .map((entry) => entry.name || "")
            //     .filter((name) => name.toLowerCase().includes(searchTerm.toLowerCase()));
            const result: string[] = await invoke("search_pdfs", {
                directory,
                searchTerm,
            });
            console.log('result', result);
            setFiles(result);
            setProgress(100);
        } catch (error) {
            console.error("Erro ao buscar arquivos:", error);
        }
    };

    const handleClear = () => {
        setDirectory(null);
        setSearchTerm("");
        setProgress(0);
        setFiles([]);
    };

    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center p-6 bg-white">
            <h2 className="text-2xl font-semibold mb-6">Pesquisa de Arquivos</h2>
            <div className="w-full max-w-xl space-y-6">
                <div className="flex items-center space-x-4">
                    <Button onClick={handleDirectorySelect} variant="outline">
                        <FolderOpen className="mr-2" /> Selecionar Diretório
                    </Button>
                    <span>{directory || "Nenhum diretório selecionado"}</span>
                </div>
                <Input
                    type="text"
                    placeholder="Digite um termo de pesquisa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="flex space-x-4">
                    <Button onClick={handleSearch}>
                        <Search className="mr-2" /> Pesquisar
                    </Button>
                    <Button onClick={handleClear} variant="destructive">
                        <X className="mr-2" /> Limpar
                    </Button>
                </div>
                <Progress value={progress} className="w-full" />
                <ul className="list-disc pl-5">
                    {files.length > 0 ? (
                        files.map((file, index) => (
                            <li key={index} className="text-gray-700">
                                {file}
                            </li>
                        ))
                    ) : (
                        <li className="text-gray-500">Nenhum arquivo encontrado</li>
                    )}
                </ul>
            </div>
        </div>
    );
}
