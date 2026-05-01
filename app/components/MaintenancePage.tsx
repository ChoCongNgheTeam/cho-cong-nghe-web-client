"use client";

import { Construction, Clock, Mail, Phone } from "lucide-react";
import { useGeneralSettings } from "@/hooks/useGeneralSettings";

export default function MaintenancePage() {
  const { settings } = useGeneralSettings();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo */}
        {settings.logo_url && (
          <div className="flex justify-center">
            <img src={settings.logo_url} alt={settings.site_name || "Logo"} className="h-14 w-auto object-contain opacity-90" />
          </div>
        )}

        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Construction className="w-10 h-10 text-blue-400" />
            </div>
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full border border-blue-400/30 animate-ping" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-white">Đang bảo trì hệ thống</h1>
          <p className="text-slate-400 text-sm leading-relaxed">{settings.maintenance_message || "Hệ thống đang được nâng cấp. Vui lòng quay lại sau."}</p>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* Contact */}
        {(settings.site_email || settings.site_phone) && (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 uppercase tracking-widest">Liên hệ hỗ trợ</p>
            <div className="flex flex-col items-center gap-2">
              {settings.site_email && (
                <a href={`mailto:${settings.site_email}`} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-colors">
                  <Mail className="w-4 h-4" />
                  {settings.site_email}
                </a>
              )}
              {settings.site_phone && (
                <a href={`tel:${settings.site_phone}`} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-colors">
                  <Phone className="w-4 h-4" />
                  {settings.site_phone}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} {settings.site_name || "My Shop"}
        </p>
      </div>
    </div>
  );
}
