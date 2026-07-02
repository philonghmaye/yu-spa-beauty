import Foundation
import Capacitor
import UIKit

@objc(PushDiagPlugin)
public class PushDiagPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "PushDiagPlugin"
    public let jsName = "PushDiag"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "diagnose", returnType: CAPPluginReturnPromise)
    ]
    
    @objc func diagnose(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let app = UIApplication.shared
            let isReg = app.isRegisteredForRemoteNotifications
            
            // Force register
            app.registerForRemoteNotifications()
            
            // Check after 5 seconds
            DispatchQueue.main.asyncAfter(deadline: .now() + 5.0) {
                let isRegAfter = app.isRegisteredForRemoteNotifications
                
                UNUserNotificationCenter.current().getNotificationSettings { settings in
                    call.resolve([
                        "isRegisteredBefore": isReg,
                        "isRegisteredAfter": isRegAfter,
                        "authorizationStatus": "\(settings.authorizationStatus.rawValue)",
                        "alertSetting": "\(settings.alertSetting.rawValue)",
                        "soundSetting": "\(settings.soundSetting.rawValue)",
                        "badgeSetting": "\(settings.badgeSetting.rawValue)",
                        "notificationCenterSetting": "\(settings.notificationCenterSetting.rawValue)",
                        "lockScreenSetting": "\(settings.lockScreenSetting.rawValue)",
                        "bundleId": Bundle.main.bundleIdentifier ?? "unknown",
                        "apsEnvironment": Bundle.main.infoDictionary?["aps-environment"] as? String ?? "not-in-info",
                        "pluginLoaded": true
                    ])
                }
            }
        }
    }
}
