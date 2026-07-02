import UIKit
import Capacitor
import UserNotifications
import WebKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // Save marker
        UserDefaults.standard.set("B22_\(Date())", forKey: "appdelegate_did_launch")
        
        // Register for push
        application.registerForRemoteNotifications()
        
        // After 10s: find WKWebView by traversing ALL views and inject status
        DispatchQueue.main.asyncAfter(deadline: .now() + 10.0) {
            let isReg = application.isRegisteredForRemoteNotifications
            let token = UserDefaults.standard.string(forKey: "apns_token_native") ?? "NONE"
            let error = UserDefaults.standard.string(forKey: "apns_error_native") ?? "none"
            let launched = UserDefaults.standard.string(forKey: "appdelegate_did_launch") ?? "NO"
            let windowCount = UIApplication.shared.windows.count
            
            let status = "launched=\(launched.prefix(20))|isReg=\(isReg)|token=\(token.prefix(20))|error=\(error)|windows=\(windowCount)"
            
            // Find WKWebView by traversing ALL windows and ALL views
            var found = false
            for w in UIApplication.shared.windows {
                if let webView = self.findWKWebView(in: w) {
                    let safe = status.replacingOccurrences(of: "'", with: "\\'")
                    webView.evaluateJavaScript("localStorage.setItem('native_push_logs', '\(safe)'); window.__NATIVE_OK = true;") { _, err in
                        if let err = err {
                            print("[NATIVE] JS inject error: \(err)")
                        } else {
                            print("[NATIVE] JS inject SUCCESS")
                        }
                    }
                    found = true
                    break
                }
            }
            
            if !found {
                print("[NATIVE] No WKWebView found in \(windowCount) windows!")
            }
        }

        return true
    }
    
    // Recursively find WKWebView in view hierarchy
    private func findWKWebView(in view: UIView) -> WKWebView? {
        if let webView = view as? WKWebView { return webView }
        for subview in view.subviews {
            if let found = findWKWebView(in: subview) { return found }
        }
        return nil
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
