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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, Search, X, FileText } from "lucide-react";

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
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8">
            <Card className="w-full max-w-4xl shadow-lg">
                <CardHeader className="bg-blue-600 text-white rounded-t-lg">
                    <CardTitle className="text-2xl font-bold flex items-center justify-center">
                        <FileText className="mr-2" /> Buscador em PDFs
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium text-gray-700">Diretório de Busca</label>
                        <div className="flex items-center space-x-3">
                            <Button
                                onClick={handleDirectorySelect}
                                variant="outline"
                                className="flex-shrink-0 border-blue-300 hover:bg-blue-50"
                            >
                                <FolderOpen className="mr-2 text-blue-500" /> Selecionar Diretório
                            </Button>
                            <div className="flex-1 p-2 bg-gray-100 rounded-md overflow-hidden text-ellipsis whitespace-nowrap">
                                {directory || "Nenhum diretório selecionado"}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium text-gray-700">Termo de Pesquisa</label>
                        <Input
                            type="text"
                            placeholder="Digite um termo de pesquisa..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex justify-between items-center">
                        <Button
                            onClick={handleSearch}
                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center px-6"
                            disabled={!directory || !searchTerm}
                        >
                            <Search className="mr-2" /> Pesquisar
                        </Button>
                        <Button
                            onClick={handleClear}
                            className="bg-red-500 hover:bg-red-600 text-white flex items-center"
                        >
                            <X className="mr-2" /> Limpar
                        </Button>
                    </div>

                    {progress > 0 && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Progresso da busca</span>
                                <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="w-full h-2" />
                        </div>
                    )}

                    <div className="border rounded-lg p-4 bg-white max-h-64 overflow-y-auto">
                        <h3 className="font-medium mb-3">Resultados da Busca</h3>
                        {files.length > 0 ? (
                            <div className="space-y-2">
                                {files.map((file, index) => (
                                    <div key={index} className="flex items-start p-2 hover:bg-gray-50 rounded-md">
                                        <FileText className="mr-2 mt-1 text-blue-500 flex-shrink-0" size={18} />
                                        <span className="text-gray-700 break-all">{file}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-gray-500 flex items-center justify-center p-4">
                                {directory ? "Nenhum arquivo encontrado" : "Selecione um diretório para iniciar a busca"}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
