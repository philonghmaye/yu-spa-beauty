import UIKit
import Capacitor
import UserNotifications

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        UNUserNotificationCenter.current().delegate = self
        
        // Đăng ký push notifications sau khi Capacitor WebView đã load
        // Delay 3 giây để đảm bảo WebView và JavaScript đã sẵn sàng
        DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
            UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
                if granted {
                    DispatchQueue.main.async {
                        application.registerForRemoteNotifications()
                    }
                }
            }
        }
        
        return true
    }

    // APNs token received — save to multiple places for reliability
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        // Convert token to hex string
        let tokenString = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        
        // 1. Lưu vào UserDefaults (backup)
        UserDefaults.standard.set(tokenString, forKey: "apns_device_token")
        
        // 2. Forward to Capacitor plugin (standard way)
        NotificationCenter.default.post(
            name: .capacitorDidRegisterForRemoteNotifications,
            object: deviceToken
        )
        
        // 3. Inject directly into WebView localStorage (bypass plugin)
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            self.injectTokenToWebView(tokenString)
        }
    }

    // APNs registration failed
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("APNs registration failed: \(error.localizedDescription)")
        
        // Save error for debugging
        UserDefaults.standard.set(error.localizedDescription, forKey: "apns_registration_error")
        
        NotificationCenter.default.post(
            name: .capacitorDidFailToRegisterForRemoteNotifications,
            object: error
        )
    }
    
    // Inject token directly into WebView localStorage
    private func injectTokenToWebView(_ token: String) {
        guard let vc = window?.rootViewController as? CAPBridgeViewController,
              let webView = vc.bridge?.webView else {
            // WebView not ready, retry after 2 seconds
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                self.injectTokenToWebView(token)
            }
            return
        }
        
        let js = """
        (function() {
            localStorage.setItem('cached_push_token', '\(token)');
            console.log('Native injected push token: \(token.prefix(15))...');
            
            // Also try to send to server immediately
            fetch('/api/push-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: '\(token)', platform: 'ios' })
            }).then(function(r) {
                console.log('Push token sent to server:', r.status);
            }).catch(function(e) {
                console.log('Failed to send push token:', e);
            });
        })();
        """
        
        webView.evaluateJavaScript(js) { result, error in
            if let error = error {
                print("Failed to inject token to WebView: \(error)")
                // Retry after 3 seconds
                DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
                    self.injectTokenToWebView(token)
                }
            } else {
                print("Successfully injected push token to WebView")
            }
        }
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
    }

    func applicationWillTerminate(_ application: UIApplication) {
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}

// MARK: - UNUserNotificationCenterDelegate
extension AppDelegate: UNUserNotificationCenterDelegate {
    // Hiển thị notification khi app đang mở (foreground)
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .badge, .sound])
    }
}
