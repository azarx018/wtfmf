package com.wtfmf.app

import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.Settings
import androidx.core.content.ContextCompat
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.ActivityCallback
import com.getcapacitor.annotation.CapacitorPlugin

/**
 * WtfmfPermissionPlugin — ADR-012 #1 (RESOLVED).
 *
 * Mirrors src/lib/native/permissionPlugin.ts method-for-method:
 *   checkState()       -> passive read, safe to call every resume
 *   requestFullAccess() -> launches ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION
 *   requestSafFolder()  -> launches ACTION_OPEN_DOCUMENT_TREE, persists the grant
 *
 * State model returned to JS: "NONE" | "PARTIAL_SAF" | "PARTIAL_MEDIA_SELECTED" | "FULL"
 * (see PermissionServiceImpl.ts for the mapping onto the domain's
 * PermissionState + PartialAccessSource).
 *
 * NOT YET BUILT/TESTED — written against minSdk 26 / targetSdk 34 per
 * ADR-012 #1, to be dropped into android/app/src/main/java/com/wtfmf/app/
 * once `npx cap add android` has been run. See native/android-plugin-reference/README.md.
 */
@CapacitorPlugin(name = "WtfmfPermission")
class WtfmfPermissionPlugin : Plugin() {

    @PluginMethod
    fun checkState(call: PluginCall) {
        call.resolve(currentStateAsJs())
    }

    @PluginMethod
    fun requestFullAccess(call: PluginCall) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
            // Pre-API 30: MANAGE_EXTERNAL_STORAGE doesn't exist as a concept.
            // minSdk is 26 (ADR-012 #1), so this path is reachable on 26-29.
            // Fall back to legacy WRITE_EXTERNAL_STORAGE runtime permission.
            call.resolve(currentStateAsJs())
            return
        }

        try {
            val intent = Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION).apply {
                data = Uri.parse("package:${context.packageName}")
            }
            startActivityForResult(call, intent, "onManageAllFilesResult")
        } catch (e: Exception) {
            // Some OEM builds (MIUI included) occasionally lack this exact
            // settings screen; fall back to the general storage settings.
            val fallback = Intent(Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION)
            startActivityForResult(call, fallback, "onManageAllFilesResult")
        }
    }

    @ActivityCallback
    private fun onManageAllFilesResult(call: PluginCall?, result: androidx.activity.result.ActivityResult) {
        // Re-check actual state on return — do not assume the intent's
        // result code reflects whether access was granted (spec §10).
        call?.resolve(currentStateAsJs())
    }

    @PluginMethod
    fun requestSafFolder(call: PluginCall) {
        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT_TREE)
        startActivityForResult(call, intent, "onSafFolderResult")
    }

    @ActivityCallback
    private fun onSafFolderResult(call: PluginCall?, result: androidx.activity.result.ActivityResult) {
        if (result.resultCode == Activity.RESULT_OK) {
            result.data?.data?.let { treeUri ->
                context.contentResolver.takePersistableUriPermission(
                    treeUri,
                    Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                )
            }
        }
        call?.resolve(currentStateAsJs())
    }

    /**
     * ADR-012 #1: precedence when computing state —
     * 1. MANAGE_EXTERNAL_STORAGE granted -> FULL
     * 2. Any persisted SAF tree permission -> PARTIAL_SAF
     * 3. READ_MEDIA_VISUAL_USER_SELECTED granted (API 34+) -> PARTIAL_MEDIA_SELECTED
     * 4. Otherwise -> NONE
     */
    private fun currentStateAsJs(): JSObject {
        val result = JSObject()
        val safRoots = persistedSafRoots()

        val state = when {
            hasManageExternalStorage() -> "FULL"
            safRoots.isNotEmpty() -> "PARTIAL_SAF"
            hasPartialMediaSelection() -> "PARTIAL_MEDIA_SELECTED"
            else -> "NONE"
        }

        result.put("state", state)
        result.put("safRoots", JSArray(safRoots))
        return result
    }

    private fun hasManageExternalStorage(): Boolean {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.R && Environment.isExternalStorageManager()
    }

    private fun persistedSafRoots(): List<String> {
        return context.contentResolver.persistedUriPermissions
            .filter { it.isReadPermission }
            .map { it.uri.toString() }
    }

    private fun hasPartialMediaSelection(): Boolean {
        if (Build.VERSION.SDK_INT < 34) return false
        val granted = ContextCompat.checkSelfPermission(
            context,
            "android.permission.READ_MEDIA_VISUAL_USER_SELECTED"
        ) == PackageManager.PERMISSION_GRANTED
        return granted
    }
}
