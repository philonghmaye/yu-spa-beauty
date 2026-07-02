import UIKit
import Capacitor
import UserNotifications

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    private var diagnosticWindow: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // Save marker to prove this method ran
        UserDefaults.standard.set("BUILD21_\(Date())", forKey: "appdelegate_did_launch")
        
        // Register for push IMMEDIATELY
        application.registerForRemoteNotifications()
        
        // Show diagnostic alert after 8 seconds using WINDOW SCENE
        DispatchQueue.main.asyncAfter(deadline: .now() + 8.0) { [weak self] in
            let isReg = application.isRegisteredForRemoteNotifications
            let token = UserDefaults.standard.string(forKey: "apns_token_native") ?? "CHƯA CÓ"
            let error = UserDefaults.standard.string(forKey: "apns_error_native") ?? "không"
            let launched = UserDefaults.standard.string(forKey: "appdelegate_did_launch") ?? "NO"
            
            let msg = """
            ✅ AppDelegate ĐANG CHẠY!
            
            didLaunch: \(launched.prefix(40))
            isRegistered: \(isReg)
            Token: \(token.prefix(30))
            Error: \(error)
            Build: 21
            """
            
            // iOS 13+: MUST use UIWindowScene
            var alertWindow: UIWindow?
            if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene {
                alertWindow = UIWindow(windowScene: windowScene)
            } else {
                alertWindow = UIWindow(frame: UIScreen.main.bounds)
            }
            
            guard let window = alertWindow else { return }
            let vc = UIViewController()
            window.rootViewController = vc
            window.windowLevel = .alert + 1
            window.makeKeyAndVisible()
            self?.diagnosticWindow = window
            
            let alert = UIAlertController(title: "🔧 NATIVE DIAGNOSTIC", message: msg, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in
                self?.diagnosticWindow?.isHidden = true
                self?.diagnosticWindow = nil
            })
            vc.present(alert, animated: true)
        }
        
        // Also inject into WebView localStorage after 12s
        DispatchQueue.main.asyncAfter(deadline: .now() + 12.0) { [weak self] in
            let isReg = application.isRegisteredForRemoteNotifications
            let token = UserDefaults.standard.string(forKey: "apns_token_native") ?? "NONE"
            let error = UserDefaults.standard.string(forKey: "apns_error_native") ?? "none"
            let log = "isRegistered=\(isReg)|token=\(token.prefix(30))|error=\(error)|build=21"
            
            // Try multiple ways to inject into WebView
            if let vc = self?.window?.rootViewController as? CAPBridgeViewController,
               let webView = vc.bridge?.webView {
                let safe = log.replacingOccurrences(of: "'", with: "\\'")
                webView.evaluateJavaScript("localStorage.setItem('native_push_logs', '\(safe)');", completionHandler: nil)
            } else if let vc = self?.window?.rootViewController,
                      let capVC = vc as? CAPBridgeViewController,
                      let webView = capVC.bridge?.webView {
                let safe = log.replacingOccurrences(of: "'", with: "\\'")
                webView.evaluateJavaScript("localStorage.setItem('native_push_logs', '\(safe)');", completionHandler: nil)
            }
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
