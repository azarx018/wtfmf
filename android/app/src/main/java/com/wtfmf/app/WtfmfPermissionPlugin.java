package com.wtfmf.app;

import android.app.Activity;
import android.content.Intent;
import android.content.UriPermission;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.Settings;
import androidx.activity.result.ActivityResult;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.ArrayList;
import java.util.List;

/**
 * WtfmfPermissionPlugin — ADR-012 #1 (RESOLVED).
 *
 * Mirrors src/lib/native/permissionPlugin.ts method-for-method:
 *   checkState()        -> passive read, safe to call every resume
 *   requestFullAccess()  -> launches ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION
 *   requestSafFolder()   -> launches ACTION_OPEN_DOCUMENT_TREE, persists the grant
 *
 * State model returned to JS: "NONE" | "PARTIAL_SAF" | "PARTIAL_MEDIA_SELECTED" | "FULL"
 * (see PermissionServiceImpl.ts for the mapping onto the domain's
 * PermissionState + PartialAccessSource).
 *
 * Written in Java, not Kotlin: this Capacitor-generated project has no
 * Kotlin Gradle plugin configured, so a .kt source file here would
 * silently never be compiled. See docs/adr/ADR-012-open-decisions.md
 * and the "Java, not Kotlin" note in native/android-plugin-reference/README.md.
 *
 * NOT YET BUILT — written against minSdk 26 / targetSdk 34 (ADR-012 #1).
 * Test on the actual device (Redmi 10, Android 14) before trusting the
 * permission precedence logic — OEM (MIUI/HyperOS) storage-permission
 * screens are known to deviate from stock AOSP behavior here.
 */
@CapacitorPlugin(name = "WtfmfPermission")
public class WtfmfPermissionPlugin extends Plugin {

    @PluginMethod
    public void checkState(PluginCall call) {
        call.resolve(currentStateAsJs());
    }

    @PluginMethod
    public void requestFullAccess(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
            // Pre-API 30: MANAGE_EXTERNAL_STORAGE doesn't exist as a concept.
            // minSdk is 26 (ADR-012 #1), so this path is reachable on 26-29.
            call.resolve(currentStateAsJs());
            return;
        }

        try {
            Intent intent = new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION);
            intent.setData(Uri.parse("package:" + getContext().getPackageName()));
            startActivityForResult(call, intent, "onManageAllFilesResult");
        } catch (Exception e) {
            // Some OEM builds (MIUI/HyperOS included) occasionally lack this
            // exact settings screen; fall back to the general one.
            Intent fallback = new Intent(Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION);
            startActivityForResult(call, fallback, "onManageAllFilesResult");
        }
    }

    @ActivityCallback
    private void onManageAllFilesResult(PluginCall call, ActivityResult result) {
        // Re-check actual state on return — do not assume the intent's
        // result code reflects whether access was granted (spec §10).
        if (call != null) {
            call.resolve(currentStateAsJs());
        }
    }

    @PluginMethod
    public void requestSafFolder(PluginCall call) {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
        startActivityForResult(call, intent, "onSafFolderResult");
    }

    @ActivityCallback
    private void onSafFolderResult(PluginCall call, ActivityResult result) {
        if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
            Uri treeUri = result.getData().getData();
            if (treeUri != null) {
                getContext()
                    .getContentResolver()
                    .takePersistableUriPermission(
                        treeUri,
                        Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                    );
            }
        }
        if (call != null) {
            call.resolve(currentStateAsJs());
        }
    }

    /**
     * ADR-012 #1: precedence when computing state —
     * 1. MANAGE_EXTERNAL_STORAGE granted -> FULL
     * 2. Any persisted SAF tree permission -> PARTIAL_SAF
     * 3. READ_MEDIA_VISUAL_USER_SELECTED granted (API 34+) -> PARTIAL_MEDIA_SELECTED
     * 4. Otherwise -> NONE
     */
    private JSObject currentStateAsJs() {
        JSObject result = new JSObject();
        List<String> safRoots = persistedSafRoots();

        String state;
        if (hasManageExternalStorage()) {
            state = "FULL";
        } else if (!safRoots.isEmpty()) {
            state = "PARTIAL_SAF";
        } else if (hasPartialMediaSelection()) {
            state = "PARTIAL_MEDIA_SELECTED";
        } else {
            state = "NONE";
        }

        result.put("state", state);
        result.put("safRoots", new JSArray(safRoots));
        return result;
    }

    private boolean hasManageExternalStorage() {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.R && Environment.isExternalStorageManager();
    }

    private List<String> persistedSafRoots() {
        List<String> roots = new ArrayList<>();
        for (UriPermission perm : getContext().getContentResolver().getPersistedUriPermissions()) {
            if (perm.isReadPermission()) {
                roots.add(perm.getUri().toString());
            }
        }
        return roots;
    }

    private boolean hasPartialMediaSelection() {
        if (Build.VERSION.SDK_INT < 34) return false;
        return ContextCompat.checkSelfPermission(getContext(), "android.permission.READ_MEDIA_VISUAL_USER_SELECTED")
            == PackageManager.PERMISSION_GRANTED;
    }
}
