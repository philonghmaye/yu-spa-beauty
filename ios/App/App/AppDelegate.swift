import UIKit
import Capacitor
import UserNotifications

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // TEST: Send a local notification to prove this code is running
        UNUserNotificationCenter.current().delegate = self
        
        let content = UNMutableNotificationContent()
        content.title = "🔧 AppDelegate TEST"
        content.body = "Native code IS running! Build 16. Time: \(Date())"
        content.sound = .default
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 3, repeats: false)
        let request = UNNotificationRequest(identifier: "test-\(Date().timeIntervalSince1970)", content: content, trigger: trigger)
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("[TEST] Local notification error: \(error)")
            } else {
                print("[TEST] Local notification scheduled!")
            }
        }
        
        // Register for push
        application.registerForRemoteNotifications()
        
        // Check after delays and inject to WebView
        DispatchQueue.main.asyncAfter(deadline: .now() + 5.0) {
            let status = application.isRegisteredForRemoteNotifications
            let msg = "isRegistered=\(status)"
            
            // Send another local notification with status
            let c2 = UNMutableNotificationContent()
            c2.title = "📊 Push Status (5s)"
            c2.body = msg
            c2.sound = .default
            let t2 = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
            let r2 = UNNotificationRequest(identifier: "status-5s", content: c2, trigger: t2)
            UNUserNotificationCenter.current().add(r2)
            
            // Try inject to WebView
            self.injectToWebView("NATIVE_5S: \(msg)")
        }
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 15.0) {
            let status = application.isRegisteredForRemoteNotifications
            self.injectToWebView("NATIVE_15S: isRegistered=\(status)")
        }

        return true
    }

    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        let token = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        
        // Local notification with token!
        let content = UNMutableNotificationContent()
        content.title = "✅ TOKEN RECEIVED!"
        content.body = "Token: \(token.prefix(30))..."
        content.sound = .default
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
        let request = UNNotificationRequest(identifier: "token-ok", content: content, trigger: trigger)
        UNUserNotificationCenter.current().add(request)
        
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
        self.injectToWebView("TOKEN_OK: \(token.prefix(30))")
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        let e = error as NSError
        
        // Local notification with error!
        let content = UNMutableNotificationContent()
        content.title = "❌ PUSH FAILED"
        content.body = "Error: \(e.localizedDescription)"
        content.sound = .default
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
        let request = UNNotificationRequest(identifier: "token-fail", content: content, trigger: trigger)
        UNUserNotificationCenter.current().add(request)
        
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
        self.injectToWebView("TOKEN_FAIL: \(e.localizedDescription)")
    }
    
    private func injectToWebView(_ msg: String) {
        DispatchQueue.main.async {
            guard let vc = self.window?.rootViewController as? CAPBridgeViewController,
                  let webView = vc.bridge?.webView else {
                print("[PUSH] WebView not ready for: \(msg)")
                return
            }
            
            let existing = "localStorage.getItem('native_push_logs') || ''"
            let safe = msg.replacingOccurrences(of: "'", with: "\\'").replacingOccurrences(of: "\n", with: "\\n")
            let js = "localStorage.setItem('native_push_logs', (\(existing)) + '\\n\(safe)');"
            webView.evaluateJavaScript(js, completionHandler: nil)
        }
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}

// Show notifications even when app is in foreground
extension AppDelegate: UNUserNotificationCenterDelegate {
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .badge, .sound])
    }
}
