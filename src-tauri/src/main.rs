// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    pdfinder_lib::run()
}

// use std::fs::File;
// use std::io::BufReader;
// use tauri::command;
// use walkdir::WalkDir;
// use pdf_extract::extract_text;
//
// #[tauri::command]
// fn search_pdfs(directory: String, search_term: String) -> Vec<String> {
//     let mut results = Vec::new();
//
//     for entry in WalkDir::new(&directory)
//         .into_iter()
//         .filter_map(|e| e.ok())
//     {
//         if entry.path().extension().map_or(false, |ext| ext == "pdf") {
//             if let Ok(text) = extract_text(entry.path()) {
//                 if text.to_lowercase().contains(&search_term.to_lowercase()) {
//                     results.push(entry.path().to_string_lossy().to_string());
//                 }
//             }
//         }
//     }
//
//     results
// }
//
// fn main() {
//     tauri::Builder::default()
//         .invoke_handler(tauri::generate_handler![search_pdfs])
//         .run(tauri::generate_context!())
//         .expect("erro ao rodar app tauri");
// }
