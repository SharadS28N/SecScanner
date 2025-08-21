"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Wifi, Shield, AlertTriangle, Signal } from "lucide-react"
import { cn } from "@/lib/utils"

interface NetworkData {
  ssid: string
  bssid: string
  signal: number
  suspicious: boolean
  confidence: number
}

interface NetworkCardProps {
  network: NetworkData
}

export function NetworkCard({ network }: NetworkCardProps) {
  const signalStrength = Math.abs(network.signal)
  const signalPercent = Math.max(0, Math.min(100, (100 - signalStrength) * 1.5))

  const getSignalColor = (strength: number) => {
    if (strength > 70) return "text-primary"
    if (strength > 40) return "text-yellow-500"
    return "text-destructive"
  }

  const getSignalBars = (strength: number) => {
    if (strength > 70) return 4
    if (strength > 50) return 3
    if (strength > 30) return 2
    return 1
  }

  return (
    <Card
      className={cn(
        "transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
        network.suspicious && "border-destructive/50 bg-destructive/5",
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-lg",
                network.suspicious ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
              )}
            >
              {network.suspicious ? <AlertTriangle className="h-6 w-6" /> : <Wifi className="h-6 w-6" />}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg">{network.ssid}</h3>
                <Badge variant={network.suspicious ? "destructive" : "secondary"} className="animate-pulse">
                  {network.suspicious ? "Suspicious" : "Normal"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">BSSID</p>
                  <p className="font-mono text-xs">{network.bssid}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-muted-foreground">Signal Strength</p>
                  <div className="flex items-center space-x-2">
                    <Signal className={cn("h-4 w-4", getSignalColor(signalPercent))} />
                    <span className="font-medium">{network.signal} dBm</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-muted-foreground">AI Confidence</p>
                  <div className="space-y-1">
                    <Progress value={network.confidence * 100} className="h-2" />
                    <span className="text-xs font-medium">{(network.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-1">
            <div className="flex space-x-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1 rounded-full transition-all duration-300",
                    i < getSignalBars(signalPercent)
                      ? getSignalColor(signalPercent).replace("text-", "bg-")
                      : "bg-muted",
                    i === 0 && "h-2",
                    i === 1 && "h-3",
                    i === 2 && "h-4",
                    i === 3 && "h-5",
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">Signal</span>
          </div>
        </div>

        {network.suspicious && (
          <div className="mt-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 text-destructive mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-destructive">Security Alert</p>
                <p className="text-muted-foreground">
                  This network shows suspicious behavior patterns that may indicate an evil twin attack. Avoid
                  connecting to this network.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
