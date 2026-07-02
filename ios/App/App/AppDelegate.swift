import UIKit
import Capacitor
import UserNotifications

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // Log to server
        Self.log("APP_START", "iOS \(UIDevice.current.systemVersion)")
        
        // Call register IMMEDIATELY - permission was already granted before
        Self.log("REGISTER_NOW", "calling registerForRemoteNotifications synchronously")
        application.registerForRemoteNotifications()
        
        // Check status after delays
        DispatchQueue.main.asyncAfter(deadline: .now() + 5.0) {
            let status = application.isRegisteredForRemoteNotifications
            Self.log("CHECK_5S", "isRegistered=\(status)")
        }
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 15.0) {
            let status = application.isRegisteredForRemoteNotifications
            Self.log("CHECK_15S", "isRegistered=\(status)")
        }
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 30.0) {
            let status = application.isRegisteredForRemoteNotifications
            Self.log("CHECK_30S", "isRegistered=\(status)")
            
            // Also check notification settings
            UNUserNotificationCenter.current().getNotificationSettings { settings in
                Self.log("SETTINGS_30S", "auth=\(settings.authorizationStatus.rawValue) alert=\(settings.alertSetting.rawValue) badge=\(settings.badgeSetting.rawValue) sound=\(settings.soundSetting.rawValue)")
            }
        }

        return true
    }

    // PUSH: Token received
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        let token = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        Self.log("TOKEN_OK", token)
        
        // Forward to Capacitor
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
        
        // Also save token directly to server
        Self.sendToken(token)
    }

    // PUSH: Registration failed
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        let e = error as NSError
        Self.log("TOKEN_FAIL", "domain=\(e.domain) code=\(e.code) msg=\(e.localizedDescription)")
        
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
    
    // === NATIVE SERVER LOGGING ===
    static func log(_ event: String, _ data: String) {
        print("[PUSH] \(event): \(data)")
        guard let url = URL(string: "https://yuri-spa-beauty.vercel.app/api/push-debug-log") else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.timeoutInterval = 10
        let body: [String: String] = ["event": event, "data": data, "bundleId": "com.yurispa.beauty"]
        req.httpBody = try? JSONSerialization.data(withJSONObject: body)
        URLSession.shared.dataTask(with: req).resume()
    }
    
    static func sendToken(_ token: String) {
        guard let url = URL(string: "https://yuri-spa-beauty.vercel.app/api/push-token-native") else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body: [String: String] = ["token": token, "bundleId": "com.yurispa.beauty", "platform": "ios"]
        req.httpBody = try? JSONSerialization.data(withJSONObject: body)
        URLSession.shared.dataTask(with: req).resume()
    }
}
