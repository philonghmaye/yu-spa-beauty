import UIKit
import WebKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    private var webViewRef: WKWebView?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        UserDefaults.standard.set("launched_\(Date())", forKey: "push_diag_launch")
        
        // Try injection at 3s, 8s, 15s, 25s
        for delay in [3.0, 8.0, 15.0, 25.0] {
            DispatchQueue.main.asyncAfter(deadline: .now() + delay) { [weak self] in
                self?.injectDiagnostics()
            }
        }
        return true
    }

    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        let token = deviceToken.map { String(format: "%02x", $0) }.joined()
        UserDefaults.standard.set(token, forKey: "push_diag_token")
        UserDefaults.standard.set("\(Date())", forKey: "push_diag_token_time")
        injectDiagnostics()
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        UserDefaults.standard.set(error.localizedDescription, forKey: "push_diag_error")
        UserDefaults.standard.set("\(Date())", forKey: "push_diag_error_time")
        injectDiagnostics()
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
    
    // MARK: - Diagnostics
    private func getWebView() -> WKWebView? {
        if let wv = webViewRef { return wv }
        
        // Method 1: CAPBridgeViewController
        if let bridgeVC = window?.rootViewController as? CAPBridgeViewController,
           let wv = bridgeVC.bridge?.webView {
            webViewRef = wv
            return wv
        }
        
        // Method 2: Recursive search
        if let rootView = window?.rootViewController?.view,
           let wv = findWebView(in: rootView) {
            webViewRef = wv
            return wv
        }
        
        // Method 3: Search all windows
        for w in UIApplication.shared.windows {
            if let wv = findWebView(in: w) {
                webViewRef = wv
                return wv
            }
        }
        
        return nil
    }
    
    private func injectDiagnostics() {
        let token = UserDefaults.standard.string(forKey: "push_diag_token") ?? ""
        let error = UserDefaults.standard.string(forKey: "push_diag_error") ?? ""
        let launch = UserDefaults.standard.string(forKey: "push_diag_launch") ?? ""
        let isReg = UIApplication.shared.isRegisteredForRemoteNotifications
        
        let safeError = error.replacingOccurrences(of: "'", with: "\\'").replacingOccurrences(of: "\n", with: " ")
        let safeLaunch = launch.replacingOccurrences(of: "'", with: "\\'")
        
        // Use localStorage instead of window variable (survives navigation)
        let json = "{ \"token\": \"\(token)\", \"error\": \"\(safeError)\", \"launch\": \"\(safeLaunch)\", \"isRegistered\": \(isReg), \"injectedAt\": \"\(Date())\" }"
        let js = "try { localStorage.setItem('__pushDiag', '\(json.replacingOccurrences(of: "'", with: "\\'"))'); } catch(e) {}"
        
        if let wv = getWebView() {
            wv.evaluateJavaScript(js, completionHandler: nil)
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
