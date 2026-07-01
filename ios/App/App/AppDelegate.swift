import UIKit
import Capacitor
import UserNotifications

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    
    // Lưu token để retry
    private var pendingToken: String?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        UNUserNotificationCenter.current().delegate = self
        
        // Xin quyền thông báo rồi đăng ký push
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, _ in
            guard granted else { return }
            DispatchQueue.main.async {
                application.registerForRemoteNotifications()
            }
        }
        
        return true
    }

    // ====== PUSH TOKEN RECEIVED ======
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        let tokenString = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        print("[PUSH] Token received: \(tokenString.prefix(20))...")
        
        // Lưu vào UserDefaults
        UserDefaults.standard.set(tokenString, forKey: "apns_device_token")
        UserDefaults.standard.removeObject(forKey: "apns_error")
        
        // Forward to Capacitor plugin
        NotificationCenter.default.post(
            name: .capacitorDidRegisterForRemoteNotifications,
            object: deviceToken
        )
        
        // GỌI TRỰC TIẾP API VERCEL (không cần WebView)
        sendTokenToServer(tokenString)
        
        // Inject vào WebView (backup)
        pendingToken = tokenString
        DispatchQueue.main.asyncAfter(deadline: .now() + 5.0) {
            self.injectTokenToWebView(tokenString)
        }
    }

    // ====== PUSH REGISTRATION FAILED ======
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        let errorMsg = error.localizedDescription
        print("[PUSH] Registration FAILED: \(errorMsg)")
        
        UserDefaults.standard.set(errorMsg, forKey: "apns_error")
        
        NotificationCenter.default.post(
            name: .capacitorDidFailToRegisterForRemoteNotifications,
            object: error
        )
        
        // Inject error vào WebView để debug button có thể đọc
        DispatchQueue.main.asyncAfter(deadline: .now() + 5.0) {
            self.injectErrorToWebView(errorMsg)
        }
    }
    
    // ====== GỌI TRỰC TIẾP API VERCEL BẰNG URLSESSION ======
    private func sendTokenToServer(_ token: String) {
        let urlString = "https://yuri-spa-beauty.vercel.app/api/push-token-native"
        guard let url = URL(string: urlString) else { return }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body: [String: String] = [
            "token": token,
            "bundleId": Bundle.main.bundleIdentifier ?? "com.yurispa.beauty",
            "platform": "ios"
        ]
        
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                print("[PUSH] Server error: \(error.localizedDescription)")
                // Retry sau 10 giây
                DispatchQueue.main.asyncAfter(deadline: .now() + 10.0) {
                    self.sendTokenToServer(token)
                }
                return
            }
            
            if let httpResponse = response as? HTTPURLResponse {
                print("[PUSH] Server responded: \(httpResponse.statusCode)")
                if let data = data, let body = String(data: data, encoding: .utf8) {
                    print("[PUSH] Server body: \(body)")
                }
                
                if httpResponse.statusCode == 200 {
                    UserDefaults.standard.set(true, forKey: "apns_token_sent")
                }
            }
        }.resume()
    }
    
    // ====== INJECT TOKEN VÀO WEBVIEW (BACKUP) ======
    private func injectTokenToWebView(_ token: String) {
        guard let vc = window?.rootViewController as? CAPBridgeViewController,
              let webView = vc.bridge?.webView else {
            // Retry sau 3 giây
            DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
                self.injectTokenToWebView(token)
            }
            return
        }
        
        let js = "localStorage.setItem('cached_push_token','\(token)');"
        webView.evaluateJavaScript(js) { _, error in
            if let error = error {
                print("[PUSH] WebView inject failed: \(error)")
            } else {
                print("[PUSH] WebView inject OK")
            }
        }
    }
    
    // ====== INJECT ERROR VÀO WEBVIEW ======
    private func injectErrorToWebView(_ error: String) {
        guard let vc = window?.rootViewController as? CAPBridgeViewController,
              let webView = vc.bridge?.webView else { return }
        
        let safeError = error.replacingOccurrences(of: "'", with: "\\'")
        let js = "localStorage.setItem('apns_native_error','\(safeError)');"
        webView.evaluateJavaScript(js, completionHandler: nil)
    }

    // ====== STANDARD DELEGATE METHODS ======
    
    func applicationDidBecomeActive(_ application: UIApplication) {
        // Retry token injection khi app quay lại foreground
        if let token = pendingToken ?? UserDefaults.standard.string(forKey: "apns_device_token") {
            injectTokenToWebView(token)
        }
    }

    func applicationDidEnterBackground(_ application: UIApplication) {}
    func applicationWillEnterForeground(_ application: UIApplication) {}
    func applicationWillTerminate(_ application: UIApplication) {}

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
}

// MARK: - UNUserNotificationCenterDelegate
extension AppDelegate: UNUserNotificationCenterDelegate {
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .badge, .sound])
    }
}
