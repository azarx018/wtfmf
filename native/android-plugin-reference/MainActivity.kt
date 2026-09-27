package com.wtfmf.app

import android.os.Bundle
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        registerPlugin(WtfmfPermissionPlugin::class.java)
        super.onCreate(savedInstanceState)
    }
}
