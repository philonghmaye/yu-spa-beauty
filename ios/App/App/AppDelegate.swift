import UIKit
import Capacitor
import UserNotifications

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // Register for push IMMEDIATELY
        application.registerForRemoteNotifications()
        
        // Show native alert after 6 seconds (window will be ready)
        DispatchQueue.main.asyncAfter(deadline: .now() + 6.0) {
            let isReg = application.isRegisteredForRemoteNotifications
            let token = UserDefaults.standard.string(forKey: "apns_token_native") ?? "CHƯA CÓ"
            let error = UserDefaults.standard.string(forKey: "apns_error_native") ?? "không"
            
            let msg = """
            ✅ AppDelegate code ĐANG CHẠY!
            
            isRegistered: \(isReg)
            Token: \(token.prefix(30))
            Error: \(error)
            
            (Build 18)
            """
            
            let alert = UIAlertController(title: "🔧 NATIVE DIAGNOSTIC", message: msg, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "OK", style: .default))
            self.window?.rootViewController?.present(alert, animated: true)
        }
        
        // Check again at 20s with more info
        DispatchQueue.main.asyncAfter(deadline: .now() + 20.0) {
            let isReg = application.isRegisteredForRemoteNotifications
            let token = UserDefaults.standard.string(forKey: "apns_token_native") ?? "CHƯA CÓ"
            let error = UserDefaults.standard.string(forKey: "apns_error_native") ?? "không"
            
            // Inject into WebView
            if let vc = self.window?.rootViewController as? CAPBridgeViewController,
               let webView = vc.bridge?.webView {
                let log = "isRegistered=\(isReg)|token=\(token.prefix(30))|error=\(error)"
                let safe = log.replacingOccurrences(of: "'", with: "\\'")
                webView.evaluateJavaScript("localStorage.setItem('native_push_logs', '\(safe)');", completionHandler: nil)
            }
        }

        return true
    }

    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        let token = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        
        // Save to UserDefaults FIRST
        UserDefaults.standard.set(token, forKey: "apns_token_native")
        UserDefaults.standard.removeObject(forKey: "apns_error_native")
        
        // Forward to Capacitor
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        let e = error as NSError
        
        // Save error to UserDefaults
        UserDefaults.standard.set("[\(e.domain)] code=\(e.code): \(e.localizedDescription)", forKey: "apns_error_native")
        UserDefaults.standard.removeObject(forKey: "apns_token_native")
        
        // Forward to Capacitor
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}
