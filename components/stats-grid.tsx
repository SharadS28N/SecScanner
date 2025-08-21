"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wifi, Shield, Signal, Activity } from "lucide-react"

interface ScanStats {
  totalNetworks: number
  suspiciousCount: number
  avgSignal: number
  avgBssidCount: number
}

interface StatsGridProps {
  stats: ScanStats
}

export function StatsGrid({ stats }: StatsGridProps) {
  const threatLevel = stats.suspiciousCount === 0 ? "Low" : stats.suspiciousCount <= 2 ? "Medium" : "High"

  const threatColor = threatLevel === "Low" ? "secondary" : threatLevel === "Medium" ? "default" : "destructive"

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Networks</CardTitle>
          <Wifi className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{stats.totalNetworks}</div>
          <p className="text-xs text-muted-foreground">Networks detected</p>
        </CardContent>
      </Card>

      <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Threat Level</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold">{stats.suspiciousCount}</div>
            <Badge variant={threatColor} className="animate-pulse">
              {threatLevel}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">Suspicious networks</p>
        </CardContent>
      </Card>

      <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Signal</CardTitle>
          <Signal className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-chart-2">
            {typeof stats.avgSignal === "number" ? stats.avgSignal.toFixed(1) + " dBm" : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">Average strength</p>
        </CardContent>
      </Card>

      <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Network Density</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-chart-3">
            {typeof stats.avgBssidCount === "number" ? stats.avgBssidCount.toFixed(1) : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">Avg BSSID count</p>
        </CardContent>
      </Card>
    </div>
  )
}
