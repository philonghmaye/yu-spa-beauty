import UIKit
import Capacitor
import UserNotifications

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    private let serverBase = "https://yuri-spa-beauty.vercel.app"
    private let bundleId = "com.yurispa.beauty"

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        UNUserNotificationCenter.current().delegate = self
        
        // LOG: App started
        sendDebugLog("APP_LAUNCHED", data: "iOS \(UIDevice.current.systemVersion), model \(UIDevice.current.model)")
        
        // Bước 1: Gọi registerForRemoteNotifications NGAY LẬP TỨC (không chờ gì)
        sendDebugLog("REGISTER_CALLED", data: "Calling registerForRemoteNotifications now")
        application.registerForRemoteNotifications()
        
        // Bước 2: Cũng xin quyền hiển thị notification (song song)
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            self.sendDebugLog("AUTH_RESULT", data: "granted=\(granted), error=\(error?.localizedDescription ?? "none")")
        }
        
        // Bước 3: Kiểm tra trạng thái notification settings
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            self.sendDebugLog("SETTINGS", data: "authStatus=\(settings.authorizationStatus.rawValue), alertSetting=\(settings.alertSetting.rawValue)")
        }
        
        return true
    }

    // ====== TOKEN NHẬN ĐƯỢC ======
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        let tokenString = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        
        sendDebugLog("TOKEN_RECEIVED", data: tokenString)
        
        // Lưu UserDefaults
        UserDefaults.standard.set(tokenString, forKey: "apns_device_token")
        
        // Forward to Capacitor
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
        
        // Gửi token lên server
        sendTokenToServer(tokenString)
        
        // Inject vào WebView
        DispatchQueue.main.asyncAfter(deadline: .now() + 5.0) {
            self.injectTokenToWebView(tokenString)
        }
    }

    // ====== ĐĂNG KÝ THẤT BẠI ======
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        let nsError = error as NSError
        let errorDetail = "domain=\(nsError.domain), code=\(nsError.code), msg=\(nsError.localizedDescription)"
        
        sendDebugLog("REGISTER_FAILED", data: errorDetail)
        
        UserDefaults.standard.set(errorDetail, forKey: "apns_error")
        
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
        
        // Inject error vào WebView
        DispatchQueue.main.asyncAfter(deadline: .now() + 5.0) {
            self.injectErrorToWebView(nsError.localizedDescription)
        }
    }
    
    // ====== GHI LOG LÊN SERVER ======
    private func sendDebugLog(_ event: String, data: String) {
        print("[PUSH-DEBUG] \(event): \(data)")
        
        guard let url = URL(string: "\(serverBase)/api/push-debug-log") else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 10
        
        let body: [String: String] = ["event": event, "data": data, "bundleId": bundleId]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        URLSession.shared.dataTask(with: request) { _, response, error in
            if let error = error {
                print("[PUSH-DEBUG] Log send failed: \(error.localizedDescription)")
            } else if let http = response as? HTTPURLResponse {
                print("[PUSH-DEBUG] Log sent: \(http.statusCode)")
            }
        }.resume()
    }
    
    // ====== GỬI TOKEN LÊN SERVER ======
    private func sendTokenToServer(_ token: String) {
        guard let url = URL(string: "\(serverBase)/api/push-token-native") else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body: [String: String] = ["token": token, "bundleId": bundleId, "platform": "ios"]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                self.sendDebugLog("TOKEN_SEND_FAILED", data: error.localizedDescription)
                // Retry
                DispatchQueue.main.asyncAfter(deadline: .now() + 10.0) {
                    self.sendTokenToServer(token)
                }
            } else if let http = response as? HTTPURLResponse {
                self.sendDebugLog("TOKEN_SEND_OK", data: "status=\(http.statusCode)")
            }
        }.resume()
    }
    
    // ====== INJECT VÀO WEBVIEW ======
    private func injectTokenToWebView(_ token: String) {
        guard let vc = window?.rootViewController as? CAPBridgeViewController,
              let webView = vc.bridge?.webView else {
            sendDebugLog("WEBVIEW_NOT_READY", data: "retrying in 3s")
            DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
                self.injectTokenToWebView(token)
            }
            return
        }
        
        let js = "localStorage.setItem('cached_push_token','\(token)');"
        webView.evaluateJavaScript(js) { _, error in
            if let error = error {
                self.sendDebugLog("WEBVIEW_INJECT_FAIL", data: "\(error)")
            } else {
                self.sendDebugLog("WEBVIEW_INJECT_OK", data: "token saved to localStorage")
            }
        }
    }
    
    private func injectErrorToWebView(_ error: String) {
        guard let vc = window?.rootViewController as? CAPBridgeViewController,
              let webView = vc.bridge?.webView else { return }
        let safeError = error.replacingOccurrences(of: "'", with: "\\'")
        webView.evaluateJavaScript("localStorage.setItem('apns_native_error','\(safeError)');", completionHandler: nil)
    }

    // ====== STANDARD DELEGATES ======
    func applicationDidBecomeActive(_ application: UIApplication) {
        if let token = UserDefaults.standard.string(forKey: "apns_device_token") {
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
