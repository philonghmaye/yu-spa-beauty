import UIKit
import UserNotifications
import Capacitor

// MARKER: This string MUST appear in the compiled binary
private let PUSH_DIAG_MARKER = "YURISPA_PUSHDIAG_V32_ACTIVE"

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // Log marker to prove this code executes
        NSLog("🚀 %@", PUSH_DIAG_MARKER)
        
        // Register for push notifications directly from AppDelegate
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            NSLog("🔔 Push auth result: granted=%d error=%@", granted ? 1 : 0, error?.localizedDescription ?? "none")
            
            self.sendDiagToServer(status: granted ? "AUTH_GRANTED" : "AUTH_DENIED", detail: error?.localizedDescription ?? "none", token: "")
            
            if granted {
                DispatchQueue.main.async {
                    NSLog("🔔 Calling registerForRemoteNotifications...")
                    UIApplication.shared.registerForRemoteNotifications()
                }
                
                // Timeout check after 30s
                DispatchQueue.main.asyncAfter(deadline: .now() + 30.0) {
                    let isReg = UIApplication.shared.isRegisteredForRemoteNotifications
                    NSLog("🔔 30s check: isRegistered=%d", isReg ? 1 : 0)
                    self.sendDiagToServer(status: "TIMEOUT_CHECK", detail: "isRegistered=\(isReg)", token: "")
                }
            }
        }
        
        return true
    }

    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        let token = deviceToken.map { String(format: "%02x", $0) }.joined()
        NSLog("🔔 ✅ Got push token: %@", token.prefix(20) + "...")
        sendDiagToServer(status: "TOKEN_RECEIVED", detail: "success", token: token)
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        NSLog("🔔 ❌ Push registration failed: %@", error.localizedDescription)
        sendDiagToServer(status: "REGISTRATION_FAILED", detail: error.localizedDescription, token: "")
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
    
    // MARK: - Send diagnostic data to server via HTTP
    private func sendDiagToServer(status: String, detail: String, token: String) {
        let urlString = "https://yuri-spa-beauty.vercel.app/api/push-diag"
        guard let url = URL(string: urlString) else {
            NSLog("🔔 ❌ Invalid URL: %@", urlString)
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 15
        
        let isReg = UIApplication.shared.isRegisteredForRemoteNotifications
        let body: [String: Any] = [
            "status": status,
            "detail": detail,
            "token": token,
            "isRegistered": isReg,
            "bundleId": Bundle.main.bundleIdentifier ?? "unknown",
            "timestamp": ISO8601DateFormatter().string(from: Date()),
            "buildVersion": Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "unknown",
            "marker": PUSH_DIAG_MARKER
        ]
        
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        NSLog("🔔 Sending diag to server: status=%@ detail=%@", status, detail)
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                NSLog("🔔 ❌ HTTP error: %@", error.localizedDescription)
            } else if let httpResponse = response as? HTTPURLResponse {
                NSLog("🔔 ✅ HTTP response: %d", httpResponse.statusCode)
            }
        }.resume()
    }
}
