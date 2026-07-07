import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // Register for push notifications directly from AppDelegate
        // This bypasses the Capacitor plugin entirely
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            DispatchQueue.main.async {
                if granted {
                    UIApplication.shared.registerForRemoteNotifications()
                    // Set timeout - if no response in 30s, report to server
                    DispatchQueue.main.asyncAfter(deadline: .now() + 30.0) {
                        if !UIApplication.shared.isRegisteredForRemoteNotifications {
                            self.sendDiagToServer(status: "TIMEOUT", detail: "30s no response from Apple", token: "")
                        }
                    }
                }
                self.sendDiagToServer(
                    status: granted ? "AUTH_GRANTED" : "AUTH_DENIED",
                    detail: error?.localizedDescription ?? "none",
                    token: ""
                )
            }
        }
        
        return true
    }

    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        let token = deviceToken.map { String(format: "%02x", $0) }.joined()
        sendDiagToServer(status: "TOKEN_RECEIVED", detail: "success", token: token)
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
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
        guard let url = URL(string: "https://yuri-spa-beauty.vercel.app/api/push-diag") else { return }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let isReg = UIApplication.shared.isRegisteredForRemoteNotifications
        let body: [String: Any] = [
            "status": status,
            "detail": detail,
            "token": token,
            "isRegistered": isReg,
            "bundleId": Bundle.main.bundleIdentifier ?? "unknown",
            "timestamp": ISO8601DateFormatter().string(from: Date()),
            "buildVersion": Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "unknown"
        ]
        
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        URLSession.shared.dataTask(with: request) { _, _, _ in
            // Fire and forget
        }.resume()
    }
}

import UserNotifications
