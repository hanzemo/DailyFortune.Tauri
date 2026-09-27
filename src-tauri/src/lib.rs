mod secure_store;

#[tauri::command]
fn save_auth_token(key: String, value: String) -> Result<(), String> {
    secure_store::save(&key, &value)
}

#[tauri::command]
fn get_auth_token(key: String) -> Result<Option<String>, String> {
    secure_store::get(&key)
}

#[tauri::command]
fn delete_auth_token(key: String) -> Result<(), String> {
    secure_store::delete(&key)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(target_os = "linux")]
    {
        if std::env::var_os("WEBKIT_DISABLE_COMPOSITING_MODE").is_none() {
            std::env::set_var("WEBKIT_DISABLE_COMPOSITING_MODE", "1");
        }
        if std::env::var_os("WEBKIT_DISABLE_DMABUF_RENDERER").is_none() {
            std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
        }
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .setup(|app| {
            use tauri::Manager;
            if let Some(w) = app.get_webview_window("main") {
                w.open_devtools();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            save_auth_token,
            get_auth_token,
            delete_auth_token
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
