import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Request notification permission first
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            print("[PUSH] Permission: granted=\(granted), error=\(error?.localizedDescription ?? "none")")
            if granted {
                DispatchQueue.main.async {
                    // Register for remote notifications on main thread
                    print("[PUSH] Calling registerForRemoteNotifications()")
                    application.registerForRemoteNotifications()
                }
            }
        }
        
        // Also check after delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 10.0) {
            let isRegistered = application.isRegisteredForRemoteNotifications
            print("[PUSH] After 10s: isRegisteredForRemoteNotifications = \(isRegistered)")
        }
        
        return true
    }

    // PUSH: Token received - forward to Capacitor
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        let token = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        print("[PUSH] TOKEN RECEIVED: \(token)")
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
    }

    // PUSH: Registration failed - forward to Capacitor
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("[PUSH] REGISTRATION FAILED: \(error.localizedDescription)")
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}
