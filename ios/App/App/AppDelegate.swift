import UIKit
import Capacitor
import UserNotifications

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    private var diagnosticWindow: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // Save marker to prove this method ran
        UserDefaults.standard.set("YES_BUILD19_\(Date())", forKey: "appdelegate_did_launch")
        
        // Register for push IMMEDIATELY
        application.registerForRemoteNotifications()
        
        // Show diagnostic alert after 6 seconds using SEPARATE WINDOW
        DispatchQueue.main.asyncAfter(deadline: .now() + 6.0) { [weak self] in
            let isReg = application.isRegisteredForRemoteNotifications
            let token = UserDefaults.standard.string(forKey: "apns_token_native") ?? "CHƯA CÓ"
            let error = UserDefaults.standard.string(forKey: "apns_error_native") ?? "không"
            let launched = UserDefaults.standard.string(forKey: "appdelegate_did_launch") ?? "NO"
            let windowInfo = "self.window=\(self?.window != nil), rootVC=\(self?.window?.rootViewController != nil)"
            
            let msg = """
            didLaunch: \(launched.prefix(40))
            isRegistered: \(isReg)
            Token: \(token.prefix(30))
            Error: \(error)
            Window: \(windowInfo)
            """
            
            // Create SEPARATE window for alert - doesn't depend on Capacitor
            let alertWindow = UIWindow(frame: UIScreen.main.bounds)
            let vc = UIViewController()
            alertWindow.rootViewController = vc
            alertWindow.windowLevel = .alert + 1
            alertWindow.makeKeyAndVisible()
            self?.diagnosticWindow = alertWindow // Keep reference
            
            let alert = UIAlertController(title: "🔧 NATIVE BUILD 19", message: msg, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in
                self?.diagnosticWindow?.isHidden = true
                self?.diagnosticWindow = nil
            })
            vc.present(alert, animated: true)
        }

        return true
    }

    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        let token = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        UserDefaults.standard.set(token, forKey: "apns_token_native")
        UserDefaults.standard.removeObject(forKey: "apns_error_native")
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        let e = error as NSError
        UserDefaults.standard.set("[\(e.domain)] code=\(e.code): \(e.localizedDescription)", forKey: "apns_error_native")
        UserDefaults.standard.removeObject(forKey: "apns_token_native")
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}
