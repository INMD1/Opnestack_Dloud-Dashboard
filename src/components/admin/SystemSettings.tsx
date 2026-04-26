"use client";

import { useState, useEffect } from "react";
import { toaster } from "@/components/ui/toaster";
import { Save, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Setting {
  key: string;
  value: any;
  hidden: boolean;
  restart_service: boolean;
}

const LIFECYCLE_SETTING_KEYS = [
  { key: "instance_lifecycle_enabled", label: "기능 활성화", type: "boolean" },
  { key: "instance_lifetime_days", label: "인스턴스 수명 (일)", type: "number" },
  {
    key: "instance_reply_deadline_days",
    label: "이메일 응답 기한 (일)",
    type: "number",
  },
  { key: "smtp_host", label: "SMTP 서버", type: "text" },
  { key: "smtp_port", label: "SMTP 포트", type: "number" },
  { key: "smtp_user", label: "SMTP 계정", type: "text" },
  {
    key: "smtp_password",
    label: "SMTP 비밀번호",
    type: "password",
    hidden: true,
  },
  { key: "smtp_use_tls", label: "TLS 사용", type: "boolean" },
  { key: "smtp_from_address", label: "발신 이메일", type: "email" },
];

export default function SystemSettings() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/settings");
      if (res.ok) {
        const data = await res.json();
        const settingsMap: Record<string, any> = {};
        data.settings.forEach((s: Setting) => {
          settingsMap[s.key] = s.value;
        });
        setSettings(settingsMap);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toaster.create({
        title: "오류",
        description: "설정을 불러오는 데 실패했습니다.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: string, value: any) => {
    // 비밀번호가 비어있으면 저장하지 않음 (서버가 빈 값으로 덮어쓰는 것 방지)
    if (key === "smtp_password" && !value) {
      return;
    }

    setSaving(key);
    try {
      const res = await fetch("/api/v1/setting", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });

      if (res.ok) {
        toaster.create({
          title: "성공",
          description: "설정이 저장되었습니다.",
          type: "success",
        });
        // 저장 후 상태 업데이트 (특히 비밀번호는 비움)
        if (key === "smtp_password") {
          setSettings((prev) => ({ ...prev, [key]: "" }));
        }
      } else {
        const err = await res.json();
        throw new Error(err.message || "저장 실패");
      }
    } catch (error: unknown) {
      toaster.create({
        title: "오류",
        description: error instanceof Error ? error.message : "저장에 실패했습니다.",
        type: "error",
      });
    } finally {
      setSaving(null);
    }
  };

  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  const lifecycleSettings = LIFECYCLE_SETTING_KEYS.filter(
    (k) => !k.key.startsWith("smtp_")
  );
  const smtpSettings = LIFECYCLE_SETTING_KEYS.filter((k) =>
    k.key.startsWith("smtp_")
  );

  return (
    <div className="space-y-6">
      <Card className="bg-[#0F1117] border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-cyan-400" />
            인스턴스 라이프사이클 설정
          </CardTitle>
          <CardDescription className="text-slate-400">
            인스턴스의 자동 삭제 및 연장 관련 정책을 설정합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {lifecycleSettings.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-800"
            >
              <div className="space-y-0.5">
                <Label className="text-base font-medium">{item.label}</Label>
                <p className="text-xs text-slate-500">{item.key}</p>
              </div>
              <div className="flex items-center gap-4">
                {item.type === "boolean" ? (
                  <Checkbox
                    checked={!!settings[item.key]}
                    onCheckedChange={(checked) => {
                      handleChange(item.key, !!checked);
                      handleSave(item.key, !!checked);
                    }}
                    disabled={saving === item.key}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      type={item.type}
                      value={settings[item.key] ?? ""}
                      onChange={(e) =>
                        handleChange(
                          item.key,
                          item.type === "number"
                            ? parseInt(e.target.value)
                            : e.target.value
                        )
                      }
                      className="w-32 bg-slate-950 border-slate-700 h-9"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSave(item.key, settings[item.key])}
                      disabled={saving === item.key}
                      className="bg-cyan-600 hover:bg-cyan-500 h-9"
                    >
                      {saving === item.key ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-[#0F1117] border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="w-5 h-5 text-cyan-400" />
            SMTP 설정 (이메일 발송)
          </CardTitle>
          <CardDescription className="text-slate-400">
            만료 안내 이메일 발송을 위한 SMTP 서버 정보를 설정합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {smtpSettings.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-800"
            >
              <div className="space-y-0.5">
                <Label className="text-base font-medium">{item.label}</Label>
                <p className="text-xs text-slate-500">{item.key}</p>
              </div>
              <div className="flex items-center gap-4">
                {item.type === "boolean" ? (
                  <Checkbox
                    checked={!!settings[item.key]}
                    onCheckedChange={(checked) => {
                      handleChange(item.key, !!checked);
                      handleSave(item.key, !!checked);
                    }}
                    disabled={saving === item.key}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      type={item.type}
                      placeholder={item.hidden ? "********" : ""}
                      value={item.hidden ? settings[item.key] || "" : settings[item.key] ?? ""}
                      onChange={(e) =>
                        handleChange(
                          item.key,
                          item.type === "number"
                            ? parseInt(e.target.value)
                            : e.target.value
                        )
                      }
                      className="w-64 bg-slate-950 border-slate-700 h-9"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSave(item.key, settings[item.key])}
                      disabled={saving === item.key}
                      className="bg-cyan-600 hover:bg-cyan-500 h-9"
                    >
                      {saving === item.key ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
