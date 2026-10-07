package com.wtfmf.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(WtfmfPermissionPlugin.class);
        registerPlugin(WtfmfScannerPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
