// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

use std::fs;
use std::path::Path;
use walkdir::WalkDir;
use pdf_extract::extract_text;

#[tauri::command]
fn search_pdfs(directory: String, search_term: String) -> Vec<String> {
    let mut results = Vec::new();

    for entry in WalkDir::new(&directory)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        if entry.path().extension().map_or(false, |ext| ext == "pdf") {
            if let Ok(text) = extract_text(entry.path()) {
                if text.to_lowercase().contains(&search_term.to_lowercase()) {
                    results.push(entry.path().to_string_lossy().to_string());
                }
            }
        }
    }

    results
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, search_pdfs])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
