import UIKit
import UserNotifications
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // Register for push notifications
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            if granted {
                DispatchQueue.main.async {
                    UIApplication.shared.registerForRemoteNotifications()
                }
            }
            self.sendDiagToServer(status: granted ? "AUTH_GRANTED" : "AUTH_DENIED", detail: error?.localizedDescription ?? "none", token: "")
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
    
    // Send token/status to server for push notification delivery
    private func sendDiagToServer(status: String, detail: String, token: String) {
        guard let url = URL(string: "https://yuri-spa-beauty.vercel.app/api/push-diag") else { return }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 15
        
        let body: [String: Any] = [
            "status": status,
            "detail": detail,
            "token": token,
            "isRegistered": UIApplication.shared.isRegisteredForRemoteNotifications,
            "bundleId": Bundle.main.bundleIdentifier ?? "unknown",
            "timestamp": ISO8601DateFormatter().string(from: Date()),
            "buildVersion": Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "unknown"
        ]
        
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        URLSession.shared.dataTask(with: request) { _, _, _ in }.resume()
    }
}
