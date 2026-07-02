import UIKit
import Capacitor
import UserNotifications

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    private var nativeLogs: [String] = []
    
    private func addLog(_ msg: String) {
        let time = DateFormatter.localizedString(from: Date(), dateStyle: .none, timeStyle: .medium)
        let entry = "[\(time)] \(msg)"
        nativeLogs.append(entry)
        print("[PUSH-NATIVE] \(entry)")
    }

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        addLog("APP_START iOS \(UIDevice.current.systemVersion)")
        
        // Call register IMMEDIATELY
        addLog("REGISTER_NOW calling registerForRemoteNotifications")
        application.registerForRemoteNotifications()
        addLog("REGISTER_CALLED done")
        
        // Check status after delays and inject into WebView
        DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
            let status = application.isRegisteredForRemoteNotifications
            self.addLog("CHECK_3S isRegistered=\(status)")
        }
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 8.0) {
            let status = application.isRegisteredForRemoteNotifications
            self.addLog("CHECK_8S isRegistered=\(status)")
            // Inject all logs into WebView
            self.injectLogsToWebView()
        }
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 20.0) {
            let status = application.isRegisteredForRemoteNotifications
            self.addLog("CHECK_20S isRegistered=\(status)")
            
            UNUserNotificationCenter.current().getNotificationSettings { settings in
                self.addLog("SETTINGS auth=\(settings.authorizationStatus.rawValue)")
                self.injectLogsToWebView()
            }
        }

        return true
    }

    // PUSH: Token received
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        let token = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        addLog("TOKEN_OK \(token.prefix(30))")
        
        // Forward to Capacitor
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
        
        // Save to UserDefaults
        UserDefaults.standard.set(token, forKey: "apns_token_native")
        
        // Inject into WebView
        injectLogsToWebView()
    }

    // PUSH: Registration failed
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        let e = error as NSError
        addLog("TOKEN_FAIL domain=\(e.domain) code=\(e.code) msg=\(e.localizedDescription)")
        
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
        
        UserDefaults.standard.set(e.localizedDescription, forKey: "apns_error_native")
        
        injectLogsToWebView()
    }
    
    // Inject native logs into WebView localStorage
    private func injectLogsToWebView() {
        DispatchQueue.main.async {
            guard let vc = self.window?.rootViewController as? CAPBridgeViewController,
                  let webView = vc.bridge?.webView else {
                self.addLog("WEBVIEW_NOT_READY")
                return
            }
            
            let logsStr = self.nativeLogs.joined(separator: "\\n")
            let escapedLogs = logsStr.replacingOccurrences(of: "'", with: "\\'")
            let js = "localStorage.setItem('native_push_logs', '\(escapedLogs)');"
            webView.evaluateJavaScript(js) { _, error in
                if let error = error {
                    print("[PUSH-NATIVE] inject error: \(error)")
                }
            }
        }
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}
