import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Save launch state to UserDefaults for diagnostics
        UserDefaults.standard.set("launched_\(Date())", forKey: "push_diag_launch")
        
        // After 10 seconds, inject push diagnostic state into WebView
        DispatchQueue.main.asyncAfter(deadline: .now() + 10.0) {
            self.injectDiagnostics()
        }
        return true
    }

    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        let token = deviceToken.map { String(format: "%02x", $0) }.joined()
        UserDefaults.standard.set(token, forKey: "push_diag_token")
        UserDefaults.standard.set("\(Date())", forKey: "push_diag_token_time")
        
        // Inject into WebView immediately
        injectDiagnostics()
        
        // Forward to Capacitor
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        UserDefaults.standard.set(error.localizedDescription, forKey: "push_diag_error")
        UserDefaults.standard.set("\(Date())", forKey: "push_diag_error_time")
        
        // Inject into WebView immediately
        injectDiagnostics()
        
        // Forward to Capacitor
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
    
    // MARK: - Diagnostics
    private func injectDiagnostics() {
        let token = UserDefaults.standard.string(forKey: "push_diag_token") ?? ""
        let error = UserDefaults.standard.string(forKey: "push_diag_error") ?? ""
        let tokenTime = UserDefaults.standard.string(forKey: "push_diag_token_time") ?? ""
        let errorTime = UserDefaults.standard.string(forKey: "push_diag_error_time") ?? ""
        let launch = UserDefaults.standard.string(forKey: "push_diag_launch") ?? ""
        let isReg = UIApplication.shared.isRegisteredForRemoteNotifications
        
        let js = """
        window.__pushDiag = {
            token: '\(token)',
            error: '\(error.replacingOccurrences(of: "'", with: "\\'"))',
            tokenTime: '\(tokenTime)',
            errorTime: '\(errorTime)',
            launch: '\(launch.replacingOccurrences(of: "'", with: "\\'"))',
            isRegistered: \(isReg),
            injectedAt: '\(Date())'
        };
        """
        
        // Try to find WKWebView through CAPBridgeViewController
        if let rootVC = window?.rootViewController {
            findWebView(in: rootVC.view)?.evaluateJavaScript(js, completionHandler: nil)
        }
    }
    
    private func findWebView(in view: UIView) -> WKWebView? {
        if let wk = view as? WKWebView { return wk }
        for sub in view.subviews {
            if let found = findWebView(in: sub) { return found }
        }
        return nil
    }
}

import WebKit
