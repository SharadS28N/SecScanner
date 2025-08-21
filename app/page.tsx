"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { ThemeToggle } from "@/components/theme-toggle"
import { NetworkCard } from "@/components/network-card"
import { StatsGrid } from "@/components/stats-grid"
import { ScanAnimation } from "@/components/scan-animation"
import { Shield, Wifi, Search, AlertTriangle, CheckCircle, Activity } from "lucide-react"

interface NetworkData {
  ssid: string
  bssid: string
  signal: number
  suspicious: boolean
  confidence: number
}

interface ScanStats {
  totalNetworks: number
  suspiciousCount: number
  avgSignal: number
  avgBssidCount: number
}

export default function WiFiSecurityScanner() {
  const [networks, setNetworks] = useState<NetworkData[]>([])
  const [stats, setStats] = useState<ScanStats>({
    totalNetworks: 0,
    suspiciousCount: 0,
    avgSignal: 0,
    avgBssidCount: 0,
  })
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [filterSSID, setFilterSSID] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null)

  const handleScan = async () => {
    setIsScanning(true)
    setScanProgress(0)

    // Simulate scanning progress
    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 10
      })
    }, 200)

    try {
      const response = await fetch("http://localhost:5000/api/scan-wifi", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Scan failed")
      }

      const data = await response.json()
      setNetworks(data.networks)

      // Defensive: ensure all stats fields are numbers
      setStats({
        totalNetworks: typeof data.stats.totalNetworks === "number" ? data.stats.totalNetworks : 0,
        suspiciousCount: typeof data.stats.suspiciousCount === "number" ? data.stats.suspiciousCount : 0,
        avgSignal: typeof data.stats.avgSignal === "number" ? data.stats.avgSignal : 0,
        avgBssidCount: typeof data.stats.avgBssidCount === "number" ? data.stats.avgBssidCount : 0,
      })

      setLastScanTime(new Date())
    } catch (error) {
      console.error("Scan error:", error)
      alert("Failed to scan WiFi networks. Please ensure the Python script is working.")
    } finally {
      setTimeout(() => {
        setIsScanning(false)
        setScanProgress(0)
      }, 500)
    }
  }

  const filteredNetworks = networks.filter((network) => {
    const matchesSSID = network.ssid.toLowerCase().includes(filterSSID.toLowerCase())
    const matchesType =
      filterType === "all" ||
      (filterType === "suspicious" && network.suspicious) ||
      (filterType === "normal" && !network.suspicious)
    return matchesSSID && matchesType
  })

  useEffect(() => {
    handleScan() // Trigger real scan on mount
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-[var(--font-heading)]">SecScanner</h1>
              <p className="text-sm text-muted-foreground">Evil Twin Detector</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {lastScanTime && (
              <div className="text-sm text-muted-foreground">Last scan: {lastScanTime.toLocaleTimeString()}</div>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Scan Controls */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 font-[var(--font-heading)]">
              <Activity className="h-5 w-5" />
              <span>Network Scanner</span>
            </CardTitle>
            <CardDescription>
              Scan for nearby WiFi networks and detect potential evil twin access points
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleScan} disabled={isScanning} className="flex-1 pulse-glow" size="lg">
                {isScanning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                    Scanning Networks...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Start WiFi Scan
                  </>
                )}
              </Button>
            </div>

            {isScanning && (
              <div className="space-y-2">
                <Progress value={scanProgress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  Analyzing network patterns... {scanProgress}%
                </p>
              </div>
            )}
          </CardContent>

          {isScanning && <ScanAnimation />}
        </Card>

        {/* Statistics */}
        <StatsGrid stats={stats} />

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="font-[var(--font-heading)]">Network Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Filter by SSID..."
                  value={filterSSID}
                  onChange={(e) => setFilterSSID(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Networks</SelectItem>
                  <SelectItem value="suspicious">Suspicious Only</SelectItem>
                  <SelectItem value="normal">Normal Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Network Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-[var(--font-heading)]">Detected Networks</h2>
            <Badge variant="outline" className="text-sm">
              {filteredNetworks.length} networks found
            </Badge>
          </div>

          {filteredNetworks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Wifi className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No networks found</p>
                <p className="text-sm text-muted-foreground">Try scanning for networks or adjusting your filters</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredNetworks.map((network, index) => (
                <NetworkCard key={`${network.bssid}-${index}`} network={network} />
              ))}
            </div>
          )}
        </div>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle className="font-[var(--font-heading)]">How Evil Twin Detection Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <InfoItem icon={<CheckCircle />} title="AI-Powered Analysis" desc="Uses machine learning (Isolation Forest) to detect unusual network behavior patterns" />
              <InfoItem icon={<CheckCircle />} title="Historical Learning" desc="Builds a database of normal network patterns to identify anomalies" />
              <InfoItem icon={<CheckCircle />} title="BSSID Monitoring" desc="Tracks unique access points per network name to spot duplicates" />
              <InfoItem icon={<CheckCircle />} title="Signal Analysis" desc="Analyzes signal strength patterns to identify suspicious transmitters" />
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Security Tip:</strong> Regularly scan your environment to maintain an updated baseline of
                legitimate networks. Evil twin attacks often mimic trusted networks.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function InfoItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="space-y-2">
      <h4 className="font-semibold flex items-center">
        {icon}
        <span className="ml-2">{title}</span>
      </h4>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  )
}
