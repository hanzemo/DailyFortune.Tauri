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
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            save_auth_token,
            get_auth_token,
            delete_auth_token
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
