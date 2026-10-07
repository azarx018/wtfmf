package com.wtfmf.app;

import android.content.UriPermission;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.webkit.MimeTypeMap;
import androidx.documentfile.provider.DocumentFile;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * WtfmfScannerPlugin — Storage Analyzer, Pass 1 (metadata only).
 *
 * Mirrors src/lib/native/scannerPlugin.ts. Walks whichever storage root(s)
 * the app currently has access to (MANAGE_EXTERNAL_STORAGE root, and/or
 * any SAF-granted folder trees — same precedence sources as
 * WtfmfPermissionPlugin) and emits batches of file metadata as events,
 * rather than returning one giant result, so the UI can show progress on
 * a 10k+ file device without blocking (spec §16/§24).
 *
 * Deliberately does NOT compute hashes, read image/video metadata, or do
 * anything beyond basic java.io.File / DocumentFile stat info — that's
 * later passes (spec §16 Pass 3/4), not this one.
 *
 * NOT YET BUILT/TESTED — written in Java (not Kotlin — see ADR-012 /
 * native/android-plugin-reference/README.md for why), against minSdk 26 /
 * targetSdk 34. The MANAGE_EXTERNAL_STORAGE root walk is the realistic
 * path for a full-access grant; the SAF walk is exercised less so far and
 * is the more likely place for a first bug.
 */
@CapacitorPlugin(name = "WtfmfScanner")
public class WtfmfScannerPlugin extends Plugin {

    private static final int BATCH_SIZE = 200;

    private final AtomicBoolean cancelRequested = new AtomicBoolean(false);
    private volatile boolean scanRunning = false;

    @PluginMethod
    public void startScan(PluginCall call) {
        if (scanRunning) {
            call.reject("A scan is already running");
            return;
        }
        scanRunning = true;
        cancelRequested.set(false);

        JSObject result = new JSObject();
        result.put("started", true);
        call.resolve(result);

        // Run off Capacitor's own call thread pool — a 10k+ file recursive
        // walk has no business sharing that pool with other plugin calls.
        new Thread(this::runScan, "wtfmf-scanner").start();
    }

    @PluginMethod
    public void cancelScan(PluginCall call) {
        cancelRequested.set(true);
        JSObject result = new JSObject();
        result.put("cancelled", true);
        call.resolve(result);
    }

    private void runScan() {
        List<JSObject> batch = new ArrayList<>();
        int[] processed = { 0 };
        try {
            for (File root : getFullStorageRoots()) {
                walkFileTree(root, batch, processed);
                if (cancelRequested.get()) break;
            }

            if (!cancelRequested.get()) {
                for (Uri treeUri : getSafTreeRoots()) {
                    walkDocumentTree(treeUri, batch, processed);
                    if (cancelRequested.get()) break;
                }
            }

            if (!batch.isEmpty()) {
                flushBatch(batch, processed[0], null);
            }

            JSObject complete = new JSObject();
            complete.put("filesProcessed", processed[0]);
            complete.put("cancelled", cancelRequested.get());
            notifyListeners("scanComplete", complete);
        } catch (Exception e) {
            JSObject error = new JSObject();
            error.put("message", e.getMessage() != null ? e.getMessage() : e.toString());
            notifyListeners("scanError", error);
        } finally {
            scanRunning = false;
        }
    }

    private List<File> getFullStorageRoots() {
        List<File> roots = new ArrayList<>();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R && Environment.isExternalStorageManager()) {
            File external = Environment.getExternalStorageDirectory();
            if (external != null) {
                roots.add(external);
            }
        }
        return roots;
    }

    private List<Uri> getSafTreeRoots() {
        List<Uri> roots = new ArrayList<>();
        for (UriPermission perm : getContext().getContentResolver().getPersistedUriPermissions()) {
            if (perm.isReadPermission()) {
                roots.add(perm.getUri());
            }
        }
        return roots;
    }

    private void walkFileTree(File dir, List<JSObject> batch, int[] processed) {
        if (cancelRequested.get() || dir == null) return;
        File[] children = dir.listFiles();
        if (children == null) return; // unreadable dir — skip, don't fail the whole scan

        for (File child : children) {
            if (cancelRequested.get()) return;

            // Not a full "protected areas" implementation (spec §12) —
            // just skipping the one directory guaranteed to be noise
            // (other apps' private sandboxes) for this first pass.
            if (child.isDirectory() && "Android".equals(child.getName()) && dir.equals(Environment.getExternalStorageDirectory())) {
                continue;
            }

            batch.add(toJsEntry(child));
            processed[0]++;

            if (batch.size() >= BATCH_SIZE) {
                flushBatch(batch, processed[0], child.getAbsolutePath());
            }

            if (child.isDirectory()) {
                walkFileTree(child, batch, processed);
            }
        }
    }

    private void walkDocumentTree(Uri treeUri, List<JSObject> batch, int[] processed) {
        DocumentFile dir = DocumentFile.fromTreeUri(getContext(), treeUri);
        if (dir != null) {
            walkDocumentFile(dir, batch, processed);
        }
    }

    private void walkDocumentFile(DocumentFile dir, List<JSObject> batch, int[] processed) {
        if (cancelRequested.get()) return;
        DocumentFile[] children = dir.listFiles();

        for (DocumentFile child : children) {
            if (cancelRequested.get()) return;

            batch.add(toJsEntry(child));
            processed[0]++;

            if (batch.size() >= BATCH_SIZE) {
                flushBatch(batch, processed[0], child.getUri().toString());
            }

            if (child.isDirectory()) {
                walkDocumentFile(child, batch, processed);
            }
        }
    }

    private JSObject toJsEntry(File file) {
        JSObject entry = new JSObject();
        String name = file.getName();
        String extension = extensionOf(name);
        entry.put("uri", Uri.fromFile(file).toString());
        entry.put("path", file.getAbsolutePath());
        entry.put("name", name);
        entry.put("extension", extension);
        entry.put("mimeType", mimeTypeFor(extension));
        entry.put("size", file.isDirectory() ? 0 : file.length());
        entry.put("modifiedAt", file.lastModified());
        entry.put("isDirectory", file.isDirectory());
        return entry;
    }

    private JSObject toJsEntry(DocumentFile file) {
        JSObject entry = new JSObject();
        String name = file.getName() != null ? file.getName() : "";
        String extension = extensionOf(name);
        String mime = file.getType();
        entry.put("uri", file.getUri().toString());
        entry.put("path", file.getUri().toString()); // SAF has no real filesystem path
        entry.put("name", name);
        entry.put("extension", extension);
        entry.put("mimeType", mime != null ? mime : mimeTypeFor(extension));
        entry.put("size", file.isDirectory() ? 0 : file.length());
        entry.put("modifiedAt", file.lastModified());
        entry.put("isDirectory", file.isDirectory());
        return entry;
    }

    private String extensionOf(String name) {
        if (name == null) return null;
        int dot = name.lastIndexOf('.');
        if (dot <= 0 || dot == name.length() - 1) return null;
        return name.substring(dot + 1).toLowerCase();
    }

    private String mimeTypeFor(String extension) {
        if (extension == null) return null;
        return MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension);
    }

    private void flushBatch(List<JSObject> batch, int processedCount, String currentPath) {
        JSArray filesArray = new JSArray();
        for (JSObject entry : batch) {
            filesArray.put(entry);
        }

        JSObject event = new JSObject();
        event.put("files", filesArray);
        event.put("filesProcessed", processedCount);
        event.put("currentPath", currentPath);
        notifyListeners("scanBatch", event);
        batch.clear();
    }
}
