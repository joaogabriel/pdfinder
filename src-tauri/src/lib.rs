use walkdir::WalkDir;
use pdf_extract::extract_text;
use tokio::task;
use rayon::prelude::*;

#[tauri::command]
async fn search_pdfs(directory: String, search_term: String) -> Vec<String> {
    let search_term = search_term.to_lowercase();

    let results = task::spawn_blocking(move || {
        WalkDir::new(&directory)
            .into_iter()
            .par_bridge()
            .filter_map(|entry| entry.ok())
            .filter(|entry| entry.path().extension().map_or(false, |ext| ext == "pdf"))
            .filter_map(|entry| {
                match extract_text(entry.path()) {
                    Ok(text) if text.to_lowercase().contains(&search_term) => {
                        Some(entry.path().to_string_lossy().to_string())
                    }
                    _ => None,
                }
            })
            .collect::<Vec<String>>()
    })
    .await
    .unwrap_or_default();

    results
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![search_pdfs])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}
